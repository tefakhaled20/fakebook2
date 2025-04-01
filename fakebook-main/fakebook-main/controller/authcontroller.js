const User = require('../models/user.model')
const sessionflash = require('../util/session-flash')
const validation = require('../util/validation')
const authUtil = require('../util/authentication')
const bcrypt = require('bcryptjs');
const Post =require('../models/post.model')
const db = require('../data/database');


function getsignup(req, res) {
  let sessionData = sessionflash.sessionData(req);
  if (!sessionData) {
    sessionData = {
      email: '',
      username: '',
      password: '',
      firstname: '',
      lastname: '',
      city: '',
    };
  }
  res.render('signup', { inputData: sessionData });
}

async function signup(req, res, next) {
  const userData = {
    email: req.body.email,
    password: req.body.password,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    username: req.body.username,
    country: req.body.country,
    city: req.body.city,
    image: req.file ? req.file.filename : null,
  };

  // Validate input
  if (!validation.validateUserSignup(userData)) {
    sessionflash.flasheddata(req, {
      errorMessage: 'Please fill out all required fields.',
      ...userData,
      password: '',
    }, () => {
      res.redirect('/signup');
    });
    return;
  }

  const user = new User(userData);

  try {
    const existingUser = await user.getUserWithSameEmail();
    if (existingUser) {
      sessionflash.flasheddata(req, {
        errorMessage: 'User already exists!',
        ...userData,
        password: '',
      }, () => {
        res.redirect('/signup');
      });
      return;
    }

    await user.save();

    // Create user session and redirect
    authUtil.createUserSession(req, user, () => {
      res.redirect('/UI');
    });
  } catch (error) {
    console.error('Signup error:', error);
    next(error);
  }
}

function getlogin(req, res) {
  let sessionData = sessionflash.sessionData(req);
  if (!sessionData) {
    sessionData = {
      email: '',
      password: '',
    };
  }
  res.render('login', { inputData: sessionData });
}

async function login(req, res, next) {
  const user = new User({ email: req.body.email, password: req.body.password });

  try {
    const existingUser = await user.getUserWithSameEmail();
    if (!existingUser) {
      sessionflash.flasheddata(req, {
        errorMessage: 'Invalid credentials!',
        email: user.email,
        password: '',
      }, () => {
        res.redirect('/login');
      });
      return;
    }

    const isPasswordCorrect = await user.hasMatchingPassword(existingUser.password);
    if (!isPasswordCorrect) {
      sessionflash.flasheddata(req, {
        errorMessage: 'Invalid credentials!',
        email: user.email,
        password: '',
      }, () => {
        res.redirect('/login');
      });
      return;
    }

    authUtil.createUserSession(req, existingUser, () => {
      res.redirect('/UI');
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
}



 function logout(req,res){
  authUtil.destroyUserAuthSession(req)
  res.redirect('/login')
 }






 async function UI(req,res){
  const userdata = await User.findById(req.session.uid)

  if (!userdata) {
    return res.redirect('/login'); 
  }
  const posts = await Post.findAll();

  res.render('UI', {
    userdata: userdata,
    posts: posts,
    csrfToken: res.locals.csrfToken,
})
 }






 async function userpost(req,res) {
  try {
    console.log('Post content received:', req.body.content); 
    
    if (!req.body.content) {
        console.error('Content is missing from request body');
        return res.status(400).json({ error: 'Content is required' });
    }
    const userdata = await User.findById(req.session.uid)


    const post = new Post({
        content: req.body.content,
        id: req.session.uid,
        username : userdata.username,
        image:userdata.image,
        imagePath: userdata.imagePath
    });

    console.log('Created post object:', post); 
    await post.save();
    res.redirect('/UI');
} catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
}
 }





 async function getprofiledata(req, res) {
  try {


      const user = await User.findById(req.session.uid); 
      
      if (!user) {
          return res.redirect('/login');
      }
      const posts = await Post.getuserposts(user.username);
      
      res.render('my-profile', {
          posts:posts,
          user: user,
          csrfToken: req.csrfToken() 
      });
  } catch (error) {
      console.error('Error fetching profile data:', error);
      next(error);
  }
}

async function postprofiledata(req, res, next) {
  const userId = req.session.uid;
  const updatedData = {
    ...req.body,
    image: req.file ? req.file.filename : undefined,
  };

  try {
    const user = await User.findById(userId);
    if (!user) {
      sessionflash.flasheddata(req, { errorMessage: 'User not found.' }, () => {
        res.redirect('/profile');
      });
      return;
    }

    await user.update(updatedData); // Use update method instead of save

    sessionflash.flasheddata(req, { successMessage: 'Profile updated successfully!' }, () => {
      res.redirect('/profile');
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    sessionflash.flasheddata(req, { errorMessage: 'Failed to update profile. Please try again.' }, () => {
      res.redirect('/profile');
    });
  }
}

async function likePost(req, res) {

  const  postId  = req.params.postId;
  const userId = req.session.uid; 

  try {
    await Post.likePost(postId, userId);
    const updatedPost = await Post.findById(postId);
    res.json({ success: true, likeCount: updatedPost.likeCount });
  } catch (error) {
    console.log(req.body)
    console.error('Error liking post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function unlikePost(req, res) {
  const  postId  = req.params.postId;
  const userId = req.session.uid; 
  try {
    await Post.unlikePost(postId, userId);
    const updatedPost = await Post.findById(postId);
    res.json({ success: true, likeCount: updatedPost.likeCount });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}


module.exports = {
    getsignup: getsignup,
    signup:signup,
    login:login,
    getlogin:getlogin,
    logout:logout,
    UI:UI,
    userpost:userpost,
    getprofiledata:getprofiledata,
   postprofiledata:postprofiledata,
   likePost:likePost,
   unlikePost:unlikePost
}