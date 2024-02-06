const socketIO = require('socket.io');
const dotenv = require('dotenv');
const Connection = require('../models/connectionModel')
const User = require('../models/userSchema')
const messageController = require('../controller/messageController')
const Room = require('../models/roomModel')
const { ObjectId } = require('mongodb')

function intializeSocket(server) {
    const io = socketIO(server, {
        pingTimeout: 60000,
        cors: {
            origin: "*"
        },
    });
    try {

        io.on('connection', (socket) => {
            socket.on('set-socketId', async (data) => {
                const connectData = await Connection.findOne({ userId: data.userId })
                if (!connectData && data.userId && socket.id) {
                    console.log(`Creating new socket session`);
                    await new Connection({
                        userId: data.userId,
                        socketId: socket.id
                    }).save();
                    await User.findOneAndUpdate({ _id: data.userId }, { $set: { last_seen: 'online' } })
                    setTimeout(async () => {
                        await User.findOneAndUpdate({ _id: data.userId }, { $set: { last_seen: Date.now() } })
                    }, 10000)
                } else {
                    if (connectData.socketId != socket.id) {
                        await User.findOneAndUpdate({ _id: data.userId }, { $set: { last_seen: 'online' } })
                        setTimeout(async () => {
                            await User.findOneAndUpdate({ _id: data.userId }, { $set: { last_seen: Date.now() } })
                        }, 20000)
                        console.log(`updating existing socket id ${socket.id}`);
                        await Connection.findOneAndUpdate({ userId: connectData.userId }, { $set: { socketId: socket.id } })
                    } else {
                        console.log(`Socket session is same`);
                    }
                }
            })
            socket.on('onCall', async (data) => {
                const roomData = await Room.findOne({ senderId: { $in: [data.to, data.from] }, recieverId: { $in: [data.from, data.to] } })
                const to = await Connection.findOne({ userId: data.to })
                if (roomData) {
                    console.log('Joining room');
                    socket.join(roomData.roomId)
                }
                else{
                    const newRoom =  await createRoom({senderId:data.to,recieverId:data.from})
                    if(newRoom){
                        console.log('Joining a room');
                        socket.join(newRoom.roomId)
                    }
                }
                if (to) {
                    console.log('Call emitting');
                    socket.to(to.socketId).emit('callRecieved', { ...data, conversationName: `CONVERSATION_${data.from}` })
                }
            })
            socket.on('userAcceptedACall', async (data) => {
                const userData = await Connection.findOne({ userId: data.from })
                console.log(new ObjectId(data.from))
                if (userData) {
                    socket.to(userData.socketId).emit('callAccepted')
                } else {
                    socket.emit('callError', { message: "Err while connecting" })
                }
            })
            socket.on('onHangup', async (data) => {
                const roomData = await Room.findOne({ senderId: { $in: [data.to, data.from] }, recieverId: { $in: [data.from, data.to] } })
                if (roomData) {
                    socket.to(roomData.roomId).emit('callEnded', { userId: data })
                }
            })
            socket.on('onDeclined', async (data) => {
                const roomData = await Room.findOne({ senderId: { $in: [data.to, data.from] }, recieverId: { $in: [data.from, data.to] } })
                console.log(roomData);
                if (roomData) {
                    socket.to(roomData.roomId).emit('callDeclined', { userId: data.to })
                }
            })
            socket.on('sendMsg', async (data) => {
                const { newMessage } = await messageController.sendMessage(data)
                const senderConnection = await Connection.findOne({ userId: newMessage.senderId })
                const recieverConnection = await Connection.findOne({ userId: newMessage.recieverId })
                if (senderConnection && recieverConnection) {
                    if (senderConnection.socketId != socket.id) {
                        await Connection.findOneAndUpdate({ socketId: senderConnection.socketId }, { $set: { socketId: socket.id } })
                    }
                    const roomData = await Room.findOne({ senderId: { $in: [data.senderId, data.recieverId] }, recieverId: { $in: [data.senderId, data.recieverId] } })
                    socket.to(recieverConnection.socketId).emit('messageRecieved', { newMessage })
                    socket.to(roomData.roomId).emit('messageRecieved', { newMessage })
                }
            })
            socket.on('sendMedia', async (data) => {
                const response= await messageController.sendMediaMessage(data)
                if (response?.newMessage) {
                    let newMessage = response.newMessage
                    const senderConnection = await Connection.findOne({ userId: newMessage.senderId })
                    const recieverConnection = await Connection.findOne({ userId: newMessage.recieverId })
                    if (senderConnection && recieverConnection) {
                        if (senderConnection.socketId != socket.id) {
                            await Connection.findOneAndUpdate({ socketId: senderConnection.socketId }, { $set: { socketId: socket.id } })
                        }
                        const roomData = await Room.findOne({ senderId: { $in: [data.senderId, data.recieverId] }, recieverId: { $in: [data.senderId, data.recieverId] } })
                        socket.to(recieverConnection.socketId).emit('messageRecieved', { newMessage })
                        socket.to(roomData.roomId).emit('messageRecieved', { newMessage })
                    }
                }
            })
            
            socket.on('markMsgDeliver', async (data) => {
                const senderConnection = await Connection.findOne({ userId: data.senderId })
                if (senderConnection) {
                    console.log('marking deliever');
                    socket.to(senderConnection.socketId).emit('msgDelivered')
                }
            })
            socket.on('markMsgSeen', async (data) => {
                const senderConnection = await Connection.findOne({ userId: data.userId })
                if (senderConnection) {
                    socket.to(senderConnection.socketId).emit('msgSeen')
                }
            })
            socket.on('join-room', async (data) => {
                const roomData = await Room.findOne({ senderId: { $in: [data.senderId, data.recieverId] }, recieverId: { $in: [data.senderId, data.recieverId] } })
                if (roomData) {
                    console.log(`Joining a room`);
                    socket.join(roomData.roomId)
                } else {
                    const newRoom = await createRoom(data)
                    if(newRoom){
                        console.log('joining room');
                        socket.join(newRoom.roomId)
                    }else{
                       console.log(`Joining failed ${JSON.stringify(data)}`);
                    }
                }
            })
            const createRoom = async function(data){
                console.log(`creating a room`);
                if(data.senderId && data.recieverId){
                    const newRoom = await new Room({
                        roomId: `${data.senderId}_${data.recieverId}`,
                        senderId: data.senderId,
                        recieverId: data.recieverId
                    }).save()
                    if(newRoom){
                        return newRoom
                    }
                    return false
                }else{
                    console.log('No room data to create one');
                }
               
            }
            socket.on('typingStarted', async (data) => {
                const roomData = await Room.findOne({ senderId: { $in: [data.from, data.to] }, recieverId: { $in: [data.from, data.to] } })
                const connectData = await Connection.findOne({ userId: data.to })
                if (roomData) {
                    socket.to(roomData.roomId).emit('typing')
                    socket.to(connectData.socketId).emit('typing')
                    setTimeout(() => {
                        socket.to(connectData.socketId).emit('typingEnd')
                        socket.to(roomData.roomId).emit('typingEnd')
                    }, 1000);
                }
            })
            socket.on('disconnect', async (socket) => {
                await Connection.findOneAndDelete({ socketId: socket.id })
            });
        });
    } catch (err) {
        console.log('error');
    }
    return io;
}

module.exports = {
    intializeSocket,
};
