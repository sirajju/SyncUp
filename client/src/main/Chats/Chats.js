import React, { useCallback, useEffect, useRef, useState } from 'react'
import ChatBox from '../../Components/Chats/ChatBox/ChatBox'
import Ads from '../../Components/Chats/AdsInterface/Ads'
import TopBar from '../../Components/Chats/TopBar/TopBar'
import ChatTabs from '../../Components/Chats/ChatTabs/ChatTabs'
import Chatslst from '../../Components/Chats/Chatlist/Chatlist'
import crypto from 'crypto-js'
import Profile from '../../Components/Profile/Profile'
import { useDispatch, useSelector } from 'react-redux'
import { addNewMessage, deleteMessage, hideLoading, markDelivered, markSeen, resetConversation, setAds, setCallData, setConversations, setCurrentChat, setLogs, setMyNotes, setNotes, setOpponent, setScheduledMsgs, setUserData } from '../../Context/userContext'
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
import Loader from '../../Components/Chats/Loader/Loader'
import Joyride from '../../Components/Joyride/Joyride'
import Notes from '../Notes/Notes'
import CallLog from '../../Components/CallLogs/CallLog'
import ScheduleMessages from '../../Components/ScheduleMessages/ScheduleMessages'

const Chatlist = React.memo(Chatslst)
const ChatingInterface = React.memo(chatingUi)

