const mongoose = require('mongoose')

const room = new mongoose.Schema({
    roomId: {
        type: String
    },
    senderId: {
        type: String,
        required: true
    },
    recieverId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})
const Room = mongoose.model('Room', room)
module.exports = Room