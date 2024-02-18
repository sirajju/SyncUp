const mongoose = require('mongoose')


const like = new mongoose.Schema({
    type:{
        type:String,
        default:'notes',
    },
    noteId:{
        type:String,
        required:true
    },
    userId:{
        type:String,
        required:true
    },
    userEmail:{
        type:String,
    },
    likedAt:{
        type:Number,
        default:Date.now(),
    },
    likedAtString:{
        type:String,
        default:new Date().toLocaleString('en-GB',{date:'2-digit',month:'2-digit',year:'numeric'})
    }
})

const Like = mongoose.model('Like',like)

module.exports = Like