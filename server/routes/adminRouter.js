const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController')
const isAdminAuth = require('../middlewares/isAdminAuth')

router.get('/isAlive',isAdminAuth,adminController.isAlive)
router.get('/changeBlock',isAdminAuth,adminController.changeBlock)
router.get('/sortData',isAdminAuth,adminController.sortData)

router.post('/login',adminController.checkAdmin)
router.post('/createAd',isAdminAuth,adminController.createAd)

module.exports = router;
