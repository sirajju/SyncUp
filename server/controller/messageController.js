const User = require('../models/userSchema')
const bcrypt = require('bcrypt')
require('dotenv').config()
const cloudinary = require('cloudinary')
const crypto = require('crypto-js')
const Connection = require('../models/connectionModel')
const Conversation = require('../models/conversationSchema')
const Message = require('../models/messageSchema')
const Room = require('../models/roomModel')
const Note = require('../models/noteSchema')
const { encryptData } = require('./userController')
const { ObjectId } = require('mongodb')

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

const getUserInfo = async (req, res) => {
    try {
        const { userId } = req.query
        if (userId) {
            const userData = await User.findOne({ _id: userId })
            if (userData) {
                const encData = crypto.AES.encrypt(JSON.stringify(userData), process.env.CRYPTO_SECRET)
                res.json({ success: true, body: encData.toString() })
            }
        } else {
            res.json({ success: false })
        }
    } catch (error) {
        res.json({ message: error.message, success: false })
        console.log(error.message);
    }
}
const getConversation = async (req, res) => {
    try {
        const { recieverId } = req.query;
        if (recieverId) {
            try {
                const userData = await User.findOne({ email: req.userEmail });
                const recieverData = await User.findOne({ _id: recieverId });
                await Message.updateMany({ senderId: recieverData._id, recieverId: userData._id }, { $set: { isReaded: true } })
                const conversationData = await Conversation.findOne({
                    $or: [
                        { participents: [userData._id, recieverData._id] },
                        { participents: [recieverData._id, userData._id] }
                    ]
                });
                if (conversationData) {
                    const messageData = await Message.find({
                        senderId: { $in: [userData._id, recieverData._id] },
                        recieverId: { $in: [userData._id, recieverData._id] },
                    }).sort({ sentTime: 1 });
                    const connectData = await Connection.findOne({ userId: recieverData._id })
                    if (connectData) {
                        req.io.to(connectData.socketId).emit('msgSeen')
                    }
                    const encData = encryptData(messageData)
                    res.json({ success: true, isExists: true, body: encData })
                } else {
                    res.json({ success: true, isExists: false });
                }
            } catch (error) {
                console.error(error);
                res.json({ success: false, message: "An error occurred while fetching messages." });
            }
        } else {
            res.json({ success: false, message: "Look like something is missing" });
        }
    } catch (error) {
        console.log(error);
        res.json({ message: error.message })
    }
}
const sendMessage = async ({ recieverId, content, userEmail }) => {
    try {
        if (recieverId && content) {
            const userData = await User.findOne({ email: userEmail })
            const recieverData = await User.findOne({ _id: recieverId })
            const conversationData = await Conversation.findOne({ participents: { $all: [userData._id, recieverData._id] } })
            const newMessage = new Message({
                senderId: userData._id,
                recieverId,
                content,
                sentTime: Date.now(),
                isDelivered: false,
                isReaded: false,
                isDeleted: false,
                isSent: true
            })
            if (!conversationData) {
                await new Conversation({
                    participents: [userData._id, recieverData._id],
                    type: 'personal',
                }).save()
            }
            else if(conversationData.isBanned){
                return false
            }
            await newMessage.save()
            await Conversation.findOneAndUpdate({
                $or: [
                    { participents: [userData._id, recieverData._id] },
                    { participents: [recieverData._id, userData._id] }
                ]
            }, { $push: { messages: newMessage._id } })
            return { newMessage }
        }
        return false
    } catch (error) {
        console.log(error);
        return false
    }
}
const getCurrentConversations = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.userEmail })
        const conversationData = await Conversation.aggregate([{ $match: { participents: { $in: [userData._id] } } }, { $unwind: '$participents' }, { $match: { 'participents': { $ne: userData._id } } }, { $lookup: { from: 'users', localField: 'participents', foreignField: '_id', as: "opponent" } }, { $lookup: { from: 'messages', foreignField: '_id', localField: 'messages', as: "messages" } }, { $project: { _id: 1, isBanned:1,opponent: 1, startedAt: 1, updatedAt: 1, messages: 1, last_message: { $slice: ['$messages', -1] } } }, { $sort: { updatedAt: -1 } }])
        if (conversationData) {
            await Message.updateMany({ recieverId: userData._id }, { $set: { isDelivered: true } })
            const dlvrData = await Conversation.aggregate([{ $match: { participents: { $in: [userData._id] } } }, { $unwind: '$participents' }, { $match: { 'participents': { $ne: userData._id } } }, { $project: { participents: 1 } }])
            dlvrData.forEach(async (el) => {
                const connectData = await Connection.findOne({ userId: el.participents })
                if (connectData) {
                    req.io.to(connectData.socketId).emit('msgDelivered', { recieverId: userData._id })
                }
            })
            const encData = encryptData(conversationData)
            res.json({ success: true, body: encData })
        } else {
            res.json({ success: false })
        }
    } catch (error) {
        console.log(error);
        res.json({ message: error.message })
    }
}
const makeMsgSeen = async (req, res) => {
    try {
        const { recieverId } = req.query
        const recieverData = await User.findOne({ _id: recieverId })
        if (recieverData) {
            const userData = await User.findOne({ email: req.userEmail })
            const connection = await Connection.findOne({ userId: recieverData._id })
            req.io.to(connection.socketId).emit('msgSeen', { senderId: recieverData._id })
            res.json({ success: true });
        } else {
            res.json({ message: "Something went wrong" })
        }
    } catch (error) {
        res.json({ message: error.message })
    }
}
const sendMediaMessage = async (data) => {
    try {
        if (data) {
            const userData = await User.findOne({ email: data.userEmail })
            const recieverData = await User.findOne({ _id: new ObjectId(data.recieverId) })
            const conversationData = await Conversation.findOne({ participents: { $all: [userData._id, recieverData._id] } })
            const messageData = new Message({
                senderId: userData._id,
                recieverId: recieverData._id,
                content: data.content || '',
                sentTime: data.sentTime,
                isMedia: true,
                mediaConfig: { ...data.mediaConfig },
                isDelivered: false,
                isReaded: false,
                isDeleted: false,
                isSent: true
            })

            if (await messageData.save()) {
                if (!conversationData) {
                    await new Conversation({
                        participents: [userData._id, recieverData._id],
                        type: 'personal',
                    }).save()
                }
                await Conversation.findOneAndUpdate({
                    $or: [
                        { participents: [userData._id, recieverData._id] },
                        { participents: [recieverData._id, userData._id] }
                    ]
                }, { $push: { messages: messageData._id } })
                return { newMessage: messageData }
            }
        } else {
            return false
        }
    } catch (error) {
        console.log(error);
        return false
    }
}
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.query
        if (id) {
            const updateData = await Message.findOneAndUpdate({ _id: id }, { $set: { isDeleted: true } }, { new: true })
            if (updateData) {
                const roomData = await Room.findOne({ senderId: { $in: [updateData.senderId, updateData.recieverId] }, recieverId: { $in: [updateData.senderId, updateData.recieverId] } })
                if (roomData) {
                    req.io.to(roomData.roomId).emit('msgDeleted', { id: updateData._id })
                }
                res.json({ success: true })
            } else {
                res.json({ success: false, message: 'Err while deleting message' })
            }
        }
    } catch (error) {
        res.json({ success: false, message: error.message })

    }
}
const editMessage = async (req, res) => {
    try {
        const { msgId, message } = req.body
        if (msgId && message) {
            const messageData = await Message.findById({ _id: msgId })
            if (messageData) {
                messageData.isEdited = true
                messageData.editedContent = messageData.content
                messageData.content = message
                if (await messageData.save()) {
                    const connectionData = await Connection.findOne({ userId: messageData.recieverId })
                    if (connectionData) {
                        req.io.to(connectionData.socketId).emit('msgEdited', { content: message, msgId: messageData._id })
                    }
                    res.json({ success: true, message: "Edited" })
                }
            }
        } else {
            res.json({ success: false, message: "No message" })
        }
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

module.exports = {
    getUserInfo,
    getConversation,
    sendMessage,
    makeMsgSeen,
    getCurrentConversations,
    sendMediaMessage,
    deleteMessage,
    editMessage,
}