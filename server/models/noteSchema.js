const mongoose = require('mongoose')

const note = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    visibility: {
        type: String,
        default: 'contacts'
    },
    content: {
        type: String,
        required: true
    },
    likes: {
        type: [],
        default: []
    },
    replys:{
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Replys'
        }],
        default: []
    },
    expiresAt: {
        type: Number,
        default: new Date(Date.now() + 86400000).getTime()
    },
    expireAtString:{
        type:String,
        default:new Date(Date.now() + 86400000).toLocaleDateString('en-GB',{day:'2-digit',month:"2-digit",year:"2-digit"})
    },
    blockedUsers: {
        type: [{
            userId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Users"
            },
            blockedAt:{
                type:Number,
                dafault:Date.now()
            }
        }],
        default: []
    },
    isCleared: {
        type: Boolean,
        default: false
    },
    isExpired: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Number,
        default: Date.now()
    },
    createdAtString:{
        type:String,
        defualt:new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"2-digit",year:"2-digit"})
    }
})

const Note = mongoose.model('Note', note)

module.exports = Note