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
import Settings from '../../Components/Settings/Settings'

const Chatlist = React.memo(Chatslst)
const ChatingInterface = React.memo(chatingUi)

function Chats() {
    const [searchResult, setSearchData] = useState([])
    const socket = useSocket()
    const [chat, changeChat] = useState({ type: null })
    const [isLoading, setLoading] = useState(true)
    const dispatch = useDispatch()
    const [go, setGo] = useState()
    const userData = useSelector(state => state.user)
    const [isSubLoading, setSubLoading] = useState(false)
    const history = useNavigate()
    const [activeTab, setActiveTab] = useState('Chats')
    const setChat = function (cht) {
        if (chat.isRestricted && cht.type && !cht.isRestricted) {
            toast.error("Activity restricted")
            return false
        }
        if (cht.type == 'videoCall') {
            window.onbeforeunload = (e) => {
                e.preventDefault()
                e.returnValue = ''
            }
            return changeChat({ ...cht, isRestricted: true })
        }
        window.onbeforeunload = (e) => { }
        return changeChat(cht)
    }
    useEffect(() => {
        if (isLoading) {
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
                            return dispatch(setAds(data));
                        });
                }
                return Promise.resolve();

            }

            function fetchDataMain() {
                if (userData.value._id) {
                    socket.emit('set-socketId', { userId: userData.value._id });
                }
                return GetChatList('chat use effect')
                    .then(res => {
                        // createTable('conversations', Object.keys(res[0])).then(() => {
                        //     insertToTable('conversations', res)
                        // })
                        return dispatch(setConversations(res));
                    })
                    .then(getAds)
                    .then(() => fetchData('getNotes').then(res => dispatch(setNotes(res))))
                    .then(() => fetchData('getMyNotes').then(res => dispatch(setMyNotes(res))))
                    .then(() => fetchData('getCallLogs').then(res => dispatch(setLogs(res))))
                    .then(() => fetchData('getScheduledMessages').then(res => dispatch(setScheduledMsgs(res))))
                    .then(() => {
                        return new Promise(resolve => {
                            setLoading(false)
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
        }


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
        // socket.on('callDeclined', (data) => {
        //     toast.error('Call declined')
        //     const id = data.from == userData.value._id ? data.to : data.from
        //     setChat({ type: 'chat', data: id })
        // })

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

        socket.on("requestJoin", async data => {
            setChat({ type: "videoCall", data, isRequested: true, isRecieved: true })
        })

        socket.on('userOffline', (data) => {
            toast.error(`User ${data.userName} is offline`)
            setChat({ type: null })
        })
    }, [socket])

    const reConfgiConversation = async () => {
        setSubLoading({ text: "Refreshing.." })
        setSearchData([])
        dispatch(setConversations(await GetChatList('searchFunction')))
        setSubLoading(false)
    }

    const handleSearch = useCallback(async (value) => {
        if (activeTab !== 'Chats') setActiveTab('Chats')
        if (value.trim()) {
            setSubLoading({ text: "Searching.." })
            setChat({ type: null })
            const token = localStorage.getItem('SyncUp_Auth_Token')
            const options = {
                params: { user: value },
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
                setSearchData({ notfound: true, data: [...res.data.body, { username: value }] })
            }
            setSubLoading(false)
        } else {
            setSearchData([])
            setSubLoading({ text: "Refreshing.." })
            GetChatList('searchFunction').then(res => {
                dispatch(setConversations(res))
                setSubLoading(false)
            })

        }
    }, [])

    useEffect(() => {
        if (window.outerWidth <= 1000 && chat.type) {
            setGo('MobileChat')
        } else {
            setGo('')
        }
    }, [chat])


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
                {go == 'Settings' && <Settings isSubLoading={isSubLoading} setSubLoading={setSubLoading} setChat={setChat} setGo={setGo} />}
                {!go &&
                    <>

                        <TopBar reConfgiConversation={reConfgiConversation} activeTab={activeTab} setActiveTab={setActiveTab} handleSearch={handleSearch} setGo={setGo} />
                        <ChatTabs setGo={setGo} activeTab={activeTab} setActiveTab={setActiveTab} />
                        {
                            ['Notes', 'My Notes'].includes(activeTab) ?
                                <Notes activeTab={activeTab} /> :
                                isSubLoading ? <div className='subLoader'> <span className="subLoaderSpinner" > </span>  <p>{isSubLoading.text}</p> </div> :
                                    <Chatlist setChat={setChat} setSearchData={setSearchData} setGo={setGo} searchResult={searchResult} />
                        }
                        <Joyride />
                    </>}
            </ChatBox>
        </>
    )
}

export default Chats