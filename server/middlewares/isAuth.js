const User = require('../models/userSchema')
const express = require('express')
const jwt = require('jsonwebtoken')
const crypto = require('crypto-js')
const Connection = require('../models/connectionModel')
const Message = require('../models/messageSchema')

module.exports = async function (req, res, next) {
    try {
        const token = req.headers['authorization'].split('Bearer')[1].trim()
        const { username, email } = jwt.verify(token, process.env.JWT_SECRET)
        const userData = await User.findOne({ $or: [{ email }, { username }] })
        if (userData) {
            if (userData.isBlocked) {
                await User.findOneAndUpdate({ email }, { $set: { logged_devices: 0 } })
                res.status(203).json({ message: "User suspended", success: false })
                const connData = await Connection.findOne({userId:userData._id})
            } else {
                const ls = await User.findOneAndUpdate({ email: userData.email }, { $set: { last_seen: Date.now() } })
                if (req.path == '/isAlive') {
                    if (!userData.isEmailVerified) {
                        res.status(200).json({ success: false, err: "EMAILNOTVERERR", message: "Email is not verified yet!!" })
                    }
                    else if (req.query.getData) {
                        const encData = crypto.AES.encrypt(JSON.stringify(userData), process.env.CRYPTO_SECRET)
                        res.status(200).json({ body: encData.toString(), success: true })
                    }
                    else {
                        res.status(200).json({ success: true })
                    }
                } else {
                    req.userEmail = email
                    req.userName = username
                    next()
                }
            }
        } else {
            res.status(203).json({ message: "Session expired", success: false })
        }
    } catch (error) {
        console.log(error);
        res.status(203).json({ message: "Session expired", success: false })
    }
}