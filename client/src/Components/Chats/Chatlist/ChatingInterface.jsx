import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Ads from '../AdsInterface/Ads';
import Axios from '../../../interceptors/axios';
import toast, { LoaderIcon } from 'react-hot-toast';
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
import { markDelivered, setConversations, setCurrentChat, markSeen, addNewMessage, setCallData, markSent, deleteMessage, setUserData, markEdited } from '../../../Context/userContext';
import VideocallContextProvider from '../../../Context/videocallContext';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../Context/socketContext';
import Emoji from '../../Emojis/Emoji'
import emojiRegex from 'emoji-regex';
import VidConfig from '../../VideoCall/VidConfig';
import msgSending from '../../../assets/Images/pending.png'
import LinearProgress from '@mui/joy/LinearProgress';
import lodash, { uniqueId } from 'lodash'
import UserDetails from '../../UserDetails/UserDetails';
import ContextMenu from './Context/Context'
import {  useContextMenu } from "react-contexify";
import EditMessage from './EditMessage/EditMessage'
import "react-contexify/dist/ReactContexify.css";
import { useScroll } from '@react-hooks-library/core'
import ConfirmBox from '../../Confirmation/Dailogue'
import { v4 } from 'uuid'
import { MDBIcon } from 'mdb-react-ui-kit';
import _ from 'lodash';
import axios from 'axios';
import MediaSender from './MediaSender/MediaSender';

const ConversationTopBar = ({ reciever, setChat, setGo, chat, isBlocked }) => {
    const userData = useSelector(state => state.user)
    const dispatch = useDispatch()
    const [isLoading, setLoading] = useState(true)
    const socket = useSocket()
    const [isTyping, setTyping] = useState(false)
    const conversation = useSelector(state => state.conversations)
    useEffect(() => {
        console.log('conversation userDetails top bar');
        setLoading(true)
        GetChatList('conversationTop').then(res => {
            dispatch(setConversations(res))
            setLoading(false)
        })
        const options = {
            route: "getConversation",
            params: { recieverId: reciever._id },
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
            crypto: true
        }
        Axios(options).then(res => {
            dispatch(setCurrentChat((res.data.body)))
        })
        socket.on('typing', () => {
            console.log('typing');
            setTyping(true)
        })
        socket.on('typingEnd', () => {
            setTyping(false)
        })
    }, [reciever, socket])
    const goToProfile = function (e) {
        setChat({ type: "UserProfile", data: reciever._id })
    }
    const closeChat = function (e) {
        e.stopPropagation()
        const par = document.querySelector('.conversationContainer')
        par.style.transition = '0.7s'
        par.style.transform = "translateX(100%)"
        _.delay(() => {
            setChat({ type: null, data: null });
            if (window.outerWidth <= 800) {
                setGo('')
            }
        }, 700)
    }
    return (
        <div className='conversationTopBar' >
            <div className="conversationDetails">
                <MDBIcon fas icon="arrow-right" onClick={closeChat} size='sm' style={{ color: "white" }} />
                <img src={reciever.avatar_url} alt="" onClick={goToProfile} className="conversationAvatar" />
                <div className="conversationUserDetails" onClick={goToProfile}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{reciever.username} {reciever.isPremium && <sup title='Premium member' className="badge rounded-pill d-inline premiumBadge mx-1">Premium</sup>} </span>
                    {!isBlocked && <span> {isTyping ? "Typing..." : reciever.last_seen != 'online' ? `last seen ${new Date(parseInt(reciever.last_seen)).getDate() == new Date().getDate() ? "today" : new Date(parseInt(reciever.last_seen)).getDate() == new Date().getDate() - 1 ? "yesterday" : " was " + new Date(parseInt(reciever.last_seen)).toLocaleDateString()} at ${new Date(parseInt(reciever.last_seen)).toLocaleTimeString()}` : <font color='white'>Online</font>}</span>}
                </div>
            </div>
            <div className="conversationMenu">
                {isLoading && <LinearProgress variant='soft' color='danger' style={{ color: "#ED80FD" }} />}
                {!isBlocked && <img src={vidCall} onClick={() => setChat({ type: 'videoCall', data: { to: reciever._id, from: userData.value._id, conversationName: `CONVERSATION_${userData.value._id}` } })} alt="" />}
                <img src={menu} alt="" />
            </div>
        </div>
    )

};

