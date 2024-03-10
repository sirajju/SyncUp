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
const Like = require('../models/likeSchema')
const { encryptData } = require('./userController')
const { ObjectId } = require('mongodb')


const publishNote = async (req, res) => {
    try {
        const { note } = req.body
        console.log(req.body);
        if (note) {
            const userData = await User.findOne({ email: req.userEmail })
            if (userData) {
                const newNote = new Note({
                    userId: userData._id,
                    content: note.content,
                    email: userData.email,
                    createdAt:Date.now()
                })
                if (await newNote.save()) {
                    if (newNote.visibility == 'contacts') {
                        userData.contacts.forEach(async el => {
                            const connectionData = await Connection.findOne({ userId: el.id })
                            if (connectionData) {
                                req.io.to(connectionData.socketId).emit('newNote', { newNote })
                            }
                        })
                    }
                    const encData = encryptData(newNote)
                    res.json({ success: true, message: "New note have been published", body: encData })
                }
            }
        } else {
            res.json({ success: false, message: "Something is missing" })
        }
    } catch (error) {
        res.json({ succes: false, message: 'Err while creating a note' })
    }
}

const getNotes = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.userEmail })
        if (userData) {
            await Note.updateMany({ isExpired: false, expiresAt: { $lte: Date.now() } }, { $set: { isExpired: true } })
            const notesData = await User.aggregate([
                { $match: { email: userData.email } },
                { $unwind: "$contacts" }, { $lookup: { from: "notes", localField: "contacts.email", foreignField: "email", as: "notes" } },
                { $unwind: "$notes" },
                { $match: { 'notes.isExpired': false } },
                { $lookup: { from: "users", localField: "contacts.email", foreignField: "email", as: "userData" } },
                { $addFields: { likesCount: { $size: "$notes.likes" } } },
                { $addFields: { difference: { $subtract: [Date.now(), "$notes.createdAt"] } } },
                { $addFields: { totalLikesWithinTime: {$cond:{if:{$eq:['$likesCount',0]},then:0,else:{$divide:['$difference',"$likesCount"]}  }}} },
                { $project: { userData: 1, notes: 1,totalLikesWithinTime:1} },
                { $sort: { 'totalLikesWithinTime': -1 } }
            ])
            const validNotesData = notesData.filter((el => el.notes.length != 0))
            console.log(validNotesData);
            const encNotes = encryptData(validNotesData)
            if (encNotes) {
                res.json({ success: true, body: encNotes })
            } else {
                res.json({ success: false, message: "Err while getting notes" })
            }
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: `Err while getting notes` })
    }
}

const getMyNotes = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.userEmail })
        if (userData) {
            const notesData = await Note.aggregate([
                { $match: { email: userData.email, isCleared: false } },
                { $sort: { "createdAt": 1 } }
            ]);

            if (notesData) {
                const encData = encryptData(notesData.reverse())
                res.json({ success: true, body: encData })
            }
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Err while getting notes" })
    }
}

const checkExpiredItems = async () => {
    try {
        await Note.updateMany({ isExpired: false, expiresAt: { $lte: Date.now() } }, { $set: { isExpired: true } })

    } catch (error) {
        console.log(error);
    }
}

const deleteNote = async (req, res) => {
    try {
        const deleteData = await Note.findOneAndUpdate({ email: req.userEmail, isExpired: false }, { $set: { isExpired: true } }, { new: true })
        if (deleteData) {
            const userData = await User.findOne({ email: req.userEmail })
            if (deleteData.visibility == 'contacts') {
                userData.contacts.forEach(async el => {
                    const connectionData = await Connection.findOne({ userId: el.id })
                    if (connectionData) {
                        req.io.to(connectionData.socketId).emit('noteDeleted', { name: "hello world" })
                    } else {
                        console.log('Connection data is not found');
                    }
                })
            }
            res.json({ success: true, message: "Note have been deleted" })
        } else {
            res.json({ success: false, message: "Something went wrong" })
        }
    } catch (error) {
        res.json({ success: false, err: 'Err while deleting note' })
    }
}
const clearExpiredNotes = async (req, res) => {
    try {
        const deleteData = await Note.updateMany({ email: req.userEmail, isExpired: true }, { $set: { isCleared: true } })
        if (deleteData) {
            res.json({ success: true, message: "Notes have been cleared" })
        } else {
            res.json({ success: false, message: "Something went wrong" })
        }
    } catch (error) {
        res.json({ success: false, err: 'Err while clearing note' })
    }
}

