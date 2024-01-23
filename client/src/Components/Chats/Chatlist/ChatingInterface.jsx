import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Ads from '../AdsInterface/Ads';
import Axios from '../../../interceptors/axios';
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
import GetChatList from '../../../main/Chats/getChatList';
import GetMessages from '../../../main/Chats/getMessages';
import { markDelivered, setConversations, setCurrentChat, markSeen, addNewMessage, setCallData, markSent } from '../../../Context/userContext';
import VideocallContextProvider from '../../../Context/videocallContext';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../Context/socketContext';
import Emoji from '../../Emojis/Emoji'
import emojiRegex from 'emoji-regex';
import VidConfig from '../../VideoCall/VidConfig';
import msgSending from '../../../assets/Images/pending.png'


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

function ChatingInterface({ chat, setChat }) {
    const socket = useSocket()
    const userData = useSelector((state) => state.user);
    const callState = useSelector(state => state.call)
    const [reciever, setReciever] = useState(null);
    const [message, setMessage] = useState('');
    const [isSending, setSending] = useState(false)
    const [openEmoji, setOpenEmoji] = useState(false)
    const [file, setFile] = useState(false)
    const inputRef = useRef();
    const fileInputRef = useRef();
    const navigate = useNavigate()
    const dispatch = useDispatch()
    useEffect(() => {
        if (chat.type == 'chat') {
            document.addEventListener('keyup', (e) => {
                if (e.key == 'Escape') {
                    setChat({ type: null })
                } else if (e.key == 'Enter') {
                    if (inputRef.current) {
                        inputRef.current.focus()
                    }
                }
            })
        }
        if (chat.type == 'videoCall') {
            socket.emit('onCall', { to: chat.data, from: userData.value._id })
        }
        const fetchUserData = async () => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
            if (chat.type === 'chat') {
                try {
                    const token = localStorage.getItem('SyncUp_Auth_Token');
                    const options = {
                        route: "getUserInfo",
                        params: { userId: chat.data },
                        headers: { Authorization: `Bearer ${token}` },
                        crypto: true
                    }
                    Axios(options).then(async res => {
                        if (res.data.success) {
                            setReciever(res.data.body);
                            const msgList = await GetMessages(res.data.body._id)
                            if (msgList.length) {
                                dispatch(setCurrentChat(msgList))
                            } else {
                                dispatch(setCurrentChat([]))
                            }
                        } else {
                            toast.error(res.data.message);
                        }
                    })

                } catch (error) {
                    console.error(error);
                    toast.error(error.message);
                }
            }
        };
        fetchUserData();

    }, [chat]);
    const sendMessage = async () => {
        if (isSending) {
            return toast('Umm..trafic makes slow')
        } else {
            if (message.length) {
                const newMsg = {
                    recieverId: reciever._id,
                    senderId: userData.value._id,
                    message: message.charAt(0).toUpperCase() + message.slice(1),
                    userEmail: userData.value.email,
                    isDelivered: false,
                    isReaded: false,
                    isSent: false,
                    sentTime: Date.now()
                }
                setMessage('')
                setSending(true)
                if (newMsg.message && newMsg.userEmail && newMsg.recieverId) {
                    socket.emit('sendMsg', newMsg)
                }
                socket.on('msgSeen', () => {
                    dispatch(markSeen(userData.value._id))
                })

                dispatch(addNewMessage({ ...newMsg, content: newMsg.message }))
                dispatch(setConversations(await GetChatList()))
                setSending(false)
            }
        }
    };
    const handleInputChange = (e) => {
        if (e.target.value.startsWith(':emoji')) {
            setOpenEmoji(true)
            setMessage('')
        }
        else {
            if (e.target.value.trim()) {
                setMessage(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1));
            }
        }
    };
    const handleFileInput = async (e) => {
        const reader = new FileReader()
        reader.onload = (ev) => {
            const obj = { data: ev.target.result, type: e.target.files[0].type }
            alert(obj)
            setFile(obj)
            sendMedia()
        }
        reader.readAsDataURL(e.target.files[0])
    }
    const sendMedia = async () => {
        setSending(true)
        const formData = new FormData();
        console.log(file);
        formData.append('file', file.data);
        formData.append('upload_preset', 'syncup_preset');

        const data = await fetch('https://api.cloudinary.com/v1_1/drjubxrbt/image/upload', {
            method: 'POST',
            body: formData,
        }).catch(err => toast(err.message))
        const { secure_url } = await data.json()
        if (secure_url) {
            const options = {
                route: "/sendMediaMessage",
                headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
                payload: { secure_url, reciever: reciever._id, type: file.type },
                method: "POST"
            }
            Axios(options).then(res => {
                if (res.data.success) {
                    setSending(false)
                    toast('Media sent')
                } else {
                    toast(res.data.message)
                }
            })
        } else {
            toast.error('Err while sending media')
        }
    }
    const hangUpCall = () => {
        window.location.reload()
        socket.emit('onHangup', { userId: chat.data })
        setChat({ type: null })
    }
    const declineCall = () => {
        window.location.reload()
        socket.emit('onDeclined', { userId: chat.data })
        setChat({ type: null })
    }
    const removeLastEmoji = () => {
        const regex = emojiRegex();
        const match = regex.exec(message);
        if (match) {
            const emoji = match[0];
            setMessage((msg) => msg.slice(0, -emoji.length));
        } else {
            setMessage((msg) => msg.slice(0, -1));
        }
    };
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
                        <img src={emoji} alt='not' onClick={() => setOpenEmoji(true)} />
                        <input onKeyDown={(e) => (e.key == 'Backspace' && message.length < 3) && removeLastEmoji(e)} onChange={handleInputChange} onKeyUp={(e) => e.key == 'Enter' ? sendMessage() : false} value={message} type="text" ref={inputRef} placeholder='Type a message...' className="msgInput text-capitalize" />
                        <img src={add} onClick={() => fileInputRef.current.click()} alt="" />
                        <input type="file" onInput={handleFileInput} ref={fileInputRef} accept={"image/*, video/*"} hidden id="" />
                        <img src={!message ? (!isSending ? mic : timer) : (!isSending ? send : timer)} onClick={!message ? () => alert('mic') : sendMessage} alt="" />
                    </div>
                </div>
            )}
            {openEmoji && <Emoji setMessage={setMessage} setOpenEmoji={setOpenEmoji} />}
            {(chat.type == 'videoCall') && (
                <VidConfig declineCall={declineCall} chat={chat} hangUpCall={hangUpCall} />
            )}
        </>
    );
}

export default ChatingInterface;
