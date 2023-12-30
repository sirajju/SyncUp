const express = require('express');
const app = express();
const userController = require('../controller/userController');
const isAuth = require('../middlewares/isAuth');

app.get('/sendReset',userController.sendReset);
app.get('/checkUsername',userController.checkUsername);
app.get('/isAlive',isAuth)
app.get('/getAds',isAuth,userController.getAds)
app.get('/sendOtp',isAuth,userController.sendOtp);
app.get('/resendOtp',isAuth,userController.resendOtp);
app.get('/verifyOtp',isAuth,userController.verifyOtp);
app.get('/checkUser',isAuth,userController.checkUser);
app.get('/getNotifications',isAuth,userController.getNoti);

app.post('/register',userController.registerUser);
app.post('/login',userController.loginUser);
app.post('/verifyChangePassword',userController.checkSignature)
app.post('/changePass',userController.changePasword)
app.post('/addToContact',isAuth,userController.addToContact)
app.post('/cancellRequest',isAuth,userController.cancellRequest)
app.post('/changeDp',isAuth,userController.changeDp)
app.post('/acceptReq',isAuth,userController.acceptReq)
app.post('/removeContact',isAuth,userController.removeContact)
app.post('/changeUsername',isAuth,userController.changeUsername)

module.exports = app;
