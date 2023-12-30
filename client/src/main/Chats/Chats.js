import React, { useEffect, useState } from 'react'
import ChatBox from '../../Components/Chats/ChatBox/ChatBox'
import Ads from '../../Components/Chats/AdsInterface/Ads'
import TopBar from '../../Components/Chats/TopBar/TopBar'
import ChatTabs from '../../Components/Chats/ChatTabs/ChatTabs'
import Chatlist from '../../Components/Chats/Chatlist/Chatlist'
import axios from 'axios'
import crypto from 'crypto-js'
import Profile from '../../Components/Profile/Profile'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from '../../Context/userContext'
import { io } from 'socket.io-client';
import Notification from '../../Components/Chats/Notifications/Notification'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import ChatingInterface from '../../Components/Chats/Chatlist/ChatingInterface'


function Chats() {
    const [searchResult, setSearchData] = useState([])
    const dispatch = useDispatch()
    const [chat,setChat]=useState(null)
    const [go, setGo] = useState()
    const userData = useSelector(state => state.user)
    const socket = io(`http://${window.location.hostname}:5000`)
    const [chatlist, setChatlist] = useState([])
    const history = useNavigate()
    useEffect(() => {
        socket.on('onUpdateNeeded', () => {
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
        })
        socket.on('logoutUser', ({ message }) => {
            toast.error(message)
            localStorage.removeItem('SyncUp_Auth_Token')
            localStorage.removeItem('syncup_opened')
            history('/login')
        })
        socket.on('connect', () => {
            if (userData.value._id) {
                socket.emit('set-socketId', {
                    userId: userData.value._id
                })
            }
        })
    }, [socket])
    const handleSearch = (e) => {
        if (e.target.value) {
            const token = localStorage.getItem('SyncUp_Auth_Token')
            axios.get(`http://${window.location.hostname}:5000/checkUser?user=${e.target.value}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(res => {
                if (res.data.success) {
                    const decrypted = crypto.AES.decrypt(res.data.body, `syncupservercryptokey`).toString(crypto.enc.Utf8)
                    setSearchData(JSON.parse(decrypted))
                } else {
                    setSearchData({ notfound: e.target.value })
                }
            }).catch(err => alert(err.message))
        } else {
            setSearchData([])
        }
    }
    return (
        <ChatBox rightComponent={<ChatingInterface chat={chat} />}>
            {go == `Profile` && <Profile setGo={setGo} />}
            {go == `Notifications` && <Notification setGo={setGo} />}
            {!go &&
                <>
                    <TopBar handleSearch={handleSearch} setGo={setGo} />
                    <ChatTabs activeTab={'Chats'} />
                    <Chatlist setChat={setChat} chatlist={chatlist} searchResult={searchResult} />

                </>}
        </ChatBox>
    )
}

export default Chats