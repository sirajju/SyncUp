const mongoose = require('mongoose')

const user = mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    auth:{
        otp:{
            value:String,
            expireAt:String
        },
        token:{
            value:String,
            expireAt:String,
            tryCount:Number
        }
    },
    isPremium:{
        type:Boolean,
        require:true,
        default:false
    },
    isEmailVerified:{
        type:Boolean,
        require:true,
        default:false
    },
    isBusiness:{
        type:Boolean,
        require:true,
        default:false
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    isAdmin :{
        type:Boolean,
        default:false
    },
    contacts:{
        type:Array,
        default:[]
    },
    reffered:{
        type:Array,
        default:[]
    },
    requests:{
        type:Array,
        default:[]
    },
    invitedBy :{
        type:String
    },
    notifications:{
        type:Array,
        default:[{
            type:"premium",
            message:"You have earned 100 chat points by registerting",
            time:Date.now(),
            isReaded:false
        }]
    },
    contacts:{
        type:Array,
    },
    avatar_url:{
        type:String,
        default:"https://res.cloudinary.com/drjubxrbt/image/upload/v1703079644/gz8rffstvw1squbps9ag.png"
    },
    chatpoints:{
        type:Number,
        default:100
    },
    last_seen:{
        type:Date,
        default:Date.now()
    },
    logged_devices:{
        default:0,
        type:Number
    }
},{timestamps: true,})

module.exports= mongoose.model('User',user)