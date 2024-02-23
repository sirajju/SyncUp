const mongoose = require('mongoose')

const broadCast = new mongoose.Schema({
    type:{
        type:String,
        required:true
    },
    userId:{
        type:String,
    },
    adminId:{
        type:String,
    },
    content:{
        type:String,
    },
    isMedia:{
        type:Boolean,
        default:false
    },
    isCleared:{
        type:Boolean,
        default:false
    },
    mediaConfig:{
        type:Object,
        default:{}
    },
    createdAt:{
        type:Number,
        default:Date.now()
    },
    createdAtString:{
        type:String,
        default:new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'2-digit',year:'2-digit'})
    }
})

const Broadcast = mongoose.model('Broadcast',broadCast)

module.exports = Broadcast