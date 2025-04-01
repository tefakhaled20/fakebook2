const express = require('express')
const controller = require('../controller/authcontroller')
const routeguard = require('../middelwares/route-guard')
const imageUpload = require('../middelwares/image-upload')
const router =express.Router()

router.get('/',function(req,res){
    res.render('home')
})
router.get('/signup' ,controller.getsignup)
router.post('/signup',imageUpload , controller.signup)
router.get('/login',controller.getlogin)
router.post('/login',controller.login)
router.post('/logout',controller.logout)
router.get('/UI',routeguard,controller.UI)
router.post('/UI',controller.userpost)
router.get('/profile/:id',controller.getprofiledata)
router.post('/profile/:id',controller.postprofiledata)  
router.post('/likePost/:postId', routeguard, controller.likePost); // Protect with routeguard
router.post('/unlikePost/:postId', routeguard, controller.unlikePost);

module.exports=router