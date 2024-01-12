import React, { useCallback, useEffect, useState } from 'react'
import ChatBox from '../../Components/Chats/ChatBox/ChatBox'
import Ads from '../../Components/Chats/AdsInterface/Ads'
import TopBar from '../../Components/Chats/TopBar/TopBar'
import ChatTabs from '../../Components/Chats/ChatTabs/ChatTabs'
import Chatlist from '../../Components/Chats/Chatlist/Chatlist'
import axios from 'axios'
import crypto from 'crypto-js'
import Profile from '../../Components/Profile/Profile'
import { useDispatch, useSelector } from 'react-redux'
import { addNewMessage, markDelivered, markSeen, resetConversation, setCallData, setConversations, setCurrentChat, setUserData } from '../../Context/userContext'
import { io } from 'socket.io-client';
import Notification from '../../Components/Chats/Notifications/Notification'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import ChatingInterface from '../../Components/Chats/Chatlist/ChatingInterface'
import GetChatList from './getChatList'
import getMessages from './getMessages'
import GetMessages from './getMessages'


function Chats() {
    const socket = io(`http://${window.location.hostname}:5000`)
    const [searchResult, setSearchData] = useState([])
    const dispatch = useDispatch()
    const [chat, setChat] = useState({ type: null })
    const [go, setGo] = useState()
    const userData = useSelector(state => state.user)
    const call = useSelector(state => state.call)
    const history = useNavigate()

    useEffect(() => {
        const handleConnect = () => {
            if (userData.value._id) {
                socket.emit('set-socketId', {
                    userId: userData.value._id
                })
            }
        }
        socket.on('connect', handleConnect)
        const handleUpdate = () => {
            const token = localStorage.getItem('SyncUp_Auth_Token')
            axios.get(`http://${window.location.hostname}:5000/isAlive?getData=true`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(res => {
                if (res.data.success) {
                    const decrypted = crypto.AES.decrypt(res.data.body, 'syncupservercryptokey').toString(crypto.enc.Utf8);
                    dispatch(setUserData(JSON.parse(decrypted)));
                } else {
                    toast.error(res.data.message)
                    localStorage.removeItem('SyncUp_Auth_Token')
                    history('/login')
                }
            }).catch(err => alert(err.message))
        }
        const handleLogout = ({ message }) => {
            toast.error(message)
            localStorage.removeItem('SyncUp_Auth_Token')
            localStorage.removeItem('syncup_opened')
            history('/login')
        }
        const handleRecieved = async (data) => {
            dispatch(addNewMessage(data.newMessage))
            dispatch(setConversations(await GetChatList()))
        }
        const handleSent = async (data) => {
            dispatch(setCurrentChat(await GetMessages(data.newMessage.recieverId)))
            dispatch(setConversations(await GetChatList()))
        }
        const handleSeen = () => {
            dispatch(markSeen(userData.value._id))
        }
        const handleDelivered = () => {
            dispatch(markDelivered(userData.value._id))
        }
        
        socket.on('onUpdateNeeded', handleUpdate)
        socket.on('logoutUser', handleLogout)
        socket.on('messageRecieved', handleRecieved)
        socket.on('msgSent', handleSent)
        socket.on('msgSeen', handleSeen)
        socket.on('msgDelivered', handleDelivered)
        
        socket.on('callRecieved', (data) => {
            setChat({ type: 'videoCall', data: data.userId,isRecieved:true })
            dispatch(setCallData({ userId: data.userId, isRecieved: true }))
        })
        socket.on('callEnded', (data) => {
            const videos = document.querySelectorAll('video')
            videos.forEach(video => {
                const stream = video.srcObject
                stream.getVideoTracks().forEach(track => track.stop());
                stream.getAudioTracks().forEach(track => track.stop());
                video.srcObject = null
            })
            window.location.reload()
        })
        socket.on('callDeclined', (data) => {
            const videos = document.querySelectorAll('video')
            videos.forEach(video => {
                const stream = video.srcObject
                stream.getVideoTracks().forEach(track => track.stop());
                stream.getAudioTracks().forEach(track => track.stop());
                video.srcObject = null
            })
            window.location.reload()
        })
        socket.on('userOffline',(data)=>{
            toast.error(`User ${data.userName} is offline`)
            const videos = document.querySelectorAll('video')
            videos.forEach(video => {
                const stream = video.srcObject
                stream.getVideoTracks().forEach(track => track.stop());
                stream.getAudioTracks().forEach(track => track.stop());
                video.srcObject = null
            })
            setChat({type:null})
        })
        async function a() {
            const mes = await GetChatList()
            dispatch(setConversations(mes))
        }
        a()
        return () => socket.disconnect()
    }, [])
    const handleSearch = async (e) => {
        if (e.target.value.trim()) {
            const token = localStorage.getItem('SyncUp_Auth_Token')
            axios.get(`http://${window.location.hostname}:5000/checkUser?user=${e.target.value}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(res => {
                if (res.data.success) {
                    const decrypted = crypto.AES.decrypt(res.data.body, `syncupservercryptokey`).toString(crypto.enc.Utf8)
                    setSearchData(JSON.parse(decrypted))
                    dispatch(resetConversation())
                } else {
                    dispatch(resetConversation())
                    setSearchData({ notfound: e.target.value })
                }
            }).catch(err => alert(err.message))
        } else {
            setSearchData([])
            dispatch(setConversations(await GetChatList()))
        }
    }
    const props = {
        setChat,
        chat,
        socket
    }
    return (
        <ChatBox rightComponent={<ChatingInterface {...props} />}>
            {go == `Profile` && <Profile setGo={setGo} />}
            {go == `Notifications` && <Notification setChat={setChat} setGo={setGo} />}
            {!go &&
                <>
                    <TopBar handleSearch={handleSearch} setGo={setGo} />
                    <ChatTabs activeTab={'Chats'} />
                    <Chatlist setChat={setChat} searchResult={searchResult} />
                </>}
        </ChatBox>
    )
}

export default Chats