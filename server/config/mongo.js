const mongoose = require('mongoose')
require('dotenv').config()
module.exports = async function () {
    try {
        mongoose.connect(process.env.MONGODB_URI).then(con => {
            console.log('Mongodb local connected');
        })
    }catch(err){
        mongoose.connect('mongodb://localhost:27017/SyncUp').then(con => {
            console.log('Mongodb server connected');
        })
    }
    
}