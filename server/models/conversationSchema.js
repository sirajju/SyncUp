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
    startedAt: {
        type: Number,
        default: Date.now()
    }
},{
    timestamps:true
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
