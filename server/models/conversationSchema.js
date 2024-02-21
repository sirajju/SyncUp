const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    participents: {
        type: Array,
        default: [],
        required: true
    },
    messages: {
        type: Array,
        default: [],
    },
    type: {
        type: String,
        default: 'personal',
        required: true
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    password: {
        type: String
    },
    startedAt: {
        type: Number,
        default: Date.now()
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    startedAtString: {
        type: String,
        default: new Date().toLocaleDateString('en-GB', { day: "2-digit", month: "2-digit", year: "numeric" })
    }
}, {
    timestamps: true
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
