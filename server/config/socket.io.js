const socketIO = require('socket.io');
const dotenv = require('dotenv');
const Connection = require('../models/connectionModel')
const User = require('../models/userSchema')
const messageController = require('../controller/messageController')
const Room = require('../models/roomModel')
const call_log = require('../models/callLogSchema')
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
                if (data.createLog) {
                    const existsLog = await call_log.find({ conversationName: data.conversationName })
                    console.log(existsLog);
                    if (!existsLog.length) {
                        createLog({ ...data })
                    }
                }
                if (roomData) {
                    console.log('Joining room');
                    socket.join(roomData.roomId)
                }
                else {
                    const newRoom = await createRoom({ senderId: data.to, recieverId: data.from })
                    if (newRoom) {
                        console.log('Joining a room');
                        socket.join(newRoom.roomId)
                    }
                }
                if (to) {
                    console.log('Call emitting');
                    socket.to(to.socketId).emit('callRecieved', { ...data })
                }
            })
            socket.on('userAcceptedACall', async (data) => {
                const roomData = await Room.findOne({ senderId: { $in: [data.to, data.from] }, recieverId: { $in: [data.from, data.to] } })
                await call_log.findOneAndUpdate({ conversationName: data.conversationName }, { $set: { isAccepted: true } })
                if (roomData) {
                    socket.to(roomData.roomId).emit('callAccepted')
                } else {
                    socket.to(roomData.roomId).emit('callError', { message: "Err while connecting" })
                }
            })
            socket.on('memberJoined',async data=>{
                const roomData = await  Room.findOne({conversationName: data.conversationName})
                if(roomData){
                    socket.join(roomData.roomId)
                    socket.to(roomData.roomId).emit('userJoinedToCall',{data})
                }
            })
            socket.on('onHangup', async (data) => {
                const roomData = await Room.findOne({ conversationName: data.conversationName})
                const callData = await call_log.findOne({ conversationName: data.conversationName })
                const senderConnection = await Connection.findOne({ userId: data.from })
                const recieverConnection = await Connection.findOne({ userId: data.to })
                console.log(`Ending conversation ${data.conversationName}`);
                if (callData) {
                    const ms = Date.now() - new Date(callData.createdAt).getTime()
                    const seconds = parseInt(ms / 1000)
                    let duration;
                    if (seconds >= 60) {
                        duration = (seconds / 60).toFixed(1) + 'm'
                        if (duration >= 60) {
                            duration = (duration / 60).toFixed(1) + 'h'
                        }
                    } else {
                        duration = seconds + 's'
                    }
                    callData.duration = duration
                    callData.endTime = Date.now()
                    await callData.save()
                }
                if (roomData) {
                    socket.to(recieverConnection.socketId).emit('callEnded', { userId: data })
                    socket.to(senderConnection.socketId).emit('callEnded', { userId: data })
                }
            })
            socket.on('onDeclined', async (data) => {
                const roomData = await Room.findOne({conversationName:data.conversationName})
                console.log(`Declined call ${data.conversationName}`);
                if (roomData) {
                    socket.to(roomData.roomId).emit('callDeclined', data)
                }
            })
            socket.on('sendMsg', async (data) => {
                const { newMessage } = await messageController.sendMessage(data)
                if (newMessage) {
                    const senderConnection = await Connection.findOne({ userId: newMessage.senderId })
                    const recieverConnection = await Connection.findOne({ userId: newMessage.recieverId })
                    if (senderConnection && recieverConnection) {
                        if (senderConnection.socketId != socket.id) {
                            await Connection.findOneAndUpdate({ socketId: senderConnection.socketId }, { $set: { socketId: socket.id } })
                        }
                        const roomData = await Room.findOne({ senderId: { $in: [data.senderId, data.recieverId] }, recieverId: { $in: [data.senderId, data.recieverId] } })
                        socket.to(recieverConnection.socketId).emit('messageRecieved', { newMessage })
                        // socket.to(roomData.roomId).emit('messageRecieved', { newMessage })
                    }
                }
            })
            socket.on('sendMedia', async (data) => {
                const response = await messageController.sendMediaMessage(data)
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
                        // socket.to(roomData.roomId).emit('messageRecieved', { newMessage })
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
                    if (newRoom) {
                        console.log('joining room');
                        socket.join(newRoom.roomId)
                    } else {
                        console.log(`Joining failed ${JSON.stringify(data)}`);
                    }
                }
            })
            const createRoom = async function (data) {
                console.log(`creating a room`);
                if (data.senderId && data.recieverId) {
                    const newRoom = await new Room({
                        roomId: `${data.senderId}_${data.recieverId}`,
                        senderId: data.senderId,
                        recieverId: data.recieverId,
                        participants:[data.senderId,data.recieverId],
                        conversationName:data.conversationName
                    }).save()
                    if (newRoom) {
                        return newRoom
                    }
                    return false
                } else {
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


            // Creating call logs

            const createLog = async function ({ from, to, conversationName, duration, isAccepted, endTime }) {
                console.log('Creating call log')
                if (from, to, conversationName) {
                    await new call_log({
                        conversationName: conversationName || delete this.conversationName,
                        pariticpants:[from,to],
                        from,
                        to,
                        isAccepted,
                        duration,
                        createdAt: Date.now(),
                        endTime: endTime || delete this.endTime,
                        
                    }).save()
                }

            }
        });
    } catch (err) {
        console.log('error');
    }
    return io;
}

module.exports = {
    intializeSocket,
};