const MessageRenderer = ({ reciever, setReciever }) => {
    const userData = useSelector(state => state.user)
    const socket = useSocket()
    const doodleRef = useRef()
    const [messages, setMessages] = useState([])
    const conversation = useSelector(state => state.conversations)
    const dispatch = useDispatch()
    const [messageId, setMessageId] = useState(null)
    const [isConfirmed, displayConfirm] = useState(false)
    const [editedMessage, setEdited] = useState('')
    const [showEdit, openEdit] = useState(false)
    const currentChat = useSelector(state => state.currentChat)
    const { show } = useContextMenu({id: 'MENU_ID'});
    useEffect(() => {
        doodleRef.current.scrollTop = doodleRef.current.scrollHeight + 2000
        if (!currentChat.value?.length) {
            console.log('running on local chat');
            const data = conversation.value.filter(el => el.opponent[0]._id == reciever._id)
            if (data[0]?.messages?.length) {
                setMessages(data[0].messages)
            } else {
                setMessages([])
            }
        } else {
            setMessages(currentChat.value)
        }

    }, [currentChat])
    function displayMenu(e, id) {
        setMessageId(id)
        show({
            event: e,
        });
    }
    const deleteMsg = function () {
        displayConfirm(false)
        const options = {
            route: "deleteMessage",
            params: { id: messageId },
            headers: { Authorization: `Bearer ${localStorage.getItem("SyncUp_Auth_Token")}` },
            method: "DELETE"
        }
        Axios(options).then(res => {
            if (res.data.success) {
                setMessageId('')
                dispatch(deleteMessage(messageId))
            } else {
                toast.error(res.data.message)
            }
        })
    }

    const saveMessage = function () {
        const options = {
            route: "editMessage",
            payload: { msgId: messageId, message: editedMessage },
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
            method: "PUT"
        }
        Axios(options).then(res => {
            if (res.data.success) {
                dispatch(markEdited({ msgId: messageId, content: editedMessage }))
                setEdited('')
                setMessageId('')
                openEdit(false)
            } else {
                alert(res.data.message)
            }
        })
    }

    return (
        <div className="chatinInterface">
            <div className="doodles" onClick={(e) => { (!isConfirmed && !showEdit) && setMessageId('') }} ref={doodleRef}>
                <ConfirmBox func={displayConfirm} value={isConfirmed} posFunc={deleteMsg} title='Are you sure ?' content="Do you want to delete this message ?" />
                <ConfirmBox func={openEdit} value={showEdit} posFunc={saveMessage} title='Edit your message' >
                    <input onKeyUp={(e) => e.key == 'Enter' && saveMessage()} onChange={(e) => setEdited(e.target.value)} className='confirmInput m-1' type="text" placeholder={'Enter message'} />

                </ConfirmBox>
                <EditMessage />
                <ContextMenu displayConfirm={displayConfirm} openEdit={openEdit} MENU_ID={'MENU_ID'} />
                {messages?.length ? (
                    messages.map((el, ind) => {
                        return (
                            <>
                            {el.senderId === userData.value._id ? (
                                <div key={ind}  className={`message rightMessage ${messageId == el._id ? 'bg-danger text-light' : ''} `} onContextMenu={el.isDeleted ? (e) => e.preventDefault() : (e) => displayMenu(e, el._id)}>
                                    <div className='p-1'>{el?.isDeleted ? "This message has been vanished" : (!el.isMedia?el.content:<>
                                    <img src={el.mediaConfig.url} alt="" className="mediaMessage" />
                                    </>)}</div>
                                    <span>{new Date(el.sentTime).getHours().toString().padStart(2, '0')}:{new Date(el.sentTime).getMinutes().toString().padStart(2, '0')} <img src={el.isReaded ? msgSeen : (el.isDelivered ? msgDelivered : msgSent)} alt="" /> {(el.isEdited && !el.isDeleted) ? "Edited" : ""} </span>
                                </div>
                            ) : (
                                <div key={ind}  className={`message leftMessage `}>
                                    <div className='p-1'>{el?.isDeleted ? "This message has been vanished" : (!el.isMedia?el.content:<>
                                    <img src={el.mediaConfig.url} alt="" className="mediaMessage" />
                                    </>)}</div>

                                    <span> {(el.isEdited && !el.isDeleted) && "Edited"}  {new Date(el.sentTime).getHours().toString().padStart(2, '0')}:{new Date(el.sentTime).getMinutes().toString().padStart(2, '0')}  </span>
                                </div>
                            )}
                            </>
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

function ChatingInterface({ setGo, setChat, chat }) {
    const socket = useSocket()
    const userData = useSelector((state) => state.user);
    const [reciever, setReciever] = useState(null);
    const [message, setMessage] = useState('');
    const [isBlocked, setBlocked] = useState(false)
    const [isSending, setSending] = useState(false)
    const [openEmoji, setOpenEmoji] = useState(false)
    const [file, setMedia] = useState(false)
    const fileInputRef = useRef()
    const inputRef = useRef();
    const [caption,setCaption]=useState(null)
    const conversation = useSelector(state => state.conversations)
    const dispatch = useDispatch()
    useEffect(() => {
        socket.on('conversationBlocked', async (data) => {
            if (reciever) {
                setReciever({ ...reciever, blockedContacts: [...reciever.blockedContacts, { userId: userData.value._id, blockedAt: Date.now() }] })
                setBlocked(true)
            } else {
                const res = await GetChatList()
                dispatch(setConversations(res))
            }
        })
        socket.on('conversationUnblocked', async (data) => {
            if (reciever) {
                dispatch(setUserData({ ...userData.value, blockedContacts: userData.value.blockedContacts.filter(el => el.userId != data.userId) }))
                setBlocked(false)
            } else {
                const res = await GetChatList()
                dispatch(setConversations(res))
            }
        })
        socket.on('msgEdited', (data) => {
            if (chat.type) {
                dispatch(markEdited({ msgId: data.msgId, content: data.content }))
            }
        })
        if (chat.type == 'chat') {
            setMessage('')
            socket.emit('join-room', { senderId: userData.value._id, recieverId: chat.data })

            GetMessages(chat.data).then(msgList => {
                if (msgList?.length) {
                    dispatch(setCurrentChat(msgList))
                } else {
                    dispatch(setCurrentChat([]))
                }
            })
            const chatData = conversation.value.filter(el => el.opponent[0]._id == chat.data)
            if (chatData && chatData[0]?.opponent[0]) {
                const blocked = (userData.value.blockedContacts?.filter(el => el.userId == chat.data)?.length)
                const anotherBlock = chatData[0].opponent[0].blockedContacts.filter(el => el.userId == userData.value._id).length
                console.log(blocked || anotherBlock);
                setBlocked(blocked || anotherBlock)
                setReciever(chatData[0].opponent[0])
            } else {
                const options = {
                    route: "getUserInfo",
                    params: { userId: chat.data },
                    headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
                    crypto: true
                }
                Axios(options).then(res => {
                    const blocked = (userData.value.blockedContacts?.filter(el => el.userId == chat.data)?.length).length
                    const anotherBlock = res.data.body.blockedContacts.filter(el => el.userId == userData.value._id).length
                    console.log(blocked || anotherBlock);

                    setBlocked(blocked || anotherBlock)
                    setReciever(res.data.body)
                })
            }
        }
        else if (chat.type == 'videoCall') {
            socket.emit('onCall', chat.data)
        }
        document.addEventListener('keyup', (e) => {
            if (e.key == 'Escape') {
                if(file){
                    setMedia(null)
                }
                setChat({ type: null })
            } else if (e.key == 'Enter') {
                    inputRef?.current?.focus()
                }
        })
    }, [chat]);

    const sendMessage = async () => {
        if (isSending) {
            return toast('Umm..trafic makes slow')
        } else {
            if (message.length) {
                const newMsg = {
                    _id: v4(),
                    recieverId: reciever._id,
                    senderId: userData.value._id,
                    content: message.charAt(0).toUpperCase() + message.slice(1),
                    userEmail: userData.value.email,
                    isDelivered: false,
                    isReaded: false,
                    isSent: false,
                    isDeleted: false,
                    sentTime: Date.now()
                }
                setMessage('')
                setSending(true)
                if (newMsg.content && newMsg.userEmail && newMsg.recieverId) {
                    socket.emit('sendMsg', newMsg)
                    dispatch(addNewMessage(newMsg))
                    if (!conversation.value.length) {
                        GetChatList('from first message sender').then(res => dispatch(setConversations(res)))
                    }
                } else {
                    toast('No message')
                }
                setSending(false)


                // socket.on('msgSeen', () => {
                //     const deep = lodash.cloneDeep(conversation)
                //     dispatch(setConversations(deep.value.map(el=>{
                //         return {...el,messages:el.messages.forEach(el => el.isReaded = true)}
                //     })))
                // })

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
        if (e.target.files[0]) {
            const reader = new FileReader()
            reader.onload = (ev) => {
                const obj = { data: ev.target.result, type: e.target.files[0].type,size:e.target.files[0].size }
                if(!obj.type.startsWith('image')){
                    toast.error('Please select an image')
                }
                else{
                    setMedia(obj)
                }
            }
            reader.readAsDataURL(e.target.files[0])
        }
    }
    const sendMedia = async () => {
        const formData = new FormData();
        formData.append('file', file.data);
        setSending(true)
        formData.append('upload_preset', 'syncup_preset');
        const res = await axios.post('https://api.cloudinary.com/v1_1/drjubxrbt/image/upload', formData).catch(err => toast(err.message))
        const { secure_url } = res?.data
        if (secure_url) {
            const options = {
                route: "/sendMediaMessage",
                headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
                payload: { secure_url, reciever: reciever._id, type: file.type,caption },
                method: "POST"
            }
            Axios(options).then(res => {
                if (res.data.success) {
                    setMedia(null)
                    setSending(false)
                } else {
                    setSending(false)
                    toast(res.data.message)
                }
            })
        } else {
            toast.error('Err while sending media')
        }
    }
    const hangUpCall = () => {
        socket.emit('onHangup', chat.data)
        setChat({ type: 'chat', data: chat.data.to })
    }
    const declineCall = () => {
        socket.emit('onDeclined', chat.data)
        setChat({ type: 'chat', data: chat.data.from })
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
    const props = {
        chat,
        setChat,
        reciever,
        setGo,
        setMessage,
        setOpenEmoji,
        handleFileInput,
        handleInputChange,
        inputRef,
        isSending,
        setSending,
        sendMessage,
        message,
        sendMedia,
        setReciever,
        isBlocked,
        fileInputRef
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
                    <ConversationTopBar {...props} />
                    <MessageRenderer {...props} />
                    <ConversationBottom {...props} removeLastEmoji={removeLastEmoji} />
                    {file?.data && <MediaSender isSending={isSending} setCaption={setCaption} sendMedia={sendMedia} fileInputRef={fileInputRef} setMedia={setMedia} file={file} />}
                </div>
            )}
            {openEmoji && <Emoji setMessage={setMessage} setOpenEmoji={setOpenEmoji} />}
            {(chat.type == 'videoCall') && <VidConfig declineCall={declineCall} chat={chat} hangUpCall={hangUpCall} />}
            {chat.type == 'UserProfile' && <UserDetails {...props} />}
        </>
    );
}
const ConversationBottom = function ({ isBlocked, message, removeLastEmoji, sendMessage, handleFileInput, handleInputChange, isSending, setSending, setOpenEmoji, inputRef, fileInputRef }) {
    return (
        <div className="conversationBottom">
            {isBlocked ? <div className='blockedDiv'> <p style={{ color: 'grey', fontSize: '13px' }}>This conversation has been ended</p> </div> : <>
                <img src={emoji} alt='not' onClick={() => setOpenEmoji(true)} />
                <input onKeyDown={(e) => (e.key == 'Backspace' && message.length < 3) && removeLastEmoji(e)} onInput={handleInputChange} onKeyUp={(e) => e.key == 'Enter' ? sendMessage() : false} value={message} type="text" ref={inputRef} placeholder='Type a message...' className="msgInput text-capitalize" />
                <img src={add} id='imageAdd' onClick={() => fileInputRef.current.click()} alt="" />
                <input type="file" onInput={handleFileInput} ref={fileInputRef} accept={"image/*, video/*"} hidden id="" />
                <img src={!message ? (!isSending ? mic : timer) : (!isSending ? send : timer)} onClick={!message ? () => alert('mic') : sendMessage} alt="" /></>}
        </div>
    )
}
export default ChatingInterface;
