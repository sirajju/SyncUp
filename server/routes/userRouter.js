const express = require('express');
const app = express();
const userController = require('../controller/userController');
const messageController = require('../controller/messageController')
const paymentController = require('../controller/paymentController')
const isAuth = require('../middlewares/isAuth');

app.get('/sendReset',userController.sendReset);
app.get('/checkUsername',userController.checkUsername);
app.get('/isAlive',isAuth)
app.get('/getAds',isAuth,userController.getAds)
app.get('/getContacts',isAuth,userController.getContacts)
app.get('/sendOtp',isAuth,userController.sendOtp);
app.get('/resendOtp',isAuth,userController.resendOtp);
app.get('/verifyOtp',isAuth,userController.verifyOtp);
app.get('/checkUser',isAuth,userController.checkUser);
app.get('/getNotifications',isAuth,userController.getNoti);
app.get('/getUserInfo',isAuth,messageController.getUserInfo);
app.get('/getConversation',isAuth,messageController.getConversation);
app.get('/getCurrentConversations',isAuth,messageController.getCurrentConversations);
app.get('/makeMsgSeen',isAuth,messageController.makeMsgSeen);
app.get('/verifyPremium',isAuth,paymentController.verifyPremium);

app.post('/register',userController.registerUser);
app.post('/OauthRegister',userController.OauthRegister);
app.post('/OauthLogin',userController.oAuthLoginUser);
app.post('/login',userController.loginUser);
app.post('/verifyChangePassword',userController.checkSignature)
app.post('/addToContact',isAuth,userController.addToContact)
app.post('/changeDp',isAuth,userController.changeDp)
app.post('/saveContacts',isAuth,userController.saveContacts)
app.post('/sendMessage',isAuth,messageController.sendMessage)
app.post('/sendMediaMessage',isAuth,messageController.sendMediaMessage)
app.post('/stripePaymentSession',isAuth,paymentController.createPaymentSession)
app.post('/reportContact',isAuth,userController.reportContact)
app.post('/blockContact',isAuth,userController.blockContact)
app.post('/unBlockContact',isAuth,userController.unBlockContact)

app.put('/joyrideFinished',isAuth,userController.makeFinishedRide)

app.patch('/changePass',userController.changePasword)
app.patch('/convertPointsToPremium',isAuth,userController.convertPointsToPremium);
app.patch('/acceptReq',isAuth,userController.acceptReq)
app.patch('/changeUsername',isAuth,userController.changeUsername)

app.delete('/cancellRequest',isAuth,userController.cancellRequest)
app.delete('/paymentCancelled',isAuth,paymentController.paymentCancelled);
app.delete('/removeContact',isAuth,userController.removeContact)
app.delete('/deleteMessage',isAuth,messageController.deleteMessage)


module.exports = app;
