const mongoose = require('mongoose')

const report = new mongoose.Schema({
    userId:{type:String,required:true},
    reportedBy:{type:String,required:true},
    type:{type:String,default:"User"},
    reason:{type:String},
    reportedAt:{type:Number,default:Date.now()},
    reportedAtString:{type:String,default:new Date().toLocaleString('en-GB',{day:"2-digit",month:'2-digit',year:'numeric'})},
    isSolved:{type:Boolean,dafault:false},
    isRejected:{type:Boolean,default:false}
})

const Report = mongoose.model('Report',report)


module.exports = Report