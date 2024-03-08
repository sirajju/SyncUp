const mongoose = require('mongoose')

const room = new mongoose.Schema({
    roomId: {
        type: String
    },
    conversationName:{
        type:String,
        default:null
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
    },
    participants:{
        type:Array,
        default:[]
    }
})
const Room = mongoose.model('Room', room)
module.exports = Room