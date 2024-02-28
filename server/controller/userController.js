const User = require('../models/userSchema')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()
const nodemailer = require('nodemailer')
const Ads = require('../models/adsSchema')
const cloudinary = require('cloudinary')
const crypto = require('crypto-js')
const Connection = require('../models/connectionModel')
const webPush = require('web-push')
const Premium = require('../models/premiumModel')
const Report = require('../models/reportSchema')
const Call_log = require('../models/callLogSchema')
const Conversation = require('../models/conversationSchema')
const Messages = require('../models/messageSchema')

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

const registerUser = async (req, res) => {
    try {
        let { username, email, password, refferal } = req.body
        console.log(refferal);
        password = await makeHashed(password)
        const user = new User({
            username,
            email,
            password,
            invitedBy: refferal && atob(refferal)
        })
        if (await user.save()) {
            jwt.sign({ username, email }, process.env.JWT_SECRET, async (err, data) => {
                if (data) {
                    res.status(200).json({ message: "Registration success", token: data, success: true })
                }
                else {
                    throw new Error('Oops!,Something went wrong try again later').stack(err)
                }
            })
        } else {
            res.status(200).json({ message: "Oops!,Something went wrong", success: false })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Account is already exists', success: false })
    }
}
const OauthRegister = async (req, res) => {
    try {
        const data = req.body.data
        const userData = await User.findOne({ email: data.email })
        if (!userData) {
            const user = new User({
                username: data.name,
                email: data.email,
                isEmailVerified: data.email_verified,
                invitedBy: data.refferal && atob(data.refferal),
                avatar_url: data.picture
            })
            if (await user.save()) {
                jwt.sign({ username: user.username, email: user.email }, process.env.JWT_SECRET, async (err, data) => {
                    if (data) {
                        res.status(200).json({ message: "Registration success", token: data, success: true })
                    }
                    else {
                        throw new Error('Oops!,Something went wrong try again later').stack(err)
                    }
                })
            } else {
                res.status(200).json({ message: "Oops!,Something went wrong", success: false })
            }
        } else {
            res.json({ message: 'Account is already exists', success: false })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message, success: false })
    }
}
const makeHashed = async function (pass) {
    return await bcrypt.hash(pass, 10).then((data) => {
        return data
    }
    ).catch(err => {
        console.log(err);
        return false
    })
}
const compareHash = async (pass, hashedPass) => {
    const res = bcrypt.compare(pass, hashedPass)
    return res
}
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const userData = await User.findOne({ $or: [{ email: email }, { username: email }] })
        if (userData) {
            if (await compareHash(password, userData.password)) {
                if (userData.isBlocked) {
                    res.status(203).json({ message: "User suspended", success: false })
                } else {
                    jwt.sign({ username: userData.username, email: userData.email }, process.env.JWT_SECRET, async (err, data) => {
                        if (err) {
                            throw new Error('Oops!,Something went wrong').stack(err)
                        }
                        else if (!userData.isEmailVerified) {
                            res.status(203).json({ message: "Please verify your email", err: 'EMAILNOTVERERR', token: data, success: false })
                        }
                        else {
                            const connData = await Connection.findOne({ userId: userData._id })
                            if (connData) {
                                if (userData.logged_devices == 1 && connData) {
                                    req.io.to(connData.socketId).emit('logoutUser', { message: "User logged in another device" })
                                }
                            }
                            await User.findOneAndUpdate({ _id: userData._id }, { $set: { logged_devices: 1 } })
                            res.json({ message: "Login success", success: true, token: data })
                        }
                    })
                }
            } else {
                res.json({ message: "Incorrect password", success: false })
            }
        } else {
            res.status(203).json({ message: "User not exists", success: false })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message, success: false })
    }
}
const oAuthLoginUser = async (req, res) => {
    try {
        const { name, email } = req.body.data
        const userData = await User.findOne({ email })
        if (userData) {
            if (userData.isBlocked) {
                res.status(203).json({ message: "User suspended", success: false })
            } else {
                if (userData.invitedBy) {
                    const invData = await User.findOneAndUpdate({ email: userData.invitedBy }, { $push: { notifications: { type: "premium", message: "You got 150 chatpoints by refferal", time: Date.now(), isReaded: false } } })
                    await User.findOneAndUpdate({ email: userData.invitedBy }, { $inc: { chatpoints: 150 } })
                    connData = await Connection.findOne({ userId: invData._id })
                    if (connData) {
                        req.io.to(conData.socketId).emit('onUpdateNeeded')
                    }
                }
                jwt.sign({ username: userData.username, email: userData.email }, process.env.JWT_SECRET, async (err, data) => {
                    if (err) {
                        throw new Error('Oops!,Something went wrong').stack(err)
                    }
                    else if (!userData.isEmailVerified) {
                        res.status(203).json({ message: "Please verify your email", err: 'EMAILNOTVERERR', token: data, success: false })
                    }
                    else {
                        const connData = await Connection.findOne({ userId: userData._id })
                        if (connData) {
                            if (userData.logged_devices == 1 && connData) {
                                req.io.to(connData.socketId).emit('logoutUser', { message: "User logged in another device" })
                            }
                        }
                        await User.findOneAndUpdate({ _id: userData._id }, { $set: { logged_devices: 1 } })
                        if (userData.googleSynced == false) {
                            res.json({ message: "Login success", success: true, token: data, notSynced: true })
                        } else {
                            res.json({ message: "Login success", success: true, token: data })
                        }
                    }
                })
            }
        } else {
            res.status(203).json({ message: "User not exists", success: false })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message, success: false })
    }
}
const generateRandom = (length, numOnly) => {
    let alphaNum = !numOnly ? 'q1w3e56r7t89y90u45i7opasd45fg76h87j909kl89z56x34c76v87b34n2m1' : '3532847568457023489847673459873452476918045674567987459856765'
    let random = ''
    for (let i = 0; i < length; i++) {
        random += alphaNum[Math.floor(Math.random() * 60)]
    }
    return random
}
const sendOtp = async (req, res) => {
    try {
        let otp = generateRandom(5, true)
        await User.findOneAndUpdate({ email: req.userEmail, username: req.userName }, { $set: { 'auth.otp.value': otp, 'auth.otp.expireAt': Date.now() + 300000 } })
        const message = `Otp to verify your email : ${otp}`
        console.log(message);
        const mail = await sendMail(message, req.userEmail)
        if (mail) {
            res.status(200).json({ message: "Otp sent success", success: true })
        } else {
            res.status(203).json({ message: "Oops!,Something went wrong", success: false })
        }
    } catch (error) {
        console.log(error);
        res.status(203).json({ message: "Oops!,Something went wrong", success: false })
    }
}
const resendOtp = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.userEmail })
        let message;
        if (userData) {
            if (userData.auth.otp.value) {
                let otp = userData.auth.otp.value
                let expire = userData.auth.otp.expireAt
                if ((expire - Date.now()) >= 0) {
                    message = `Otp to verify your email : ${otp}`
                } else {
                    await User.findOneAndUpdate({ email: req.userEmail }, { $set: { 'auth.otp': {} } })
                    return res.json({ message: "Session expired please login again", success: false })
                }
            } else {
                const otp = generateRandom(5, true)
                await User.findOneAndUpdate({ email: req.userEmail }, { $set: { 'auth.otp.value': otp, 'auth.otp.expireAt': Date.now() + 50000 } })
                message = `Otp to verify your email : ${otp}`
            }
            const mail = await sendMail(message, req.userEmail)
            return res.json({ message: "Otp sent success", success: true })
        }
    } catch (error) {
        console.log(error.message);
    }
}
const sendMail = async (message, reciever, subject) => {
    try {
        console.log(message);
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            auth: {
                user: process.env.MAIL,
                pass: process.env.MAIL_PASS,
            },
        });
        const info = await transporter.sendMail({
            from: process.env.MAIL,
            to: reciever,
            subject: subject || "From SyncUp : Otp to verify your email",
            html: message,
        });
        return info.messageId
    } catch (error) {
        console.log(error);
        return false
    }
}

