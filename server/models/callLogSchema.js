const mongoose = require('mongoose')

const callLog = new mongoose.Schema({
    conversationName: {
        type: String,
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    pariticpants:{
        type:Array,
        default:[]
    },
    createdAt: {
        type: Number,
        default: Date.now()
    },
    isAccepted: {
        type: Boolean,
        default: false
    },
    duration: {
        type: String,
        default: 0
    },
    endTime: {
        type: Number,
        default: null
    },
    clearedParticipants: {
        type: Array,
        default: []
    },
    readedParticipants: {
        type: Array,
        default: []
    }
})

const CallLog = mongoose.model('CallLogs', callLog)

module.exports = CallLog