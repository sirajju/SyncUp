const User = require('../models/userSchema')
const { compareHash, encryptData } = require('../controller/userController')
const jwt = require('jsonwebtoken')
const crypto = require('crypto-js')
const Ads = require('../models/adsSchema')
const cloudinary = require('cloudinary')
const Connection = require('../models/connectionModel')
const Reports = require('../models/reportSchema')
const Conversation = require('../models/conversationSchema')
const Messages = require('../models/messageSchema')
const Notes = require('../models/noteSchema')
const Broadcasts = require('../models/broadcastSchema')
const _ = require('lodash')

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
                    dataToSend.reports = await Reports.find().count()
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
            const encData = encryptData(dataToSend)
            res.json({ success: true, body: encData })
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
        const { user, state } = req.body
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
            const encData = encryptData(sortedData)
            res.json({ success: true, body: encData })
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
const getReports = async (req, res) => {
    try {
        const reports = await Reports.aggregate([{ $addFields: { 'userObjectId': { $toObjectId: "$userId" }, 'reportedUserObjectId': { $toObjectId: "$reportedBy" } } }, { $lookup: { from: "users", localField: 'userObjectId', foreignField: "_id", as: "userData" } }, { $unwind: "$userData" }, { $lookup: { from: "users", localField: "reportedUserObjectId", foreignField: "_id", as: "reportedUser" } }, { $unwind: "$reportedUser" }, { $project: { _id: 1, reason: 1, reportedUser: 1, reportedAtString: 1, isRejected: 1, 'userData.username': 1, 'userData.email': 1, 'userData.avatar_url': 1, 'reportedUsername': '$reportedUser.username', 'reportedUserEmail': '$reportedUser.email', 'reportedUserAvatar_url': '$reportedUser.avatar_url', type: 1 } }, { $project: { reportedUser: 0 } }])
        if (reports) {
            const encReports = encryptData(reports)
            if (encReports) {
                res.json({ success: false, body: encReports })
            }
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Err while getting reports" })
    }
}

const getChats = async (req, res) => {
    try {
        const conversation = await Conversation.aggregate([{ $unwind: "$participents" }, { $lookup: { from: "users", localField: "participents", foreignField: "_id", as: "participantsData" } }, { $unwind: "$participantsData" }, { $project: { 'participantsData.username': 1, 'participantsData.email': 1, type: 1, startedAt: 1, startedAtString: 1, isLocked: 1, isBanned: 1, messages: { $size: "$messages" } } }, { $group: { _id: "$_id", participantsData: { $push: "$participantsData" }, startedAt: { $first: "$startedAt" }, isBanned: { $first: "$isBanned" }, startedAtString: { $first: "$startedAtString" }, messages: { $first: "$messages" }, type: { $first: "$type" } } }, { $sort: { startedAt: 1 } }])
        if (conversation) {
            const encData = encryptData(conversation)
            res.json({ success: true, body: encData })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Err while getting chats" })
    }
}

const changeConversationBan = async (req, res) => {
    try {
        const { chatId } = req.body
        const conversation = await Conversation.findById({ _id: chatId })
        if (chatId) {
            conversation.isBanned = !conversation.isBanned
            if (await conversation.save()) {
                res.json({ success: true, message: `Conversation ${!conversation.isBanned ? "Unbanned" : "Banned"}` })
            }
            const connections = await Connection.find({ userId: { $in: conversation.participents } })
            connections.forEach(el => {
                req.io.to(el.socketId).emit(conversation.isBanned ? "conversationBlocked" : "conversationUnblocked")
            })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Err while change block" })
    }
}

const getNotes = async (req, res) => {
    try {
        const notesData = await Notes.aggregate([{ $addFields: { userObjectId: { $toObjectId: "$userId" } } }, { $lookup: { from: "users", localField: "userObjectId", foreignField: "_id", as: "userData" } }, { $unwind: "$userData" }, { $project: { 'userData.username': 1, 'userData.email': 1, 'userData._id': 1, 'userData.avatar_url': 1, 'content': 1, 'createdAt': 1, 'likes': 1, blockedUsers: 1, isExpired: 1, expireAtString: 1, visibility: 1, expiresAt: 1 } }, { $sort: { createdAt: -1 } }])
        console.log(notesData);
        if (notesData) {
            const encData = encryptData(notesData)
            res.json({ success: true, body: encData })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Err while getting chats" })
    }
}

const resetMessages = async (req, res) => {
    try {
        const { chatId } = req.query
        if (chatId) {
            const conversation = await Conversation.findById({ _id: chatId })
            if (conversation) {
                const conversationUpdate = await Messages.updateMany({ $or: [{ senderId: { $in: conversation.participents } }, { recieverId: { $in: conversation.participents } }] }, { $set: { isCleared: true } })
                if (conversationUpdate) {
                    conversation.messages = []
                    await conversation.save()
                    res.json({ success: true, message: "Messages restted" })
                }
            }
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Err while resetting" })
    }
}

const archiveNote = async (req, res) => {
    try {
        const { noteId } = req.query
        if (noteId) {
            const noteData = await Notes.findByIdAndUpdate({ _id: noteId }, { $set: { isExpired: true } })
            if (noteData) {
                res.json({ success: true, message: "Note archived" })
            }
        }
    } catch (error) {
        res.json({ success: false, message: "Err while archiving note" })
    }
}

const createBroadcast = async (req, res) => {
    try {
        const { data } = req.body
        if (data) {
            const adminData = await User.findOne({ username: "syncup", isAdmin: true })
            if (data.contentType == 'banned' && data.persons) {
                let content = 'You will be banned because of violation on user guidlines.To unban your account contact us with valid reason.'
                const personsData = await User.find({ $or: [{ username: { $in: data.persons } }, { email: { $in: data.persons } }] })
                if (personsData.length) {
                    personsData.forEach(async el => {
                        const newMessage = new Messages({
                            content: null,
                            senderId: adminData._id,
                            recieverId: null,
                            isMedia: data.media ? true : false,
                            mediaConfig: data.media ? {
                                url: data.media
                            } : {},
                        })
                        const newConversation = new Conversation({
                            participents: [adminData._id],
                            messages: [],
                            type: "bannedAnnouncment",
                            isConfettiEnabled: data.isParyEnabled,
                            isBanned: true
                        })
                        const ExistsData = await Conversation.findOne({ participents: { $all: [adminData._id, el._id] } })
                        newMessage.recieverId = el._id
                        newMessage.content = content
                        const savedMsg = await newMessage.save()
                        if (!ExistsData) {
                            newConversation.participents.push(el._id)
                            if (savedMsg) {
                                newConversation.messages.push(savedMsg._id)
                                await newConversation.save()
                            }
                        } else {
                            ExistsData.messages.push(savedMsg._id)
                            ExistsData.isConfettiEnabled = data.isParyEnabled
                            await ExistsData.save()
                        }
                    })
                }
            }
            else if (['broadcast', 'excluded', 'personal'].includes(data.type)) {
                let users;
                console.log(data);
                switch (data.type) {
                    case "broadcast":
                        users = await User.find()
                        break;
                    case "excluded":
                        users = await User.find({ $or: [{ username: { $nin: data.exclude } }, { email: { $nin: data.exclude } }] })
                        break;
                    case "personal":
                        users = await User.find({ $or: [{ username: { $in: data.persons } }, { email: { $in: data.persons } }] })
                        break;
                    default:
                        throw new Error('Something went wrong')
                }
                users.forEach(async el => {
                    const ExistsConvo = await Conversation.findOne({ participents: { $all: [adminData._id, el._id] } })
                    const newMessage = new Messages({
                        content: data.caption,
                        senderId: adminData._id,
                        recieverId: el._id,
                        isMedia: data.media ? true : false,
                        mediaConfig: data.media ? {
                            url: data.media
                        } : {},
                    })
                    const savedMsg = await newMessage.save()
                    if (!ExistsConvo) {
                        const newConversation = new Conversation({
                            participents: [adminData._id, el._id],
                            messages: [],
                            type: "bannedAnnouncment",
                            isConfettiEnabled: data.isParyEnabled,
                            isBanned: true
                        })
                        if (savedMsg) {
                            newConversation.messages.push(savedMsg._id)
                            await newConversation.save()
                        }
                    } else {
                        ExistsConvo.messages.push(savedMsg._id)
                        ExistsConvo.isConfettiEnabled = data.isParyEnabled
                        await ExistsConvo.save()
                    }
                })
            }
        }
        res.json({ success: true, message: "Hello world" })
    } catch (error) {
        console.log(error);
        res.json({ success: false })
    }
}

const getBroadcasts = async (req, res) => {
    try {
        const broadcastData = await Broadcasts.find()
        if (broadcastData) {
            const encData = encryptData(broadcastData)
            res.json({ success: true, body: encData })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Err while getting broadcast" })
    }
}

module.exports = {
    checkAdmin,
    isAlive,
    changeBlock,
    sortData,
    createAd,
    getReports,
    getChats,
    changeConversationBan,
    getNotes,
    resetMessages,
    archiveNote,
    createBroadcast,
    getBroadcasts
}