function Chats() {
    const [searchResult, setSearchData] = useState([])
    const ads = useSelector(state => state.ads)
    const notes = useSelector(state => state.notes)
    const socket = useSocket()
    const [chat, setChat] = useState({ type: null })
    const [isLoading, setLoading] = useState(true)
    const dispatch = useDispatch()
    const [go, setGo] = useState()
    const userData = useSelector(state => state.user)
    const [isSubLoading,setSubLoading]=useState(false)
    const history = useNavigate()
    const conversation = useSelector(state => state.conversations)
    const [activeTab, setActiveTab] = useState('Chats')
    const currentChat = useSelector(state => state.currentChat)
    useEffect(() => {

        function getAxiosOptions(route) {
            return {
                route: route,
                headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
                crypto: true
            };
        }

        function fetchData(route) {
            const options = getAxiosOptions(route);
            return Axios(options)
                .then(res => {
                    if (res.data.success) {
                        return res.data.body;
                    } else {
                        throw new Error(res.data.message);
                    }
                });
        }


        async function getAds() {
            const token = localStorage.getItem('SyncUp_Auth_Token');
            if (token && !userData.value.isPremium) {
                return fetchData('getAds')
                    .then(data => {
                        dispatch(setAds(data));
                    });
            } else {
                return Promise.resolve();
            }
        }

        function fetchDataMain() {
            if (userData.value._id) {
                socket.emit('set-socketId', { userId: userData.value._id });
            }
            return GetChatList('chat use effect')
                .then(res => {
                    dispatch(setConversations(res));
                })
                .then(getAds)
                .then(() => fetchData('getNotes').then(res=>dispatch(setNotes(res))))
                .then(() => fetchData('getMyNotes').then(res=>dispatch(setMyNotes(res))))
                .then(() => fetchData('getCallLogs').then(res=>dispatch(setLogs(res))))
                .then(() => fetchData('getScheduledMessages').then(res=>dispatch(setScheduledMsgs(res))))
                .then(() => {
                    return new Promise(resolve => {
                        resolve();
                    });
                })
                .catch(error => {
                    throw error;
                });
        }
        fetchDataMain()
            .then(() => setLoading(false))
            .catch(error => toast.error(error.message));
        // Making responsive on mobile screen
        // window.addEventListener('resize', () => {
        //     if (window.outerWidth <= 800 && chat.type) {
        //         setGo('MobileChat')
        //     } else {
        //         setGo('')
        //     }
        // })
    }, [])
    useEffect(() => {
        // Setting socket id on connected
        socket.on('connect', () => {
            if (userData.value._id) {
                socket.emit('set-socketId', {
                    userId: userData.value._id
                })
            }
        })
        const handleUpdate = () => {
            console.log('syncing userDsata');
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
        const handleSeen = async () => {
            dispatch(markSeen(userData.value._id))
        }
        const handleDelivered = async () => {
            dispatch(markDelivered(userData.value._id))
        }

        // Syncing userData whenever server calls
        socket.on('onUpdateNeeded', handleUpdate)
        // Resetting userData whenever a logout is needed
        socket.on('logoutUser', handleLogout)
        socket.on('msgSeen', handleSeen)
        socket.on('msgDelivered', handleDelivered)
        socket.on('callDeclined', (data) => {
            toast.error('Call declined')
            const id = data.from == userData.value._id ? data.to : data.from
            setChat({ type: 'chat', data: id })
        })

        socket.on('messageRecieved', async (data) => {
            if (data.newMessage) {
                dispatch(addNewMessage(data.newMessage))
                dispatch(setConversations(await GetChatList('messageReceived')))
            }
        })
        socket.on('msgDeleted', async (data) => {
            dispatch(deleteMessage(data.id))
            dispatch(setConversations(await GetChatList('Message deleted')))
        })
        socket.on('callRecieved', (data) => {
            setChat({ type: 'videoCall', data, isRecieved: true })
            dispatch(setCallData({ userId: data.from, isRecieved: true, isAccepted: false, isEnded: false }))
        })

        socket.on('userOffline', (data) => {
            toast.error(`User ${data.userName} is offline`)
            setChat({ type: null })
        })
    }, [socket])
    const handleSearch = useCallback(async (e) => {
        setSubLoading(true)
        if (e.target.value.trim()) {
            setChat({ type: null })
            const token = localStorage.getItem('SyncUp_Auth_Token')
            const options = {
                params: { user: e.target.value },
                route: "checkUser",
                headers: { Authorization: `Bearer ${token}` },
                crypto: true
            }
            const res = await Axios(options)
            setSubLoading(false)
            if (res.data.success) {
                setSearchData(res.data.body)
                dispatch(resetConversation())
            } else {
                dispatch(resetConversation())
                setSearchData({ notfound: true, data: [...res.data.body, { username: e.target.value }] })
            }
        } else {
            setSearchData([])
            dispatch(setConversations(await GetChatList('searchFunction')))
            setSubLoading(false)
        }
    }, [])


    const props = {
        setChat,
        chat,
        setGo
    }
    return (
        <>
            {isLoading && <Loader />}

            <ChatBox rightComponent={go != 'MobileChat' && <ChatingInterface {...props} />}>
                {go == `Profile` && <Profile chat={chat} setGo={setGo} />}
                {go == `Notifications` && <Notification setActiveTab={setActiveTab} setChat={setChat} setGo={setGo} />}
                {go == 'MobileChat' && chat.type && <ChatingInterface {...props} />}
                {go == 'CallLogs' && <CallLog setChat={setChat} setGo={setGo} />}
                {go == 'ScheduleMessages' && <ScheduleMessages isSubLoading={isSubLoading} setSubLoading={setSubLoading} setChat={setChat} setGo={setGo} />}
                {!go &&
                    <>

                        <TopBar activeTab={activeTab} setActiveTab={setActiveTab} handleSearch={handleSearch} setGo={setGo} />
                        <ChatTabs setGo={setGo} activeTab={activeTab} setActiveTab={setActiveTab} />
                        {
                            ['Notes', 'My Notes'].includes(activeTab) ?
                                <Notes activeTab={activeTab} /> :
                                    isSubLoading ? <div className='subLoader'> <span className="subLoaderSpinner" ></span> </div> :<Chatlist setChat={setChat} setSearchData={setSearchData} setGo={setGo} searchResult={searchResult} />
                        }
                        <Joyride />
                    </>}
            </ChatBox>
        </>
    )
}

export default Chats