const express = require('express');
const app = express.Router();
const adminController = require('../controller/adminController')
const isAdminAuth = require('../middlewares/isAdminAuth')

app.get('/isAlive',isAdminAuth,adminController.isAlive)
app.get('/sortData',isAdminAuth,adminController.sortData)
app.get('/getReports',isAdminAuth,adminController.getReports)
app.get('/getChats',isAdminAuth,adminController.getChats)
app.get('/getNotes',isAdminAuth,adminController.getNotes)

app.post('/login',adminController.checkAdmin)
app.post('/createAd',isAdminAuth,adminController.createAd)

app.put('/changeBlock',isAdminAuth,adminController.changeBlock)
app.put('/changeConversationBan',isAdminAuth,adminController.changeConversationBan)

app.delete('/resetMessages',isAdminAuth,adminController.resetMessages)


module.exports = app;
