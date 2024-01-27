const mongoose = require('mongoose')

module.exports=async function (){
    mongoose.connect('mongodb://localhost:27017/SyncUp').then(con=>{
        console.log('Mongodb connected');
    }).catch(err=>{
        console.log(err)
    })
}