import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentChat,setConversations as setGlobalConversation } from '../../../Context/userContext'
import { useSocket } from '../../../Context/socketContext'
import imageIcon from '../../../assets/Images/image.png'
import businessBadge from '../../../assets/Images/verified.png'
import { Dropdown } from 'antd';
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

function CurrentList({ setChat, setGo }) {
    const conversations = useSelector(state => state.conversations)
    const userData = useSelector(state => state.user)
    const socket = useSocket()
    const dispatch = useDispatch()
    const unrdRef = useRef()
    useEffect(() => {
        if (unrdRef.current) {
            gettUnread()
        }
    }, [unrdRef])
    const setConversation = function (id) {
        setChat({ type: 'chat', data: id })
        socket.emit('markMsgSeen', { userId: id })
    }
    const gettUnread = function (msgs) {
        return msgs?.filter(el => (el?.isReaded == false && el.senderId != userData.value._id && !el.isDeleted))?.length
    }
    const clearMessage = function(user){
        const options = {
            route:"clearConversationMessages",
            headers:{Authorization:`Bearer ${localStorage.getItem('SyncUp_Auth_Token')}`},
            params:{chatId:user._id}
        }
        Axios(options).then(async res=>{
            if(res.data.success){
                dispatch(setCurrentChat(await GetMessages(user.opponent[0]._id)))
                dispatch(setGlobalConversation(await GetChatlist()))
                toast.success(res.data.message)
            }
        })
    }
    const itemFunction = {
        viewContact:(el)=>{setChat({type:"UserProfile",data:el.opponent[0]._id})},
        clearMessage
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
            danger: true
        },
        {
            label: 'Block user',
            key: 'blockUser',
            icon: <MDBIcon fas icon="ban" />,
            danger: true
        },
    ];
    return (
        <>
            {conversations.value.length && conversations.value.map((el, key) => {
                const a = gettUnread(el.messages)
                return (
                    <Dropdown
                        menu={{
                            items: myNotesItems,
                            onClick: ({ key }) => itemFunction[key]?.call(this,el),
                        }}
                        trigger={['contextMenu']}
                    >
                        <div key={key} className="chatlistItem cursor-pointer p-3" onClick={() => { setConversation(el.opponent[0]._id) }} >
                            <img src={el.opponent[0].avatar_url} className='chatIcon' alt="" />
                            <div className="chatDetails">
                                <div>
                                    <h5 className='userName'>{el.opponent[0].username} {el.opponent[0].isPremium && <sup className="badge badge-success rounded-pill d-inline premiumBadge">Premium</sup>}  {el.opponent[0].isBusiness && <img src={businessBadge} className='businessBadge' alt="" />} </h5>
                                    {el?.messages.length ? <p className="lastMessage" style={{whiteSpace:"nowrap"}}> {el.last_message?.isDeleted ? "This messsage has been vanished" : !el.last_message?.isMedia ? el.last_message?.content.slice(0, 45) : <img style={{ width: "20px" }} src={imageIcon} />}</p> :""}
                                </div>
                                <div className="messageDetails d-flex flex-column justify-content-center align-items-center mt-2">
                                    {el.last_message ? <h6 className='lastMsgTime'>{new Date(parseInt(el.last_message.sentTime)).getDate() == new Date().getDate() ? (el.sentTimeString?el.sentTimeString:new Date(parseInt(el.last_message.sentTime)).toLocaleTimeString('en-US', { hour: '2-digit', minute: "2-digit", hour12: true })) : new Date(parseInt(el.last_message.sentTime)).getDate() == new Date().getDate() - 1 ? "Yesterday" : (el.sentDateString? el.sentDateString:new Date(parseInt(el.last_message.sentTime)).toLocaleDateString())} </h6> : <h6 className='lastMsgTime' >None</h6>}
                                    <p className={`unreadMsgCount ${a ? 'visible' : 'invisible'}`} ref={unrdRef} >{a}</p>
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