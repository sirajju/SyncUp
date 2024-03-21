const mongoose = require('mongoose')

const user = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    auth: {
        otp: {
            value: String,
            expireAt: String
        },
        token: {
            value: String,
            expireAt: String,
            tryCount: Number
        }
    },
    joyRideFinished: {
        type: Boolean,
        default: false
    },
    googleSynced: {
        type: Boolean,
        default: false,
    },
    settingsConfig: {
        allow_msg_from_everyone: {
            type: Boolean,
            default: false
        },
        save_call_logs: {
            type: Boolean,
            default: true
        },
        blur_video_bg: {
            type: Boolean,
            default: false
        },
        video_bg: {
            type: Boolean,
            default: null
        },
        hide_sync_icon: {
            type: Boolean,
            default: false
        },
        replace_premium_text: {
            type: Boolean,
            default: false
        },
    },
    googleContacts: {
        type: Array,
        default: []
    },
    isPremium: {
        type: Boolean,
        require: true,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        require: true,
        default: false
    },
    isBusiness: {
        type: Boolean,
        require: true,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    contacts: {
        type: Array,
        default: []
    },
    reffered: {
        type: Array,
        default: []
    },
    requests: {
        type: Array,
        default: []
    },
    afk: {
        isOn: {
            type: Boolean,
            default: false
        },
        message: {
            type: String,
            default: "Hi {username},user {self} is currently offline."
        }
    },
    blockedContacts: { type: Array, default: [] },
    invitedBy: {
        type: String,
        default: null
    },
    notifications: {
        type: Array,
        default: [{
            type: "premium",
            message: "You have earned 100 chat points by registering",
            time: Date.now(),
            isReaded: false
        }]
    },
    contacts: {
        type: Array,
    },
    avatar_url: {
        type: String,
        default: "https://res.cloudinary.com/drjubxrbt/image/upload/v1703079644/gz8rffstvw1squbps9ag.png"
    },
    chatpoints: {
        type: Number,
        default: 100
    },
    last_seen: {
        type: String,
        default: Date.now()
    },
    last_seen_string: {
        type: String,
        default: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },
    logged_devices: {
        default: 0,
        type: Number
    }
}, { timestamps: true, })

module.exports = mongoose.model('User', user)