import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setConversations, setCurrentChat, setConversations as setGlobalConversation, setUserData } from '../../../Context/userContext'
import { useSocket } from '../../../Context/socketContext'
import imageIcon from '../../../assets/Images/image.png'
import businessBadge from '../../../assets/Images/verified.png'
import { Dropdown, FloatButton } from 'antd';
import menuIcon from '../../../assets/svgIcons/menu.png';
import syncIcon from '../../../assets/svgIcons/sync.png';
import notification from '../../../assets/Images/notification.png';
import newIcon from '../../../assets/Images/new.png';
import notesIcon from '../../../assets/Images/notes.png';
import premiumIcon from '../../../assets/Images/premium_icon.png';
import shareIcon from '../../../assets/Images/share.png';
import deleteIcon from '../../../assets/Images/delete.png';
import { MDBIcon } from 'mdb-react-ui-kit'
import Axios from '../../../interceptors/axios'
import toast from 'react-hot-toast'
import GetChatlist from '../../../main/Chats/getChatList'
import GetMessages from '../../../main/Chats/getMessages'
import Confirmation from '../../Confirmation/Dailogue'

function CurrentList({ setChat, setGo }) {
    const conversations = useSelector(state => state.conversations)
    const userData = useSelector(state => state.user)
    const socket = useSocket()
    const [isConfirmed, setConfirmed] = useState(false)
    const [dailogueData, setDailogueData] = useState({})
    const dispatch = useDispatch()
    const [selectedConv, setSelectedConv] = useState(null)
    const setConversation = function (id) {
        setChat({ type: 'chat', data: id })
        socket.emit('markMsgSeen', { userId: id })
    }
    const gettUnread = function (msgs) {
        return msgs?.filter(el => (el?.isReaded == false && el.senderId != userData.value._id && !el.isDeleted))?.length
    }
    const clearMessage = async function (el) {
        dispatch(setCurrentChat([]))
        dispatch(setGlobalConversation(await GetChatlist()))
        setConfirmed(false)
        const options = {
            route: "clearConversationMessages",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
            params: { chatId: el._id }
        }
        Axios(options).then(res => {
            if (res.data.success) {
                setChat({})
                toast.success(res.data.message)
            }
        })
    }
    const deleteConversation = function (el) {
        setConfirmed(false)
        const options = {
            route: "deleteConversation",
            params: { chatId: el._id },
            headers: { Authorization: `Bearer ${localStorage.getItem("SyncUp_Auth_Token")}` },
            method: "DELETE"
        }
        Axios(options).then(res => {
            if (res.data.success) {
                toast.success(res.data.message)
            }
        })

    }
    const blockUser = function (el) {
        const options = {
            route: isBlocked(el) ? 'unBlockContact' : 'blockContact',
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
            payload: { userId: el.opponent[0]._id },
            method: "POST"
        }
        if (options['route'] == 'unBlockContact') {
            dispatch(setUserData({ ...userData.value, blockedContacts: userData.value.blockedContacts.filter(u => u.userId != el.opponent[0]._id) }))
        } else {
            dispatch(setUserData({ ...userData.value, blockedContacts: [...userData.value.blockedContacts, { userId: el.opponent[0]._id, blockedAt: Date.now() }] }))
        }
        setConfirmed(false)
        Axios(options).then(async res => {
            if (!res.data.success) {
                toast.error(res.data.message)
            }
        })
    }
    const itemFunction = {
        viewContact: (el) => { setChat({ type: "UserProfile", data: el.opponent[0]._id }) },
        clearMessage: (el) => { setDailogueData({ content: "Do you want to clear messages of the current Conversation.?", params: el, posFunc: clearMessage, children: "Note : All media and messages will be cleared" }); setConfirmed(true); },
        deleteConversation: (el) => { setDailogueData({ content: "Do you want to delete this current Conversation.?", params: el, posFunc: deleteConversation, children: "Note : All media and messages will be cleared" }); setConfirmed(true); },
        blockUser: (el) => { setDailogueData({ content: `Do you want to block ${el.opponent[0].username}..?`, params: el, posFunc: blockUser, children: "Note : You will not able send or recieve messages " }); setConfirmed(true); },
        // deleteConversation,
    }
    const myNotesItems = [
        // {
        //     label: 'View contact',
        //     key: 'viewContact',
        //     icon: <MDBIcon fas icon="search" />,
        // },
        {
            label: 'Clear messages',
            key: 'clearMessage',
            icon: <MDBIcon fas icon="broom" />,
        },
        {
            label: 'Delete conversation',
            key: 'deleteConversation',
            icon: <MDBIcon far icon="trash-alt" />,
            disabled: true,
            danger: true
        },
        {
            label: 'Block user',
            key: 'blockUser',
            icon: <MDBIcon fas icon="ban" />,
            danger: true,
        },
    ];
    const isBlocked = (usr) => {
        return userData.value.blockedContacts.filter(el => el.userId == usr.opponent[0]._id).length
    }
    const getItems = (usr) => {
        if (isBlocked(usr)) {
            return myNotesItems.map(el => {
                if (el.key == 'blockUser') {
                    return { ...el, label: <span className='text-success' >UnBlock user</span>, icon: <MDBIcon far className='text-success' icon="circle" />, danger: false }
                }
                return el
            })
        }
        return myNotesItems
    }
    return (
        <>
            <Confirmation title="Think again.." params={dailogueData.params} posFunc={dailogueData.posFunc} content={dailogueData.content} value={isConfirmed} func={setConfirmed}>
                <p className='text-danger m-3 mb-1' style={{ fontSize: "13px" }} >{dailogueData.children}</p>
            </Confirmation>

            {conversations.value.length && conversations.value.map((el, key) => {
                const a = gettUnread(el.messages)
                return (
                    <Dropdown
                        menu={{
                            items: getItems(el),
                            onClick: ({ key }) => itemFunction[key]?.call(this, el),
                        }}
                        placement="bottom"
                        arrow={{
                            pointAtCenter: true,
                        }}
                        trigger={['contextMenu']}
                    >
                        <div key={key} className="chatlistItem cursor-pointer p-3" onClick={() => { setConversation(el.opponent[0]._id) }} >
                            <img src={el.opponent[0].avatar_url} className='chatIcon' alt="" />
                            <div className="chatDetails">
                                <div className='lstMsgD'>
                                    <h5 className='userName'>{el.opponent[0].username} {el.opponent[0].isPremium && <span className="badge badge-success rounded-pill d-inline premiumBadge">Premium</span>}  {el.opponent[0].isBusiness && <img src={businessBadge} className='businessBadge' alt="" />} </h5>
                                    {el?.messages.length ? <p className="lastMessage"> {el.last_message?.isDeleted ? "This messsage has been vanished" : !el.last_message?.isMedia ? el.last_message?.content : <img style={{ width: "20px" }} src={imageIcon} />}</p> : ""}
                                </div>
                                <div className="messageDetails d-flex flex-column justify-content-center align-items-center mt-2">
                                    {el.last_message ? <h6 className='lastMsgTime' style={{ whiteSpace: "nowrap" }}>{new Date(parseInt(el.last_message.sentTime)).getDate() == new Date().getDate() ? (el.sentTimeString ? el.sentTimeString : new Date(parseInt(el.last_message.sentTime)).toLocaleTimeString('en-US', { hour: '2-digit', minute: "2-digit", hour12: true })) : new Date(parseInt(el.last_message.sentTime)).getDate() == new Date().getDate() - 1 ? "Yesterday" : (el.sentDateString ? el.sentDateString : new Date(parseInt(el.last_message.sentTime)).toLocaleDateString())} </h6> : <h6 className='lastMsgTime' >None</h6>}
                                    <p className={`unreadMsgCount ${a ? 'visible' : 'invisible'}`} >{a}</p>
                                </div>
                            </div>
                        </div>
                    </Dropdown>
                )
            })}
        </>
    )
}

export default CurrentList