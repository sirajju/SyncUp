const mongoose = require('mongoose')

const room = new mongoose.Schema({
    roomId: {
        type: String
    },
    conversationName:{
        type:String,
        default:null
    },
    from: {
        type: String,
        required: true
    },
    to: {
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
const Room = mongoose.model('CallRoom', room)
module.exports = Room