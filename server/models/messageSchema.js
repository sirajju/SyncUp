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
    isCleared:{type:Boolean,default:false},
    isEdited:{type:Boolean,default:false},
    editedContent:{type:String},
    type:{type:String},
    isScheduled:{
        type:Boolean,
        default:false
    },
    scheduledConfig:{
        date:{
            type:String,
        },
        time:{
            type:Object,
        },
        createdTime:{
            type:Number
        }
    },
    clearedParticipants:{
        type:Array,
        default:[]
    },
    isConfettiEnabled:{
        type:Boolean,
        default:false
    },
    isScheduleCompleted:{
        type:Boolean,
        default:false
    },
    isScheduledMsgCleared:{
        type:Boolean,
    },
    tempId:{
        type:String,
    },
    sentTime:{
        type:Number,
        default:Date.now()
    },
    sentTimeString:{
        type:String,
        default:new Date().toLocaleDateString('en-GB',{hour:"2-digit",minute:"2-digit",hour12:true})
    },
    sentDateString:{
        type:String,
        default:new Date().toLocaleDateString('en-GB',{day:"2-digit",month:"2-digit",year:"numeric"})
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