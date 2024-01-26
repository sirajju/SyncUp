import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import Peer from 'simple-peer'
import { useSelector } from 'react-redux'

const videoCallContext = createContext()

const socket = io(`http://${window.location.hostname}:5000`);

function VideocallContextProvider({ children }) {
    const userData = useSelector(state => state.user)
    const [stream, setStream] = useState(null)
    const [me, setMe] = useState(userData.value._id)
    const [call, setCall] = useState(null)
    const [isAccepted, setAccepted] = useState(false)
    const [isEnded, setEnded] = useState(false)
    const [name, setName] = useState('')
    
    const userVideo = useRef()
    const connection = useRef()

    useEffect(() => {
        socket.on('callUser', ({ from, name: callerName, signal }) => {
            setCall({ isRecievedCall: true, from, name: callerName, signal })
        })
    },[])

    const answerCall = () => {
        setAccepted(true)

        const peer = new Peer({ initiator: false, trickle: false, stream })

        peer.on('signal', (data) => {
            socket.emit('answerCall', { signal: data, to: call.from, })
        })
        peer.on('stream', (currStream) => {
            userVideo.current.srcObject = currStream
        })

        peer.signal(call.signal)

        connection.current = peer
    }
    const callUser = (id) => {
        const peer = new Peer({ initiator: false, trickle: false, stream })
        peer.on('signal', (data) => {
            socket.emit('callUser', { userToCall: id, signalData: data, from: me, name })
        })
        peer.on('stream', (currStream) => {
            userVideo.current.srcObject = currStream
        })
        socket.on('callAccepted', (data) => {
            setAccepted(true)

            peer.signal(data)
        })

        connection.current = peer

    }
    const leaveCall = () => {
        setEnded(true)
        connection.current.destroy()
    }
    return (
        <videoCallContext.Provider value={{
            call,
            isAccepted,
            userVideo,
            stream,
            name,
            setName,
            isEnded,
            me,
            callUser,
            leaveCall,
            answerCall
        }}>
            {children}
        </videoCallContext.Provider>
    )
}

export {VideocallContextProvider,videoCallContext}

export default VideocallContextProvider