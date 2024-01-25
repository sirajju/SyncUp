const mongoose = require('mongoose')

const connection = new mongoose.Schema({
    userId:{
        type:String,
        required:true,
        unique:true
    },
    socketId:{
        type:String,
        require:true,
    }
},{timestamps:true})

const Connection = mongoose.model("Connection",connection)

module.exports = Connection