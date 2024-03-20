const mongoose = require('mongoose')

const premium = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    emailIfExpired :{
        type:String,
    },
    customization: {
        type: Object,
        default: {
            theme: {},
            configurations: {}
        }
    },
    type: {
        type: String,
        required: true
    },
    authToken:{
        type:String
    },
    expiresAt: {
        type: Number,
        required: true
    },
    expiresAtString: {
        type: String,
    },
    price: {
        type: Number,
        required: true
    },
    paymentType: {
        type: String,
        required: true
    },
    isExpNotified:{
        type:Boolean,
        default:false
    },
    paymentStatus: {
        type: String,
        required: true
    },
    paymentSessionId: {
        type: String,
        required: true
    },
    createdAt:{
        type:Number,
        default:Date.now()
    },
    isExpired:{
        type:Boolean,
        default:false
    }
},{collection:'premium'})

const Premium = mongoose.model('Premium',premium)

module.exports = Premium