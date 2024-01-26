const User = require('../models/userSchema')
const { compareHash } = require('../controller/userController')
const jwt = require('jsonwebtoken')
const crypto = require('crypto-js')
const Ads = require('../models/adsSchema')
const cloudinary = require('cloudinary')
const Connection = require('../models/connectionModel')

cloudinary.config({
    cloud_name: 'djjuaf3cz',
    api_key: '657333573719497',
    api_secret: 'jc6Kyvc0LpG0XtEY4ehmm89JZRY'
});
const opts = {
    overwrite: true,
    invalidate: true,
    resource_type: "auto",
};

const checkAdmin = async (req, res) => {
    try {
        const { username, password } = req.body
        const adminData = await User.findOne({ email: username, isAdmin: true, isBlocked: false })
        if (adminData) {
            const hashPass = await compareHash(password, adminData.password)
            if (hashPass) {
                jwt.sign({ email: adminData.email, username: adminData.username }, process.env.JWT_SECRET_ADMIN, (err, data) => {
                    if (data) {
                        res.json({ success: true, message: `Welcome admin ${adminData.username}`, token: data })
                    } else {
                        throw new Error('Something went wrong').stack(err)
                    }
                })

            } else {
                res.json({ success: false, message: "Incorrect username or password" })
            }
        } else {
            res.json({ success: false, message: 'Incorrect username or password' })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Something went wrong' })
    }
}
const isAlive = async (req, res) => {
    try {
        // const adminData =await User.findOne({email:req.adminEmail,username:req.userName})
        if (req.query.getData && req.query.ref) {
            let dataToSend = {}
            switch (req.query.ref) {
                case "Dashboard":
                    dataToSend.users = await User.find({}).count()
                    dataToSend.business = await User.find({ isBusiness: true }).count()
                    dataToSend.premium = await User.find({ isPremium: true }).count()
                    dataToSend.blocked = await User.find({ isBlocked: true }).count()
                    break;
                case "Users":
                    dataToSend = await User.find({ isAdmin: false })
                    break;
                case 'Ads':
                    dataToSend = await Ads.find()
                    break;
                default:
                    throw new Error()
            }
            console.log(dataToSend.length);
            const encData = crypto.AES.encrypt(JSON.stringify(dataToSend), 'syncupservercryptokey')
            res.json({ success: true, body: encData.toString() })
        } else {
            res.json({ success: true })
        }
    } catch (err) {
        console.log(err);
        res.json({ message: "Something went wrong", success: false })
    }
}
const changeBlock = async (req, res) => {
    try {
        const { user, state } = req.query
        const userData = await User.findOneAndUpdate({ email: user }, { $set: { isBlocked: state == 'block' } })
        if (userData) {
            const connectData = await Connection.findOne({ userId: userData._id })
            if (connectData) {
                req.io.to(connectData.socketId).emit('onUpdateNeeded')
                await Connection.findOneAndDelete({ userId: userData._id })
            }
            res.json({ success: true, message: `User ${state}ed` })
        } else {
            throw new Error()
        }
    } catch (error) {
        console.log(error);
        res.json({ message: "Something went wrong", success: false })
    }
}
const sortData = async (req, res) => {
    try {
        const { by } = req.query
        let payload;
        switch (by) {
            case "Name":
                payload = { username: 1 }
                break
            case "Blocked":
                payload = { isBlocked: 1 }
                break
        }
        const sortedData = await User.aggregate([{ $sort: payload }])
        if (sortData) {
            const encData = crypto.AES.encrypt(JSON.stringify(sortedData), 'syncupservercryptokey')
            res.json({ success: true, body: encData.toString() })
        }
    } catch (error) {
        console.log(error);
        res.json({ message: "Something went wrong", success: false })
    }
}
const createAd = async (req, res) => {
    try {
        const { adData } = req.body
        if (adData) {
            const { secure_url } = await cloudinary.v2.uploader.upload(adData.img, opts)
            const newAd = new Ads({
                name: adData.ad_name,
                title: adData.ad_title,
                redirect_url: adData.ad_redirect_url,
                image_url: secure_url
            })
            if (await newAd.save()) {
                res.json({ message: "Ad unit added", success: true })
            } else {
                res.json({ message: "Something went wrong", success: false })
            }
        } else {
            res.json({ message: "No data to add", success: false })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Something went wrong" })
    }
}
module.exports = {
    checkAdmin,
    isAlive,
    changeBlock,
    sortData,
    createAd
}