const mongoose = require('mongoose')

module.exports=async function (){
    mongoose.connect('mongodb://localhost:27017/syncUp').then(con=>{
        console.log('Mongodb connected');
    })
}