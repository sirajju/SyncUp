const mongoose = require('mongoose')

const like = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    noteId:{
        type:String,
        required:true
    },
    likedAt:{
        type:Number,
        default:Date.now()
    }
})

const Like = mongoose.model('Like',like)

module.exports = Like