const verifyOtp = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.userEmail })
        const adminData = await User.findOne({ username: "syncup", isAdmin: true })
        if (userData.auth.otp.value == req.query.otp) {
            let expire = userData.auth.otp.expireAt
            if ((expire - Date.now()) >= 0) {
                if (userData.invitedBy) {
                    const invData = await User.findOneAndUpdate({ email: userData.invitedBy }, { $push: { notifications: { type: "premium", message: "You got 150 chatpoints by refferal", time: Date.now(), isReaded: false } } })
                    await User.findOneAndUpdate({ email: userData.invitedBy }, { $inc: { chatpoints: 150 } })
                    connData = await Connection.findOne({ userId: invData._id })
                    if (connData) {
                        req.io.to(connData.socketId).emit('onUpdateNeeded')
                    }
                }
                const newMessage = new Messages({
                    content: `Hi ${userData.username}, Welcome to syncup.You are at the right place if you are looking for a good platform to communicate.Don't forget to report any bugs at @syncupBot.....Happy Syncing.!!!`,
                    senderId: adminData._id,
                    recieverId: userData._id,
                    isMedia: false,
                    type: 'Welcome message',
                    isConfettiEnabled: true,
                })
                const savedMsg = await newMessage.save()
                await new Conversation({
                    participents: [adminData._id, userData._id],
                    messages: [savedMsg._id],
                    isBanned: true
                }).save()
                await User.findOneAndUpdate({ email: req.userEmail }, { $set: { isEmailVerified: true } })
                res.json({ success: true, message: "Yay you are all done!!" })
            } else {
                await User.findOneAndUpdate({ email: req.userEmail }, { $set: { 'auth.otp': {} } })
                return res.json({ message: "Otp expired please try again", success: false })
            }
        } else {
            res.json({ message: "Oops!, Incorrect otp", success: false })
        }
    } catch (error) {
        console.log(error.message);
        res.json({ message: "Oops!,Something went wrong", success: false })
    }
}
const sendReset = async (req, res) => {
    try {
        const emailPattern = new RegExp("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$")
        let email = req.query.user
        if (emailPattern.test(email)) {
            const userData = await User.findOne({ email })
            if (userData) {
                const token = generateRandom(20)
                let totalTry = (userData.auth?.token?.tryCount == 0 ? 1 : userData.auth?.token?.tryCount + 1) || 0
                console.log(totalTry);
                if (totalTry > 2) {
                    return res.json({ message: "Too many links sent try later", success: false })
                }
                await User.findOneAndUpdate({ email }, { $set: { 'auth.token.value': token, 'auth.token.expireAt': Date.now() + 300000, 'auth.token.tryCount': totalTry } })
                email = btoa(email)
                const message = `Link to reset your password : http://localhost:3000/resetPassword?token=${token}&&user=${email}`
                const mailData = await sendMail(message, atob(email), 'From SyncUp : Link to reset your password')
                if (mailData) {
                    res.json({ message: "Reset will be recieved (if user exists)", success: true })
                } else {
                    res.json({ message: "Something went wrong", success: false })
                }
            } else {
                res.json({ message: "Reset will be recieved (if user exists)", success: true })
            }
        }
    } catch (error) {
        res.json({ message: "Something went wrong", success: false })
        console.log(error);

    }
}
const checkSignature = async (req, res) => {
    try {
        const { token, user } = req.body
        const userData = await User.findOne({ email: user })
        if (userData && userData.auth.token.value) {
            if (userData.auth.token.value == token) {
                const expire = Date.now() - userData.auth.token.expireAt
                if (expire < 300000) {
                    res.json({ success: true, message: "Signature matched" })
                } else {
                    res.json({ message: "Token expired try again later", success: false })
                }
            } else {
                res.json({ message: "Signature verification failed!!" })
            }
        } else {
            res.json({ message: "Signature verification failed!!" })
        }
    } catch (error) {
        res.status(403).json({ message: "Something went wrong" })
    }
}
const changePasword = async (req, res) => {
    try {
        const { password, token, user } = req.body
        const userData = await User.findOne({ email: user })
        if (userData && userData.auth.token.value) {
            if (userData.auth.token.value == token) {
                const expire = Date.now() - userData.auth.token.expireAt
                if (expire < 300000) {
                    const hashedPass = await makeHashed(password)
                    const updateData = await User.findOneAndUpdate({ email: user }, { $set: { 'auth.token': {}, password: hashedPass } })
                    if (updateData) {
                        res.json({ success: true, message: "Password changed" })
                    }
                } else {
                    res.json({ message: "Token expired try again later", success: false })
                }
            } else {
                res.json({ message: "Signature verification failed!!" })
            }
        } else {
            res.json({ message: "Signature verification failed!!" })
        }
    } catch (error) {
        res.json({ message: "Something went wrong", success: false })
    }
}
const checkUsername = async (req, res) => {
    try {
        const username = req.query.username.toLowerCase()
        const userData = await User.findOne({ username })
        if (!userData) {
            res.json({ success: true })
        } else {
            res.json({ success: false, message: "Username is already taken" })
        }
    } catch (error) {
        res.staus(203).json({ success: false, message: "Something went wrong" })
    }
}
const getAds = async (req, res) => {
    try {
        const adsData = await Ads.aggregate([{ $match: { isUnlisted: false } }, { $sample: { size: 10 } }])
        const encrypted = encryptData(adsData)
        const userData = await User.findOne({ email: req.userEmail })
        const connData = await Connection.findOne({ userId: userData._id })
        if (connData) {
            req.io.to(connData.socketId).emit('onUpdateNeeded')
        }
        res.json({ success: true, body: encrypted })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
const checkUser = async (req, res) => {
    try {
        const { user } = req.query
        if (user) {
            const regex = { $regex: user, $options: 'i' }
            const userData = await User.find({ $or: [{ username: regex }, { email: regex }], isEmailVerified: true, email: { $ne: req.userEmail } })
            if (userData.length) {
                const googleSearch = await User.aggregate([{ $match: { email: req.userEmail } }, { $unwind: '$googleContacts' }, { $unwind: '$googleContacts.names' }, { $match: { 'googleContacts.names.displayName': regex } }, { $unwind: '$googleContacts.photos' }, { $project: { 'googleContacts.names.displayName': 1, 'googleContacts.photos.url': 1, 'googleContacts.emailAddresses': 1 } }])
                googleSearch.map((el, ind) => {
                    const obj = {
                        _id: ind,
                        avatar_url: el.googleContacts.photos.url,
                        username: el.googleContacts.names.displayName,
                        isPremium: false
                    }
                    userData.push(obj)
                })
                const encData = encryptData(userData)
                res.json({ success: true, body: encData })
            } else {
                const googleSearch = await User.aggregate([{ $match: { email: req.userEmail } }, { $unwind: '$googleContacts' }, { $unwind: '$googleContacts.names' }, { $match: { 'googleContacts.names.displayName': regex } }, { $unwind: '$googleContacts.photos' }, { $project: { 'googleContacts.names.displayName': 1, 'googleContacts.photos.url': 1 } }])
                const temp = googleSearch.map((el, ind) => {
                    return {
                        _id: ind,
                        avatar_url: el.googleContacts.photos.url,
                        username: el.googleContacts.names.displayName,
                        isPremium: false
                    }
                })
                const encData = encryptData(temp)
                res.json({ success: false, body: encData })
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ err: error.message })
    }
}
const encryptData = (data) => {
    return crypto.AES.encrypt(JSON.stringify(data), process.env.CRYPTO_SECRET).toString()
}
const addToContact = async (req, res) => {
    try {
        const { userId } = req.body
        const friendData = await User.findOne({ _id: userId })
        const userData = await User.findOne({ email: req.userEmail })
        if (friendData) {
            const updateUser = await User.findOneAndUpdate({ email: req.userEmail }, { $push: { contacts: { id: friendData._id, isAccepted: false, email: friendData.email } } })
            const friendUpdate = await User.findOneAndUpdate({ email: friendData.email }, { $push: { requests: { id: userData._id, isAccepted: false, email: userData.email }, notifications: { type: "request", userId: userData._id, email: userData.email, time: Date.now(), isReaded: false } } })
            if (updateUser && friendUpdate) {
                const ConnectData = await Connection.find({ userId: { $in: [userData._id, friendData._id] } })
                if (ConnectData) {
                    ConnectData.forEach((el) => {
                        req.io.to(el.socketId).emit('onUpdateNeeded')
                    })
                }
                res.json({ success: true, message: `Friend request sent` })
            } else {
                res.json({ success: false, message: `Something went wrong` })
            }
        } else {
            res.json({ success: false, message: `Something went wrong` })
        }
    } catch (error) {
        console.log(error.message);
        res.json({ message: error.message, success: false })
    }
}
const changeDp = async (req, res) => {
    try {
        let { img } = req.body
        if (img) {
            const userData = await User.findOneAndUpdate({ email: req.userEmail }, { $set: { avatar_url: img } })
            if (userData) {
                const connData = await Connection.findOne({ userId: userData._id })
                req.io.to(connData.socketId).emit('onUpdateNeeded')
                res.json({ message: "Profile pic updated", success: true })
            } else {
                res.json({ message: "Err while updating profile pic", success: false })
            }
        }else{
            res.json({success:false,message:"No img to update"})
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}
const cancellRequest = async (req, res) => {
    try {
        const { userId } = req.query
        const friendData = await User.findOne({ _id: userId })
        const userData = await User.findOne({ email: req.userEmail })
        if (friendData) {
            const updateUser = await User.findOneAndUpdate({ email: req.userEmail }, { $pull: { contacts: { id: friendData._id, isAccepted: false, email: friendData.email }, requests: { id: userData._id, isAccepted: false } } })
            const friendUpdate = await User.findOneAndUpdate({ email: friendData.email }, { $pull: { requests: { id: userData._id, isAccepted: false, email: userData.email }, notifications: { type: 'request', userId: userData._id, email: userData.email } } })
            if (updateUser && friendUpdate) {
                const ConnectData = await Connection.find({ userId: { $in: [userData._id, friendData._id] } })
                ConnectData.forEach((el) => {
                    req.io.to(el.socketId).emit('onUpdateNeeded')
                })
                res.json({ success: true, message: "Request cancelled" })
            } else {
                res.json({ success: false, message: `Something went wrong` })
            }
        } else {
            res.json({ success: false, message: `Something went wrong` })
        }
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
const getNoti = async (req, res) => {
    try {
        const notifications = await User.aggregate([{ $match: { email: req.userEmail } }, { $unwind: "$notifications" }, { $lookup: { from: 'users', localField: 'notifications.userId', foreignField: '_id', as: 'notiData' } }, { $project: { 'notifications': 1, 'notiData': 1, '_id': 1 } }])
        const requests = notifications.filter(el => el.notifications.type == 'request')
        const normal = notifications.filter(el => el.notifications.type != 'request')
        let notiToSend = [...normal]
        if (requests.length) {
            requests.forEach(el => {
                notiToSend.push({ ...el.notifications, email: el.notiData[0].email, userId: el.notiData[0]._id, avatar_url: el.notiData[0].avatar_url, username: el.notiData[0].username })
            })
        }
        if (notifications) {
            const userData = await User.findOne({ email: req.userEmail })
            await User.findOneAndUpdate({ email: req.userEmail }, { $set: { notifications: userData.notifications.map((el) => el = { ...el, isReaded: true }) } })
            const encData = encryptData(notiToSend)
            res.json({ success: true, body: encData })
        } else {
            res.json({ success: false })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message, success: false })
    }
}
const acceptReq = async (req, res) => {
    try {
        const { userId } = req.body
        const userData = await User.findOne({ email: req.userEmail })
        const friendData = await User.findOne({ _id: userId })
        if (userId) {
            await User.findOneAndUpdate({ email: req.userEmail }, { $pull: { requests: { id: userId, isAccepted: false } } })
            const updateUser = await User.findOneAndUpdate({ email: req.userEmail }, { $push: { requests: { id: userId, isAccepted: true, email: friendData.email }, contacts: { id: friendData._id, isAccepted: true, email: friendData.email } } })
            await User.findOneAndUpdate({ email: friendData.email }, { $pull: { contacts: { id: userData._id, isAccepted: false } } })
            const friendUpdate = await User.findOneAndUpdate({ email: friendData.email }, { $push: { contacts: { id: userData._id, isAccepted: true, email: userData.email }, notifications: { type: 'acceptRQ', message: `${userData.username} has accepted your friend request`, userId: userData._id, email: userData.email, avatar_url: userData.avatar_url, time: Date.now(), isReaded: false } } })
            if (updateUser && friendUpdate) {
                const ConnectData = await Connection.find({ userId: { $in: [userData._id, friendData._id] } })
                ConnectData.forEach((el) => {
                    req.io.to(el.socketId).emit('onUpdateNeeded')
                })
            } else {
                throw new Error('Something wrong with server')
            }

        }
    } catch (error) {
        res.json({ message: error.message, success: false })
    }
}
const removeContact = async (req, res) => {
    try {
        const { userId } = req.query
        const userData = await User.findOne({ email: req.userEmail })
        const friendData = await User.findOne({ _id: userId })
        if (friendData && userData) {
            const updateUser = await User.findOneAndUpdate({ email: req.userEmail }, { $pull: { contacts: { id: friendData._id }, notifications: { type: "request", userId: friendData._id }, requests: { id: friendData._id } } })
            const friendUpdate = await User.findOneAndUpdate({ email: friendData.email }, { $pull: { contacts: { id: userData._id }, notifications: { type: "acceptRQ", userId: userData._id }, requests: { userId: userData._id } } })
            if (updateUser && friendUpdate) {
                const ConnectData = await Connection.find({ userId: { $in: [userData._id, friendData._id] } })
                ConnectData.forEach((el) => {
                    req.io.to(el.socketId).emit('onUpdateNeeded')
                })
                res.json({ success: true })
            }
        }
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
const changeUsername = async (req, res) => {
    try {
        const { username } = req.body
        if (username) {
            const userData = await User.findOneAndUpdate({ email: req.userEmail }, { $set: { username } })
            if (userData) {
                return res.json({ message: "Username updated", success: true })
            }
        }
        return res.json({ message: "User is not authenticated" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Somthing went wrong" })
    }
}
const convertPointsToPremium = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.userEmail, isPremium: false })
        if (userData) {
            if (userData.chatpoints >= 499) {
                const updateData = await User.findOneAndUpdate({ email: req.userEmail }, { $set: { isPremium: true }, $inc: { chatpoints: -499 } }, { new: true })
                await new Premium({
                    userId: userData._id,
                    type: 'chatpoints',
                    price: 499,
                    expiresAt: new Date().getMonth() + 1,
                    paymentType: 'chatpoints',
                    paymentStatus: 'success',
                    paymentSessionId: `cp_${userData._id}`
                }).save()
                if (updateData) {
                    res.json({ success: true, message: "Welcome to premium membership" })
                } else {
                    res.json({ message: "Error while updating" })
                }
            } else {
                res.json({ message: "You don't have enough points" })
            }
        } else {
            res.json({ message: "You are already a premium member" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}
const saveContacts = async (req, res) => {
    try {
        const { contacts } = req.body
        if (contacts) {
            const userData = await User.findOneAndUpdate({ email: req.userEmail }, { $set: { googleContacts: contacts, googleSynced: true } })
            const googleSearch = await User.aggregate([{ $match: { email: req.userEmail } }, { $unwind: '$googleContacts' }, { $unwind: '$googleContacts.names' }, { $match: { 'googleContacts.names.displayName': regex } }, { $unwind: '$googleContacts.photos' }, { $project: { 'googleContacts.names.displayName': 1, 'googleContacts.photos.url': 1, 'googleContacts.emailAddresses': 1 } }])
            googleSearch.forEach(async el => {
                if (el.googleContacts.emailAddresses[0].value) {
                    await User.findOneAndUpdate({ email: req.userEmail }, { $push: { contacts: { isGoogleContact: true, email: el.googleContacts.emailAddresses[0].value, isAccepted: false } } })

                }
            })
            if (userData) {
                res.json({ success: true, message: "Contacts updated" })
            } else {
                res.json({ success: false, message: "Err while updating contacts" })
            }
        }
    } catch (error) {
        console.log(error);
    }
}
const getContacts = async (req, res) => {
    try {
        const contactData = await User.aggregate([{ $match: { email: req.userEmail } }, { $unwind: "$contacts" }, { $lookup: { from: "users", foreignField: "email", localField: "contacts.email", as: "contactData" } }, { $project: { 'contactData.username': 1, 'contactData.avatar_url': 1 } }])
        console.log(contactData);
    } catch (error) {
        res.json({ message: error.message })
    }
}
const makeFinishedRide = async (req, res) => {
    try {
        const userData = await User.findOneAndUpdate({ email: req.userEmail }, { $set: { joyRideFinished: true } })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
const reportContact = async (req, res) => {
    try {
        const { reason, userId } = req.body
        const user = await User.findById({ _id: userId })
        if (user) {
            const userData = await User.findOne({ email: req.userEmail })
            const existingReport = await Report.findOne({ userId, reportedBy: userData._id })
            if (!existingReport) {
                const report = new Report({
                    userId: user._id,
                    reportedBy: userData._id,
                    reason: reason || null
                })
                if (await report.save()) {
                    res.json({ success: true, message: "Your report have been submitted" })
                } else {
                    res.json({ success: false, message: "Err while reporting" })
                }
            } else {
                res.json({ success: false, message: "Another report is already on pending" })

            }
        }
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
const blockContact = async (req, res) => {
    try {
        const { userId } = req.body
        const user = await User.findById({ _id: userId })
        if (user) {
            const alreadyBlocked = await User.findOne({ email: req.userEmail, blockedContacts: { $elemMatch: { userId: user._id } } })
            if (!alreadyBlocked) {
                const userData = await User.findOneAndUpdate({ email: req.userEmail }, { $push: { blockedContacts: { userId: user._id, blockedAt: Date.now() } } })
                if (userData) {
                    const connectData = await Connection.findOne({ userId: user._id })
                    if (connectData) {
                        req.io.to(connectData.socketId).emit('conversationBlocked', { userId: user._id })
                    }
                    res.json({ success: true, message: 'User blocked' })
                } else {
                    res.json({ success: false, message: 'Err while blocking' })
                }
            } else {
                res.json({ success: false, message: 'User already blocked' })
            }
        } else {
            res.json({ success: false, message: 'Err while blocking' })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message })
    }
}
const unBlockContact = async (req, res) => {
    try {
        const { userId } = req.body
        if (userId) {
            const user = await User.findById({ _id: userId })
            const alreadyBlocked = await User.findOne({ email: req.userEmail, blockedContacts: { $elemMatch: { userId: user._id } } })
            if (alreadyBlocked) {
                const userData = await User.findOneAndUpdate({ email: req.userEmail }, { $pull: { blockedContacts: { userId: user._id } } })
                if (userData) {
                    const connectData = await Connection.findOne({ userId: user._id })
                    if (connectData) {
                        req.io.to(connectData.socketId).emit('conversationUnblocked', { userId: user._id })
                    }
                    res.json({ success: true, message: 'User Unblocked' })
                } else {
                    res.json({ success: false, message: 'Err while blocking' })
                }
            } else {
                res.json({ success: false, message: 'User already Unblocked' })
            }
        }
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const getCallLogs = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.userEmail })
        if (req.query.setRead) {
            console.log('setting read');
            await Call_log.updateMany({ to: userData._id.toString() }, { $addToSet: { readedParticipants: userData._id } })
        }

        // Removing conversationName after the usage to maintain consistancy
        await Call_log.updateMany({ $or: [{ from: userData._id.toString() }, { to: userData._id.toString() }] }, { $set: { conversationName: "expired" } })

        const callData = await Call_log.aggregate([{ $match: { $or: [{ from: userData._id.toString() }, { to: userData._id.toString() }], clearedParticipants: { $not: { $in: [userData._id] } } } }, { $project: { data: "$$ROOT", opponentId: { $cond: { if: { $eq: ['$from', userData._id.toString()] }, then: { $toObjectId: "$to" }, else: { $toObjectId: "$from" } } } } }, { $lookup: { from: "users", localField: "opponentId", foreignField: "_id", as: "opponentData" } }, { $unwind: "$opponentData" }, { $project: { 'opponentData.username': 1, 'opponentData._id': 1, 'opponentData.email': 1, 'opponentData.avatar_url': 1, opponentId: 1, data: 1 } }, { $sort: { 'data.createdAt': -1 } }]);
        const encData = encryptData(callData)
        if (encData) {
            res.json({ success: true, body: encData })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Err while getting logs' })
    }
}

const resetCalllogs = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.userEmail })
        if (userData) {
            const callData = await Call_log.updateMany({ $or: [{ from: userData._id.toString() }, { to: userData._id.toString() }] }, { $push: { clearedParticipants: userData._id } })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Err while resetting logs" })
    }
}

const toggleAfk = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.userEmail });
        if (userData) {
            userData.afk.isOn = !userData.afk.isOn;
            const savedUser = await userData.save();
            if (savedUser) {    
                res.json({ success: true, message: `Afk ${savedUser.afk.isOn ? "On" :"Off"}` });
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error while toggling afk" });
    }
}

const changeAfkMessage = async (req, res) => {
    try {
        const { message } = req.body
        if (message) {
            const userData = await User.findOneAndUpdate({ email: req.userEmail }, { $set: { 'afk.message': message } })
            if (userData) {
                res.json({ success: true, message: "Afk message updated" })
            }
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Err while changing message" })
    }
}

const checkContactByUsername = async(req,res)=>{
    try {
        const {username} = req.query
        if(username){
            const userData =await User.findOne({username})
            if(userData){
                const contactData = await User.find({email:req.userEmail,contacts:{$elemMatch:{id:userData._id}}})
                if(contactData.length){
                    return res.json({success:true})
                }
            }
        }
        return res.json({success:false})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

module.exports = {
    registerUser,
    loginUser,
    sendOtp,
    resendOtp,
    verifyOtp,
    sendReset,
    checkSignature,
    changePasword,
    compareHash,
    checkUsername,
    getAds,
    checkUser,
    addToContact,
    changeDp,
    cancellRequest,
    getNoti,
    acceptReq,
    removeContact,
    changeUsername,
    convertPointsToPremium,
    generateRandom,
    OauthRegister,
    oAuthLoginUser,
    encryptData,
    saveContacts,
    getContacts,
    makeFinishedRide,
    reportContact,
    blockContact,
    unBlockContact,
    getCallLogs,
    resetCalllogs,
    toggleAfk,
    changeAfkMessage,
    checkContactByUsername

}