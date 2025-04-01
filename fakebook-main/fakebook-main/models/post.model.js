const db = require('../data/database');
const mongodb = require('mongodb');
const user= require('./user.model')
const ObjectId = mongodb.ObjectId;

class Post {
    constructor(postData) {
      this.image = postData.image;
      this.imagePath = `/users_img/${this.image}`;
      this.username =postData.username
      this.content = postData.content;
      this.timestamp = new Date();
      
      if (postData._id) {
        this.id = postData._id.toString();
        this._id = postData._id.toString(); 
      }

      this.likeCount = postData.likeCount || 0;
      this.likedBy = postData.likedBy || [];
    }

    static async findAll() {
        const posts = await db.getDb().collection('posts').find().toArray();
        return posts.map(function (postData) {
          return {
            ...postData,
            _id: postData._id.toString() // Ensure _id is converted to string
          };
        });
    }

    static async getuserposts(username) {
      try {
        if (!username) {
          console.error('getuserposts: No username provided');
          return [];
        }
        
        const posts = await db.getDb().collection('posts')
          .find({username: username})
          .sort({timestamp: -1}) // Sort by newest first
          .toArray();
        
        return posts.map(function (postData) {
          return {
            ...postData,
            _id: postData._id.toString() // Ensure _id is converted to string
          };
        });
      } catch (error) {
        console.error('Error in getuserposts:', error);
        throw error;
      }
    }
    static async findById(postId) {
      try {
        let objectId;
        try {
          objectId = new ObjectId(postId);
        } catch (error) {
          console.error('Invalid ObjectId:', postId);
          return null;
        }

        const postData = await db
          .getDb()
          .collection('posts')
          .findOne({ _id: objectId });

        if (!postData) {
          return null;
        }

        return {
          ...postData,
          _id: postData._id.toString()
        };
      } catch (error) {
        console.error('Error in findById:', error);
        throw error;
      }
    }



    async save() {

      const postData = {
        image:this.image,
        imagePath:this.imagePath,
        username:this.username,
        content: this.content,
        timestamp: this.timestamp,
        likeCount: this.likeCount,
        likedBy: this.likedBy,
      };
      
      await db.getDb().collection('posts').insertOne(postData);
    }

    static async likePost(postId, userId) {
      console.log('Attempting to like post:', postId, 'by user:', userId);
      
      let objectId;
      try {
        objectId = new ObjectId(postId);
      } catch (error) {
        throw new Error('Invalid post ID format');
      }

      const post = await db.getDb().collection('posts').findOne({ _id: objectId });

      if (!post) {
        throw new Error('Post not found');
      }

      // Initialize likedBy array if it doesn't exist
      if (!post.likedBy) {
        post.likedBy = [];
      }

      // Check if user already liked the post
      if (post.likedBy.includes(userId)) {
        throw new Error('User already liked this post');
      }

      // Update likeCount and likedBy array
      const result = await db.getDb().collection('posts').updateOne(
        { _id: objectId },
        {
          $inc: { likeCount: 1 },
          $push: { likedBy: userId }
        }
      );

      if (result.modifiedCount === 0) {
        throw new Error('Failed to update like count');
      }

      return await this.findById(postId);
    }

    static async unlikePost(postId, userId) {
      let objectId;
      try {
        objectId = new ObjectId(postId);
      } catch (error) {
        throw new Error('Invalid post ID format');
      }

      const post = await db.getDb().collection('posts').findOne({ _id: objectId });

      if (!post) {
        throw new Error('Post not found');
      }

      if (!post.likedBy || !post.likedBy.includes(userId)) {
        throw new Error('User has not liked this post');
      }

      const result = await db.getDb().collection('posts').updateOne(
        { _id: objectId },
        {
          $inc: { likeCount: -1 },
          $pull: { likedBy: userId }
        }
      );

      if (result.modifiedCount === 0) {
        throw new Error('Failed to update like count');
      }

      return await this.findById(postId);
    }


    
}

module.exports = Post;