const mongoose = require('mongoose')

const premium = new mongoose.Schema({
    userId: {
        type: String,
        required: true
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
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    paymentType: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        required: true
    },
    paymentSessionId: {
        type: String,
        required: true
    }
},{collection:'premium'})

const Premium = mongoose.model('Premium',premium)

module.exports = Premium