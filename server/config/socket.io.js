const socketIO = require('socket.io');
const dotenv = require('dotenv');
const Connection = require('../models/connectionModel')

function intializeSocket(server) {
    const io = socketIO(server, {
        pingTimeout: 60000,
        cors: {
            origin: "*"
        },
    });

    io.on('connection', (socket) => {
        // io.to(socket.id).emit('onUpdateNeeded')
        socket.on('set-socketId', async (data) => {
            const connectData = await Connection.findOne({ userId: data.userId })
            if (!connectData && data.userId && socket.id) {
                try {
                    await new Connection({
                        userId: data.userId,
                        socketId: socket.id
                    }).save();
                } catch (error) {
                    if (error.code === 11000) {
                        console.log('Duplicate key error:', error.message);
                    }
                }
            }else{
                if(connectData.socketId!=socket.id){
                    await Connection.findOneAndUpdate({userId:connectData.userId},{$set:{socketId:socket.id}})
                }
            }
        })
        socket.on('setup', (id) => {
            socket.join(id)
        });
        socket.on('join', (room) => {
            socket.join(room);
            console.log("room", room);
            console.log("joined");
        })
        socket.on('chatMessage', (message) => {
            if (message.fromId == message.senderId) {
                socket.in(message.toId).emit("msgDone", message)
            } else {
                socket.in(message.fromId).emit("msgDone", message)
            }
        });
        socket.on('disconnect', async (socket) => {
            await Connection.findOneAndDelete({ socketId: socket.id })
        });
    });

    return io;
}

module.exports = {
    intializeSocket,
};
