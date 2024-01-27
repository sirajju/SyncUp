const mongoose = require('mongoose')
require('dotenv').config()
module.exports=async function (){
    mongoose.connect(process.env.MONGODB_URI).then(con=>{
        console.log('Mongodb connected');
    }).catch(err=>{
        console.log(err)
    })
}