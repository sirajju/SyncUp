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

const vapidKeys = webPush.generateVAPIDKeys();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const io = intializeSocket(http)
app.use(async (req, res, next) => {
  req.io = io
  next()
})

app.use('/', userRouter);
app.use('/admin', adminRouter);

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
  console.log('Server started on https://localhost:5000');
})

module.exports = app;
