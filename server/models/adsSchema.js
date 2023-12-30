const mongoose = require('mongoose')

const ads = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    title:{
        type:String,
        required:true
    },
    redirect_url:{
        type:String,
        required:true,
    },
    image_url:{
        type:String,
        required:true
    },
    isUnlisted:{
        type:Boolean,
        default:false
    }
},{timestamps:true})
module.exports = mongoose.model('Ads',ads)