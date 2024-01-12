import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Ads from '../AdsInterface/Ads';
import axios from 'axios';
import toast from 'react-hot-toast';
import cryptojs from 'crypto-js';
import vidCall from '../../../assets/Images/videocall.png';
import menu from '../../../assets/Images/menu.png';
import emoji from '../../../assets/Images/emoji.png';
import add from '../../../assets/Images/add.png';
import mic from '../../../assets/Images/mic.png';
import send from '../../../assets/Images/send.png';
import timer from '../../../assets/Images/timer.png';
import msgSeen from '../../../assets/Images/msg_seen.png';
import msgSent from '../../../assets/Images/msg_send.png';
import msgDelivered from '../../../assets/Images/msg_delivered.png';
import chat_svg from '../../../assets/svgIcons/chat.png';
import './ChatingInterface.css';
import VideoCall from '../../VideoCall/VideoCall';
import socket from '../../../Context/socket';
import GetChatList from '../../../main/Chats/getChatList';
import GetMessages from '../../../main/Chats/getMessages';
import { markDelivered, setConversations, setCurrentChat, markSeen, addNewMessage, setCallData } from '../../../Context/userContext';
import VideocallContextProvider from '../../../Context/videocallContext';
import { useNavigate } from 'react-router-dom';

const SERVER_URL = `http://${window.location.hostname}:5000`;

const ConversationDetails = ({ reciever, setChat }) => {
    return (
        <div className="conversationDetails">
            <button
                type="button"
                className="close closeProfile"
                onClick={() => {
                    setChat('');
                }}
                aria-label="Close"
            >
                <span aria-hidden="true">&times;</span>
            </button>
            <img src={reciever.avatar_url} alt="" className="conversationAvatar" />
            <div className="conversationUserDetails">
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{reciever.username} {reciever.isPremium && <sup title='Premium member' className="badge rounded-pill d-inline premiumBadge mx-1">Premium</sup>} </span>
                <span>{reciever.last_seen != 'online' ? `last seen ${new Date(parseInt(reciever.last_seen)).getDate() == new Date().getDate() ? "today" : new Date(parseInt(reciever.last_seen)).getDate() == new Date().getDate() - 1 ? "yesterday" : " was " + new Date(parseInt(reciever.last_seen)).toLocaleDateString()} at ${new Date(parseInt(reciever.last_seen)).toLocaleTimeString()}` : <font color='white'>Online</font>}</span>
            </div>
        </div>
    )

};