const likeNote = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.userEmail })
        const { noteId } = req.body
        if (userData) {
            const notesData = await Note.findById({ _id: noteId })
            if (notesData && !notesData.likes.includes(userData._id)) {
                const ldata = await new Like({
                    userId: userData._id,
                    userEmail: userData.email,
                    noteId: notesData._id
                }).save()
                const noteData = await Note.findByIdAndUpdate({ _id: notesData._id }, { $push: { likes: userData._id.toString() } })
                if (noteData) {
                    const sharedUser = await User.findByIdAndUpdate({ _id: notesData.userId }, { $push: { notifications: { type: "like", userId: userData._id, username: userData.username, avatar_url: userData.avatar_url, noteId: notesData._id, time: ldata.likedAt } } }, { new: true })
                    if (sharedUser) {
                        const socketData = await Connection.findOne({ userId: sharedUser._id })
                        if (socketData) {
                            req.io.to(socketData.socketId).emit('onUpdateNeeded')
                            req.io.to(socketData.socketId).emit('refreshMyNotes')
                        }
                        res.json({ success: true, message: "Note Liked" })
                    }

                } else {
                    res.json({ success: false, message: "Something went wrong" })
                }
            }
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: `Err while liking note` })
    }
}
const unLikeNote = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.userEmail })
        const { noteId } = req.body
        if (userData) {
            const updateData = await Note.findByIdAndUpdate({ _id: noteId }, { $pull: { likes: userData._id.toString() } }, { new: true })
            const noteData = await Like.findOneAndDelete({ userEmail: userData.email, noteId: updateData._id })
            if (noteData) {
                const sharedUserData = await User.findByIdAndUpdate({ _id: updateData.userId }, { $pull: { notifications: { type: "like", username: userData.username, noteId: updateData._id } } }, { new: true })
                if (sharedUserData) {
                    const socketData = await Connection.findOne({ userId: sharedUserData._id })
                    if (socketData) {
                        req.io.to(socketData.socketId).emit('onUpdateNeeded')
                        req.io.to(socketData.socketId).emit('refreshMyNotes')
                    }
                    res.json({ success: true, message: "Note DisLiked" })
                }
            } else {
                res.json({ succes: false, message: "Err while updating note" })
            }
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: `Err while unliking note` })
    }
}

const getLikes = async (req, res) => {
    try {
        const { noteId } = req.query
        if (noteId) {
            const likesData = await Note.aggregate([
                { $match: { _id: new ObjectId(noteId) } },
                { $unwind: "$likes" },
                { $lookup: { from: "likes", localField: "likes", foreignField: "userId", as: "noteLikeData" } },
                { $unwind: "$noteLikeData" },
                { $match: { 'noteLikeData.noteId': noteId } },
                { $addFields: { userObject: { $toObjectId: "$likes" } } },
                { $lookup: { from: "users", foreignField: "_id", localField: "userObject", as: "likedUserData" } },
                { $unwind: "$likedUserData" },
                { $addFields: { 'likedUserData.likedAt': "$noteLikeData.likedAt" } },
                { $project: { 'likedUserData.likedAt': 1, 'likedUserData.username': 1, 'likedUserData.avatar_url': 1, 'likedUserData.email': 1, 'likedUserData._id': 1 } }
            ])
            if (likesData.length) {
                console.log(likesData);
                const encData = encryptData(likesData)
                res.json({ success: true, body: encData })
            } else {
                res.json({ success: false, message: 'No likes found' })
            }
        } else {
            res.json({ success: false, message: "Something went wrong" })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Err while getting likes" })
    }
}

module.exports = {
    publishNote,
    getNotes,
    getMyNotes,
    checkExpiredItems,
    deleteNote,
    clearExpiredNotes,
    likeNote,
    unLikeNote,
    getLikes
}