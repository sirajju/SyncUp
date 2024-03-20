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
        const userData = await User.findOne({ $or: [{ email }, { username }] }, { googleContacts: 0 })
        if (userData) {
            if (userData.isBlocked) {
                await User.findOneAndUpdate({ email }, { $set: { logged_devices: 0 } })
                res.status(203).json({ message: "User suspended", success: false })
                const connData = await Connection.findOne({ userId: userData._id })
            } else {
               await User.findOneAndUpdate({ email: userData.email }, { $set: { last_seen: Date.now() } })
                req.userEmail = email
                req.userName = username
                next()
            }
        } else {
            res.status(203).json({ message: "Session expired", success: false })
        }
    } catch (error) {
        console.log(error);
        res.status(203).json({ message: "Session expired", success: false })
    }
}