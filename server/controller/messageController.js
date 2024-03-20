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
const { toArray } = require('lodash')
const cron = require('node-cron')

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
        const { userId, arrayOfIds } = req.query
        if (userId) {
            const userData = await User.findOne({ _id: userId })
            if (userData) {
                const encData = crypto.AES.encrypt(JSON.stringify(userData), process.env.CRYPTO_SECRET)
                res.json({ success: true, body: encData.toString() })
            }
        } else if (arrayOfIds) {
            const userData = await User.find({ _id: { $in: arrayOfIds } })
            if (userData) {
                const encData = crypto.AES.encrypt(JSON.stringify(userData), process.env.CRYPTO_SECRET)
                res.json({ success: true, body: encData.toString() })
            }
        }
        else {
            res.json({ success: false })
        }
    } catch (error) {
        res.status(500).json({ message: error.message, success: false })
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
                const unReadMsgsLength = await Message.find({ senderId: recieverData._id, recieverId: userData._id })?.length
                await Message.updateMany({ senderId: recieverData._id, recieverId: userData._id }, { $set: { isReaded: true } })
                await Message.updateMany({ senderId: userData._id, recieverId: recieverData._id }, { $set: { tempId: '' } })
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
                        isCleared: false,
                        clearedParticipants: { $nin: [userData._id.toString()] }
                    }).sort({ sentTime: 1 });
                    const connectData = await Connection.findOne({ userId: recieverData._id })
                    if (connectData && unReadMsgsLength) {
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
        res.status(500).json({ message: error.message })
    }
}
const sendMessage = async ({ recieverId, content, userEmail, _id }) => {
    try {
        if (recieverId && content) {
            const userData = await User.findOne({ email: userEmail })
            const recieverData = await User.findOne({ _id: recieverId })
            const conversationData = await Conversation.findOne({ participents: { $all: [userData._id, recieverData._id] } })
            const newMessage = new Message({
                senderId: userData._id,
                recieverId,
                content,
                tempId: _id,
                sentTime: Date.now()
            })
            if (!conversationData) {
                await new Conversation({
                    participents: [userData._id, recieverData._id],
                    type: 'personal',
                }).save()
                const isContact = await User.findOne({ _id: userData._id, contacts: { $elemMatch: { id: recieverId } } })
                if (isContact) {
                    console.log('Not in contact');
                    // await User.findByIdAndUpdate({ _id: recieverId }, { $push: { contacts: { id: userData._id, isAccepted: true, email: userData.email }} })
                } else {
                    console.log('Already a contact');
                }

            }
            else if (conversationData.isBanned) {
                return false
            }
            await newMessage.save()
            await Conversation.findOneAndUpdate({
                $or: [
                    { participents: [userData._id, recieverData._id] },
                    { participents: [recieverData._id, userData._id] }
                ]
            }, { $push: { messages: newMessage._id } })
            if (recieverData.afk.isOn) {
                let content = recieverData.afk.message.replace(/({username})|({self})/g, function (m) {
                    let obj = {
                        '{username}': userData.username,
                        '{self}': recieverData.username,
                    }
                    return obj[m]
                })
                const afkMessage = await new Message({
                    senderId: recieverData._id,
                    recieverId: userData._id,
                    content,
                    sentTime: Date.now()
                }).save()
                await Conversation.findByIdAndUpdate({ _id: conversationData._id }, { $push: { messages: afkMessage._id } })
            }
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
        console.log('Getting conversations');
        const userData = await User.findOne({ email: req.userEmail }).lean();

        const conversationData = await Conversation.aggregate([
            { $match: { participents: { $in: [userData._id] } } },
            { $unwind: '$participents' },
            { $match: { 'participents': { $ne: userData._id } } },
            { $lookup: { from: 'users', localField: 'participents', foreignField: '_id', as: "opponent" } },
            { $lookup: { from: 'messages', foreignField: '_id', localField: 'messages', as: "messages" } },
            {
                $project: {
                    _id: 1, isBanned: 1, opponent: 1, startedAt: 1, updatedAt: 1, isConfettiEnabled: 1, messages: {
                        $filter: {
                            input: '$messages',
                            as: 'ms',
                            cond: {
                                $cond: {
                                    if: { $gt: [{ $size: '$$ms.clearedParticipants' }, 0] },
                                    then: { $not: { $in: [userData._id.toString(), '$$ms.clearedParticipants'] } },
                                    else: true
                                }
                            }
                        }
                    }, last_message: { $slice: ['$messages', -1] }
                }
            },
            { $unwind: '$last_message' },
            { $sort: { 'last_message.sentTime': -1 } }
        ]);

        // const filteredData = conversationData?.map(el => {
        //     return {
        //         ...el, messages: el.messages.filter(ms => {
        //             if (ms?.clearedParticipants?.length) {
        //                 return !ms.clearedParticipants.includes(userData._id.toString());
        //             }
        //             return true;
        //         })
        //     };
        // });

        if (conversationData && conversationData.length > 0) {
            await Message.updateMany({ recieverId: userData._id }, { $set: { isDelivered: true } });
            const updatePromises = conversationData.map(async (el) => {
                return Conversation.aggregate([
                    { $match: { participents: { $in: [userData._id] } } },
                    { $unwind: '$participents' },
                    { $match: { 'participents': { $ne: userData._id } } },
                    { $project: { participents: 1 } },
                    // { $group :{_id:"$participents"}}
                ]);
            });

            const dlvrData = await Promise.all(updatePromises);
            await Promise.all(dlvrData[0].map(async (el) => {
                const connectData = await Connection.findOne({ userId: el.participents });
                if (connectData) {
                    req.io.to(connectData.socketId).emit('msgDelivered', { recieverId: userData._id });
                }
            }));

            const encData = encryptData(conversationData);
            console.log('Rendering conversations');
            return res.json({ success: true, body: encData });
        } else {
            return res.json({ success: false });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
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
        res.status(500).json({ message: error.message })
    }
}
const sendMediaMessage = async (data) => {
    try {
        if (data) {
            const userData = await User.findOne({ email: data.userEmail })
            const recieverData = await User.findById({ _id: data.recieverId })
            const conversationData = await Conversation.findOne({ participents: { $all: [userData._id, recieverData._id] } })
            const messageData = new Message({
                senderId: userData._id,
                recieverId: recieverData._id,
                content: data.content || '',
                sentTime: data.sentTime,
                tempId: data._id,
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
        let updateData;
        if (id) {
            updateData = await Message.findOneAndUpdate({ tempId: id }, { $set: { isDeleted: true } }, { new: true })
            if (!updateData) {
                updateData = await Message.findByIdAndUpdate({ _id: id }, { $set: { isDeleted: true } }, { new: true })
            }
            else {
                const roomData = await Room.findOne({ senderId: { $in: [updateData.senderId, updateData.recieverId] }, recieverId: { $in: [updateData.senderId, updateData.recieverId] } })
                if (roomData) {
                    req.io.to(roomData.roomId).emit('msgDeleted', { id: updateData._id })
                    res.json({ success: true })
                }
            }
        }
        else {
            res.json({ success: false, message: 'Err while deleting message' })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message })

    }
}
const editMessage = async (req, res) => {
    try {
        const { msgId, message } = req.body
        let messageData;
        if (msgId && message) {
            messageData = await Message.findOne({ tempId: msgId })
            if (!messageData) {
                messageData = await Message.findById({ _id: msgId })
            }
            if (messageData) {
                messageData.isEdited = true
                messageData.editedContent = messageData.content
                messageData.content = message
                if (await messageData.save()) {
                    const connectionData = await Connection.findOne({ userId: messageData.recieverId })
                    if (connectionData) {
                        req.io.to(connectionData.socketId).emit('msgEdited', { content: message, msgId: messageData._id })
                    }
                    return res.json({ success: true, message: "Edited" })
                }
            }
        }
        return res.json({ success: false, message: "No message" })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const disabledConfetti = async (req, res) => {
    try {
        const { userId } = req.query
        if (userId) {
            const recieverData = await User.findById({ _id: userId })
            const userData = await User.findOne({ email: req.userEmail })
            const messageUpdate = await Message.updateMany({ senderId: recieverData._id, recieverId: userData._id }, { $set: { isConfettiEnabled: false } })
            if (messageUpdate) {
                res.json({ success: true })
            } else {
                res.json({ success: false, message: "Err while updating" })
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Err while updating" })

    }
}

const clearMessages = async (req, res) => {
    try {
        const { chatId } = req.query
        const userData = await User.findOne({ email: req.userEmail })
        if (chatId) {
            const conversationUpdate = await Conversation.findById({ _id: chatId })
            if (conversationUpdate) {
                const updateMessages = await Message.updateMany({ senderId: { $in: conversationUpdate.participents.map(el => el.toString()) }, recieverId: { $in: conversationUpdate.participents.map(el => el.toString()) } }, { $addToSet: { clearedParticipants: userData._id.toString() } })
                console.log(updateMessages);
                if (updateMessages) {
                    return res.json({ success: true, message: "Conversation messages cleared..!" })
                }
            }
        }
        return res.json({ success: false, message: "Err while resetting messages" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message })
    }
}

const getScheduledMessages = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.userEmail })
        if (userData) {
            const scheduleData = await Message.aggregate([
                { $match: { senderId: userData._id.toString(), isScheduled: true, isScheduledMsgCleared: false } },
                { $addFields: { recieverObjectId: { $toObjectId: "$recieverId" } } },
                { $lookup: { from: "users", localField: "recieverObjectId", foreignField: "_id", as: "recieverData" } },
                { $project: { 'recieverData.avatar_url': 1, 'recieverData.username': 1, 'recieverData.email': 1, scheduledConfig: 1, isScheduleCompleted: 1, content: 1, sentTime: 1 } },
                { $unwind: '$recieverData' },
                { $sort: { sentTime: -1 } }
            ])
            const encData = encryptData(scheduleData)
            if (encData) {
                res.json({ success: true, body: encData })
            }
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const scheduleMessage = async (req, res) => {
    try {
        const { data } = req.body
        if (data) {
            const userData = await User.findOne({ email: req.userEmail })
            const recieverData = await User.findOne({ username: data.username, contacts: { $elemMatch: { id: userData._id } } })
            if (recieverData) {
                let sentTime = new Date(data.date)
                sentTime.setHours(data.time.hours)
                sentTime.setMinutes(data.time.minutes)
                const newMessage = await new Message({
                    senderId: userData._id,
                    recieverId: recieverData._id,
                    content: data.content,
                    isScheduled: true,
                    scheduledConfig: {
                        date: sentTime,
                        time: {
                            hours: data.time.hours,
                            minutes: data.time.minutes,
                        },
                        createdTime: Date.now()
                    },
                    sentTime,
                    isScheduledMsgCleared: false
                }).save()
                if (newMessage) {
                    const scheduleTime = new Date(newMessage.sentTime);

                    const minute = scheduleTime.getMinutes();
                    const hour = scheduleTime.getHours();
                    const date = scheduleTime.getDate();
                    const month = scheduleTime.getMonth() + 1;
                    const dayOfWeek = scheduleTime.getDay();

                    const cronPattern = `${minute} ${hour} ${date} ${month} ${dayOfWeek}`;
                    console.log(cronPattern);
                    cron.schedule(cronPattern, async (data) => {
                        const msData = await Message.findById({ _id: newMessage._id })
                        if (!msData.isScheduledMsgCleared) {
                            await Conversation.updateOne({ participents: { $all: [userData._id, recieverData._id] } }, { $push: { messages: newMessage._id } })
                            await Message.findByIdAndUpdate({ _id: newMessage._id }, { $set: { isScheduleCompleted: true, sentTime: Date.now() } })
                            const connectionData = await Connection.find({ userId: { $in: [userData._id, recieverData._id] } })
                            if (connectionData) {
                                connectionData.forEach(el => {
                                    req.io.to(el.socketId).emit('messageRecieved', { newMessage })
                                    if (el.userId == userData._id.toString()) {
                                        console.log('emitting');
                                        req.io.to(el.socketId).emit('scheduledMsgSent', { msg: newMessage._id })
                                    }
                                })
                            }
                        }

                    })

                    res.json({ success: true, message: "Message scheduled" })
                }
            } else {
                res.json({ success: false, message: "Recipient is not in your contact" })
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Something went wrong" })
    }
}

const clearScheduledMsgs = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.userEmail })
        if (userData) {
            const dltData = await Message.updateMany({ senderId: userData._id, isScheduled: true }, { $set: { isScheduledMsgCleared: true } })
            if (dltData) {
                return res.json({ success: true })
            }
        }
        return res.json({ success: false, message: "Err user not found" })
    } catch (error) {
        res.status(500).json({ success: false, message: "Err while clearing" })
    }
}

const deleteConversation = async (req, res) => {
    try {
        const { chatId } = req.query
        if (chatId) {

        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Err while deleting conversation" })
    }
}

const deleteScheduledMsg = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.userEmail })
        const { id } = req.query
        if (id) {
            const dltData = await Message.findByIdAndDelete({ _id: id }, { $set: { isScheduledMsgCleared: true } })
            if (dltData) {
                return res.json({ success: true })
            }
        }
        return res.json({ success: false, message: "Err id not found" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Err while clearing" })
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
    disabledConfetti,
    clearMessages,
    scheduleMessage,
    getScheduledMessages,
    clearScheduledMsgs,
    deleteConversation,
    deleteScheduledMsg
}