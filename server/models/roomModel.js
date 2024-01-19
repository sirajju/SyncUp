const mongoose = require('mongoose')

const room = new mongoose.Schema({
    roomId:{
        type:String
    },
    users:{
        type:Array,
        default:[]
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})
const Room = mongoose.model('Room',room)
module.exports = Room