const MessageRenderer = () => {
    const currentChat = useSelector(state => state.currentChat)
    const userData = useSelector(state => state.user)
    const doodleRef = useRef()
    useEffect(() => {
        doodleRef.current.scrollTop = doodleRef.current.scrollHeight
    }, [currentChat])
    return (
        <div className="chatinInterface">
            <div className="doodles" ref={doodleRef}>
                {currentChat.value.length ? (
                    currentChat.value.map((el, ind) => {
                        return (
                            el.senderId === userData.value._id ? (
                                <div key={ind} className="message rightMessage">
                                    <div className='p-1'>{el.content}</div>
                                    <span>{new Date(el.sentTime).getHours().toString().padStart(2, '0')}:{new Date(el.sentTime).getMinutes().toString().padStart(2, '0')} <img src={el.isReaded ? msgSeen : (el.isDelivered ? msgDelivered : msgSent)} alt="" /> </span>
                                </div>
                            ) : (
                                <div key={ind} className="message leftMessage">
                                    <div className='p-1'>{el.content}</div>
                                    <span>{new Date(el.sentTime).getHours().toString().padStart(2, '0')}:{new Date(el.sentTime).getMinutes().toString().padStart(2, '0')}</span>
                                </div>
                            )
                        )
                    })
                ) : (
                    <div className="newConversation">
                        <div>
                            <img src={chat_svg} alt="" />
                            <h6> Begin a conversation by sending "Hi" </h6>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function ChatingInterface({ chat, setChat, socket }) {
    const userData = useSelector((state) => state.user);
    const callState = useSelector(state => state.call)
    const [reciever, setReciever] = useState(null);
    const [message, setMessage] = useState('');
    const [isSending, setSending] = useState(false)
    const inputRef = useRef();
    const navigate=useNavigate()
    const dispatch = useDispatch()


    useEffect(() => {
        if (chat.type == 'videoCall') {
            socket.emit('onCall', { userId: chat.data,currentUser:userData.value._id })
        }
        const fetchUserData = async () => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
            if (chat.type === 'chat') {
                try {
                    const token = localStorage.getItem('SyncUp_Auth_Token');
                    const response = await axios.get(`${SERVER_URL}/getUserInfo?userId=${chat.data}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if (response.data.success) {
                        const decrypted = cryptojs.AES.decrypt(response.data.body, 'syncupservercryptokey').toString(cryptojs.enc.Utf8);
                        setReciever(JSON.parse(decrypted));
                        dispatch(setCurrentChat(await GetMessages(JSON.parse(decrypted)._id)))
                    } else {
                        toast.error(response.data.message);
                    }
                } catch (error) {
                    console.error(error);
                    toast.error(error.message);
                }
            }
        };
        fetchUserData();
        socket.on('msgDelivered', () => {
            dispatch(markDelivered(userData.value._id))
        })
        socket.on('msgSeen', () => {
            dispatch(markSeen(userData.value._id))
        })
        socket.on('messageRecieved', async (data) => {
            dispatch(addNewMessage(data.newMessage))
            dispatch(setConversations(await GetChatList()))
        })
    }, [chat]);
    const sendMessage = async () => {
        if (isSending) {
            return toast('Umm..trafic makes slow')
        } else {
            const newMsg = {
                recieverId: reciever._id,
                message: message.charAt(0).toUpperCase() + message.slice(1),
                userEmail: userData.value.email
            }
            setSending(true)
            socket.emit('sendMsg', newMsg)
            socket.on('msgDelivered', () => {
                dispatch(markDelivered(userData.value._id))
            })
            socket.on('msgSeen', () => {
                dispatch(markSeen(userData.value._id))
            })
            socket.on('userOffline',(data)=>{
                toast.error(`User ${data.userName} is offline`)
                hangUpCall(false)
            })
            dispatch(setCurrentChat(await GetMessages(newMsg.recieverId)))
            dispatch(setConversations(await GetChatList()))
            setMessage('')
            setSending(false)
        }

    };
    const handleInputChange = (e) => {
        setMessage(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1));
    };
    const hangUpCall = (informToUser) => {
        const videos = document.querySelectorAll('video')
        videos.forEach(video => {
            const stream = video.srcObject
            stream.getVideoTracks().forEach(track => track.stop());
            stream.getAudioTracks().forEach(track => track.stop());
            video.srcObject = null
        })
        informToUser&&socket.emit('onHangup', { userId: chat.data })
        setChat({ type: null })
    }
    const declineCall = () => {
        const videos = document.querySelectorAll('video')
        videos.forEach(video => {
            const stream = video.srcObject
            stream.getVideoTracks().forEach(track => track.stop());
            stream.getAudioTracks().forEach(track => track.stop());
            video.srcObject = null
        })
        socket.emit('onDeclined', { userId: chat.data })
        setChat({ type: null })
    }
    return (
        <>
            {(!chat.type && userData.value.isPremium) && (
                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
                    <h1>Premium user</h1>
                </div>
            )}
            {(!userData.value.isPremium && !chat.type) && <Ads />}
            {(chat.type == 'chat' && reciever) && (
                <div className="conversationContainer">
                    <div className="conversationTopBar">
                        <ConversationDetails setChat={setChat} reciever={reciever} />
                        <div className="conversationMenu">
                            <img src={vidCall} onClick={() => setChat({ type: 'videoCall', data: reciever._id })} alt="" />
                            <img src={menu} alt="" />
                        </div>
                    </div>
                    <MessageRenderer reciever={reciever} />
                    <div className="conversationBottom">
                        <img src={emoji} alt="" />
                        <input onChange={handleInputChange} onKeyUp={(e) => e.key == 'Enter' ? sendMessage() : false} value={message} type="text" ref={inputRef} placeholder='Type a message...' className="msgInput text-capitalize" />
                        <img src={add} alt="" />
                        <img src={!message ? mic : (!isSending ? send : timer)} onClick={!message ? '' : sendMessage} alt="" />
                    </div>
                </div>
            )}
            {(chat.type == 'videoCall' ) && (
                <VideoCall declineCall={declineCall} chat={chat} hangUpCall={hangUpCall} />
            )}
        </>
    );
}

export default ChatingInterface;
