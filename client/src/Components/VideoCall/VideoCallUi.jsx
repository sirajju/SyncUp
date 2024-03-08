import React, { useEffect, useRef, useState } from 'react'
import './VideoCall.css'
import Dp from '../../assets/Images/man.png'
import { UserAgent } from '@apirtc/apirtc';
import { useSocket } from '../../Context/socketContext';
import Axios from '../../interceptors/axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

function VideoCallUi({setChat,chat}) {
    const socket = useSocket()
    const [userData, setUserData] = useState({})
    const [isAccepted,setAccepted]=useState(false)
    const me = useSelector(state => state.user)
    const conversationRef = useRef(null);
    const [isLoading, setLoading] = useState(true)
    const localStream = useRef(null)
    const [remoteStream, setRemote] = useState(null)
    // const [ua, setUa] = useState(new UserAgent({
    //   uri: 'apiKey:58fe00be7be7c9805c1c0b98b195669a'
    // }))
    const callState = useSelector(state => state.call)

    const onStreamListChangedHandler = function (streamInfo) {
        if (streamInfo.listEventType === 'added' && streamInfo.isRemote) {
            if (conversationRef.current)
                conversationRef.current.subscribeToStream(streamInfo.streamId)
                    .then((stream) => {
                        console.log('subscribeToStream success', streamInfo);
                    }).catch((err) => {
                        console.error('subscribeToStream error', err);
                    });
        }
    }
    //streamAdded : Add the participant's display to the UI
    const onStreamAddedHandler = function (stream) {
        if (stream.isRemote) {
            setLoading(false)
            stream.addInDiv('videoCallStreams', 'remoteMediaPlayer' + stream.streamId, {}, false);
        }
    }
    //streamRemoved: Remove the participant's display from the UI
    const onStreamRemovedHandler = function (stream) {
        stream.removeFromDiv('videoCallStreams', 'remoteMediaPlayer' + stream.streamId)
        console.log(conversationRef);
    }
    const initializeVideo = async () => {
        const apikey = "58fe00be7be7c9805c1c0b98b195669a"
        const ua = new UserAgent({
            uri: 'apiKey:' + apikey
        })
        // setUa(ua)
        //Connect the UserAgent and get a session
        ua.register().then((session) => {

            const conversationName = chat.data.conversationName

            const conversation = session.getOrCreateConversation(conversationName, { meshOnlyEnabled: true })

            conversationRef.current = conversation

            conversation.on("streamListChanged", onStreamListChangedHandler)
            conversation.on("streamAdded", onStreamAddedHandler)
            conversation.on("streamRemoved", onStreamRemovedHandler)
            //Instantiate a local video stream object
            ua.createStream({
                constraints: {
                    audio: false,
                    video: true
                }
            })
                .then((stream) => {
                    let strm = stream
                    localStream.current = strm
                    stream.attachToElement(document.getElementById('local-video-stream'));
                    console.log(conversation);
                    conversation.join()
                        .then((response) => {
                            conversation
                                .publish(strm)
                                .then(() => {
                                    toast.success('local published')
                                })
                                .catch((err) => {
                                    toast.error("publish error", err);
                                });
                        }).catch((err) => {
                            toast.error('Conversation join error' + err.message);
                        });
                }).catch((err) => {
                    toast.error('create stream error', err);
                });
        });
    }
    useEffect(() => {
        if (chat.isRecieved) {

        }
        const id = chat.isRecieved ? chat.data.from : chat.data.to
        if (id) {
            const options = {
                route: 'getUserInfo',
                params: { userId: id },
                headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
                crypto: true
            }
            Axios(options).then(res => {
                if (res.data.success) {
                    setUserData(res.data.body)
                } else {
                    toast.error(res.data.message)
                }
            })
        }

        const handleCallEnd = (data) => {
            if (localStream.current) {
                localStream.current.data.getTracks().forEach(el => {
                    return el.stop()
                })
            }
            setChat({ type: null })
            if (conversationRef.current) {
                toast('conversaiton leaving')
                conversationRef.current.leave()
                conversationRef.current.cancelJoin()
            }
            toast.error('Call ended')
        }
        const handleCallAccepted = () => {
            setAccepted(true)
            toast('accepted ')
            setChat({ ...chat, isAccepted: true })
            initializeVideo()
            setLoading(false)

        }
        socket.on('callEnded', handleCallEnd)
        socket.on('callDeclined', handleCallEnd)
        socket.on('callAccepted', handleCallAccepted)
        return () => {
            socket.off('callEnded', handleCallEnd)
            socket.off('callAccepted'.handleCallAccepted)
        }
    }, [socket])

    const acceptCall = function () {
        setAccepted(true)
        socket.emit('userAcceptedACall', chat.data)
        setChat({ ...chat, isAccepted: true })
        initializeVideo()
    }

    const hangUpCall = function () {
        if (localStream.current) {
            localStream.current.data.getTracks().forEach(el => {
                return el.stop()
            })
        }
        if (conversationRef.current) {
            toast('conversaiton leaving')
            console.log(`Conversation `, conversationRef.current);
            conversationRef.current.cancelJoin()
            conversationRef.current.leave()
        }
        socket.emit('onHangup', chat.data)
        setChat({ type: null })
    }
    const declineCall = () => {
        if (localStream.current) {
            localStream.current.data.getTracks().forEach(el => {
                return el.stop()
            })
        }
        if (conversationRef.current) {
            toast('conversaiton leaving')
            conversationRef.current.cancelJoin()
            conversationRef.current.leave()
        }
        socket.emit('onDeclined', chat.data)
        setChat({ type: null })

    }
    return (
        <div className="videoCallUIParent">
            <div className="videoCallUserDetails center">
                <div className='flex-column' >
                    <img src={userData.avatar_url} className='vidCallAvatar' alt="" />
                    <h4>{userData.username}</h4>
                </div>
            </div>
            <div id='videoCallStreams' className="videoCallStreams center">

                {
                    (isLoading && !chat.isRecieved && !isAccepted) &&
                    <div className="videoCallLoader center flex-column">
                        <span className="videoCallLoaderSpinner" />
                        <p>Waiting...</p>
                    </div>
                }
                {
                    (chat.isRecieved && !isAccepted) &&
                    <p style={{ fontSize: "20px", color: "white" }} >Incoming video call from <b>sirajju</b>...</p>

                }
                {
                    !isLoading && <video autoPlay muted></video>
                }
                <video id="local-video-stream" className='selfStream' autoPlay muted />

            </div>
            <div className="videoCallControls center">
                {
                    (!chat.isRecieved || isAccepted) && <button onClick={declineCall} className='syncup-pink-btn' >Hangup</button>
                }
                {
                    (chat.isRecieved && !isAccepted) &&
                    <>
                        <button className='syncup-pink-btn' onClick={hangUpCall} >Decline</button>
                        <button className='syncup-pink-btn' onClick={acceptCall} >Accept</button>
                    </>
                }
            </div>
        </div>
    )
}

export default VideoCallUi