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
        type: Array,
        default: []
    },
    replys:{
        type:Array,
        default:[]
    },
    expiresAt: {
        type: Number,
        default: new Date(Date.now() + 86400000).getTime()
    },
    blockedUsers: {
        type: Array,
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
    }
})

const Note = mongoose.model('Note', note)

module.exports = Note