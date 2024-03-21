const cluster = require('cluster')
const os = require('os')
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('./config/mongo').call()
const userRouter = require('./routes/userRouter');
const adminRouter = require('./routes/adminRouter');
const cors = require('cors')
const isAuth = require('./middlewares/isAuth')
require('dotenv').config()
const app = express();
const http = require("http").createServer(app)
const { intializeSocket } = require('./config/socket.io')
const webPush = require('web-push')
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(http, { debug: true })
const cron = require('node-cron')
const messageController = require('./controller/messageController')
app.use(cors())

// if (cluster.isMaster) {
//   for (let i = 0; i < os.cpus().length; i++) {
//     cluster.fork()
//   }
//   cluster.on('exit', () => {
//     console.log('exitting and restarting');
//     cluster.fork()
//   })
// } else {
  
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.use(logger('dev'));
  app.use(express.json({ limit: '500mb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  
    app.get('/',(req,res)=>{
      console.log(`Request url ${req.path}`);
      res.redirect('/home')
    })
  app.use(express.static(path.join(__dirname, 'public')));
  const io = intializeSocket(http)
  app.use(async (req, res, next) => {
    req.io = io
    next()
  })



  app.use('/api/', userRouter);
  app.use('/api/admin', adminRouter);
  // app.use('/peerjs',peerServer)
  const buildPath = path.join(__dirname,'../client/build')

  app.use(express.static(buildPath))
  
  app.get('/*',(req,res)=>{
    console.log(`Request url ${req.path}`);
    res.sendFile(
      path.join(__dirname,'../client/build/index.html'),
      (err)=>{
        if(err){
          res.status(500).send(err)
        }
      }
    )
  })
  app.get('*', (req, res) => {
    res.json({ err: "Not found" })
  })

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  http.listen(process.env.PORT || 5000, (req, res) => {
    console.log('Server started on http://localhost:5000');
  })

// }

module.exports = app;
