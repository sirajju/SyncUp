const mongoose = require('mongoose')

const callLog = new mongoose.Schema({
    conversationName:{
        type:String,
    },
    from:{
        type:String,
        required:true
    },
    to:{
        type:String,
        required:true
    },
    createdAt:{
        type:Number,
        default:Date.now()
    },
    isAccepted:{
        type:Boolean,
        default:false
    },
    duration:{
        type:Number,
        default:0
    },
    endTime:{
        type:Number,
        default:null
    },
    isReaded:{
        type:Boolean,
        default:false
    },
    isCleared:{
        type:Boolean,
        default:false
    }
})

const CallLog = mongoose.model('CallLogs',callLog)

module.exports = CallLog