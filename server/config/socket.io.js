const socketIO = require('socket.io');
const dotenv = require('dotenv');
const Connection = require('../models/connectionModel')
const User = require('../models/userSchema')
const messageController = require('../controller/messageController')

function intializeSocket(server) {
    const io = socketIO(server, {
        pingTimeout: 60000,
        cors: {
            origin: "*"
        },
    });

    io.on('connection', (socket) => {
        socket.on('set-socketId', async (data) => {
            const connectData = await Connection.findOne({ userId: data.userId })
            if (!connectData && data.userId && socket.id) {
                console.log(`socket data creating..${socket.id}`);
                try {
                    await new Connection({
                        userId: data.userId,
                        socketId: socket.id
                    }).save();
                    await User.findOneAndUpdate({ _id: data.userId }, { $set: { last_seen: 'online' } })
                    setTimeout(async() => {
                        await User.findOneAndUpdate({ _id: data.userId }, { $set: { last_seen: Date.now() } })
                    }, 10000)
                } catch (error) {
                    if (error.code === 11000) {
                        console.log('Duplicate key error:', error.message);
                    }
                }
            } else {
                if (connectData.socketId != socket.id) {
                    await User.findOneAndUpdate({ _id: data.userId }, { $set: { last_seen: 'online' } })
                    setTimeout(async() => {
                        await User.findOneAndUpdate({ _id: data.userId }, { $set: { last_seen: Date.now() } })
                    }, 20000)
                    console.log(`updating existing socket id ${socket.id}`);
                    await Connection.findOneAndUpdate({ userId: connectData.userId }, { $set: { socketId: socket.id } })
                }
            }
        })
        socket.on('onCall', async (data) => {
            const to = await Connection.findOne({ userId: data.userId })
            const userData = await User.findOne({ _id: to.userId })
            if (to) {
                if (userData.last_seen == 'online') {
                    socket.to(to.socketId).emit('callRecieved', { userId: to.userId })
                } else {
                    const currentUser = await Connection.findOne({ userId: data.currentUser })
                    socket.to(currentUser.socketId).emit('userOffline', { userName: userData.username })
                }
            }
        })
        socket.on('onHangup', async (data) => {
            console.log('on hangup');
            const to = await Connection.findOne({ userId: data.userId })
            if (to) {
                socket.to(to.socketId).emit('callEnded', { userId: to.userId })
            }
        })
        socket.on('onDeclined', async (data) => {
            console.log('on declined');
            const to = await Connection.findOne({ userId: data.userId })
            if (to) {
                socket.to(to.socketId).emit('callDeclined', { userId: to.userId })
            }
        })
        socket.on('sendMsg', async (data) => {
            const { newMessage } = await messageController.sendMessage(data)
            const senderConnection = await Connection.findOne({ userId: newMessage.senderId })
            const recieverConnection = await Connection.findOne({ userId: newMessage.recieverId })
            if (senderConnection && recieverConnection) {
                if (senderConnection.socketId != socket.id) {
                    console.log('sender socket id is not matched');
                    await Connection.findOneAndUpdate({ socketId: senderConnection.socketId }, { $set: { socketId: socket.id } })
                }
                socket.to(recieverConnection.socketId).to(socket.id).emit('messageRecieved', { newMessage })
                // socket.to(socket.id).emit('msgSent', { newMessage })
            } else {
                socket.emit('logoutUser', { message: "Err while sending message" })
            }
        })
        socket.on('disconnect', async (socket) => {
            await Connection.findOneAndDelete({ socketId: socket.id })
        });
    });

    return io;
}

module.exports = {
    intializeSocket,
};
