import React, { useCallback, useEffect, useState } from 'react'
import ChatBox from '../../Components/Chats/ChatBox/ChatBox'
import Ads from '../../Components/Chats/AdsInterface/Ads'
import TopBar from '../../Components/Chats/TopBar/TopBar'
import ChatTabs from '../../Components/Chats/ChatTabs/ChatTabs'
import Chatslst from '../../Components/Chats/Chatlist/Chatlist'
import crypto from 'crypto-js'
import Profile from '../../Components/Profile/Profile'
import { useDispatch, useSelector } from 'react-redux'
import { addNewMessage, markDelivered, markSeen, resetConversation, setCallData, setConversations, setCurrentChat, setUserData } from '../../Context/userContext'
import Notification from '../../Components/Chats/Notifications/Notification'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import chatingUi from '../../Components/Chats/Chatlist/ChatingInterface'
import GetChatList from './getChatList'
import getMessages from './getMessages'
import GetMessages from './getMessages'
import Axios from '../../interceptors/axios'
import { useSocket } from '../../Context/socketContext'
import { io } from 'socket.io-client'

const Chatlist = React.memo(Chatslst)
const ChatingInterface = React.memo(chatingUi)

function Chats() {
    const [searchResult, setSearchData] = useState([])
    const socket = useSocket()
    const [chat,setChat]=useState({type:null})
    const dispatch = useDispatch()
    const [go, setGo] = useState()
    const userData = useSelector(state => state.user)
    const history = useNavigate()
    useEffect(() => {
        window.addEventListener('resize',()=>{
            if(window.outerWidth <=800&&chat.type){
                setGo('MobileChat')
            }else{
                setGo('')
            }
        })
        socket.on('connect', () => {
            if (userData.value._id) {
                socket.emit('set-socketId', {
                    userId: userData.value._id
                })
            }
        })
        const handleUpdate = () => {
            const token = localStorage.getItem('SyncUp_Auth_Token')
            const options = {
                route: "isAlive",
                params: { getData: true },
                headers: { Authorization: `Bearer ${token}` },
                crypto: true
            }
            Axios(options).then(res => {
                if (res.data.success) {
                    dispatch(setUserData(res.data.body));
                } else {
                    toast.error(res.data.message)
                    localStorage.removeItem('SyncUp_Auth_Token')
                    history('/login')
                }
            })
        }
        const handleLogout = ({ message }) => {
            toast.error(message)
            localStorage.removeItem('SyncUp_Auth_Token')
            localStorage.removeItem('syncup_opened')
            history('/login')
        }
        const handleSeen = () => {
            dispatch(markSeen(userData.value._id))
        }
        const handleDelivered = () => {
            dispatch(markDelivered(userData.value._id))
        }
        socket.on('onUpdateNeeded', handleUpdate)
        socket.on('logoutUser', handleLogout)
        socket.on('msgSeen', handleSeen)
        socket.on('msgDelivered', handleDelivered)
        socket.on('msgSent', () => {
            alert('msgSent')
        })
        socket.on('messageRecieved', async (data) => {
            dispatch(addNewMessage(data.newMessage))
            dispatch(setConversations(await GetChatList()))
        })
        socket.on('callRecieved', (data) => {
            setChat({ type: 'videoCall', data, isRecieved: true })
            dispatch(setCallData({ userId: data.from, isRecieved: true, isAccepted: false, isEnded: false }))
        })
        
        socket.on('userOffline', (data) => {
            toast.error(`User ${data.userName} is offline`)
            setChat({ type: null })
        })

        async function a() {
            if (userData.value._id) {
                socket.emit('set-socketId', {
                    userId: userData.value._id
                })
            }
            const mes = await GetChatList()
            dispatch(setConversations(mes))
        }
        a()
     
    }, [])
    const handleSearch = useCallback(async (e) => {
        if (e.target.value.trim()) {
            const token = localStorage.getItem('SyncUp_Auth_Token')
            const options = {
                params: { user: e.target.value },
                route: "checkUser",
                headers: { Authorization: `Bearer ${token}` },
                crypto: true
            }
            const res = await Axios(options)
            if (res.data.success) {
                setSearchData(res.data.body)
                dispatch(resetConversation())
            } else {
                dispatch(resetConversation())
                setSearchData({ notfound: true, data: [...res.data.body, { username: e.target.value }] })
            }
        } else {
            setSearchData([])
            dispatch(setConversations(await GetChatList()))
        }
    }, [])
    const props = {
        setChat,
        chat,
        setGo
    }
    return (
        <ChatBox rightComponent={go!='MobileChat'&&<ChatingInterface {...props} />}>
            {go == `Profile` && <Profile setGo={setGo} />}
            {go == `Notifications` && <Notification setChat={setChat} setGo={setGo} />}
            {go=='MobileChat'&&chat.type&&<ChatingInterface {...props} />}
            {!go &&
                <>
                    <TopBar handleSearch={handleSearch} setGo={setGo} />
                    <ChatTabs activeTab={'Chats'} />
                    <Chatlist setChat={setChat} setGo={setGo}  searchResult={searchResult} />
                </>}
        </ChatBox>
    )
}

export default Chats