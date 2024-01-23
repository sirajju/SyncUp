const mongoose = require("mongoose")

const message = new mongoose.Schema({
    content:{
        type:String,
    },
    senderId:String,
    recieverId:String,
    isDelivered:{type:Boolean,default:false},
    isDeleted:{type:Boolean,default:false},
    isReaded:{type:Boolean,default:false},
    isSent:{type:Boolean,default:false},
    type:String,
    sentTime:{
        type:Number,
        default:Date.now()
    },
    readedTime:{
        type:Number,
    },
    isMedia:{
        type:Boolean,
        default:false
    },
    mediaConfig:{
        type:Object,
        default:{}
    }
})

const Message = mongoose.model('Message',message)

module.exports = Message