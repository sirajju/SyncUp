const mongoose = require('mongoose')

const room = new mongoose.Schema({
    roomName:{
        type:String,
    },
    roomId:{
        type:Stirng
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})
const Room = mongoose.model('Room',room)