import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentChat } from '../../../Context/userContext'
import GetMessages from '../../../main/Chats/getMessages'
import { useSocket } from '../../../Context/socketContext'
import imageIcon from '../../../assets/Images/image.png'
import businessBadge from '../../../assets/Images/verified.png'

function CurrentList({ setChat, setGo }) {
    const conversations = useSelector(state => state.conversations)
    const userData = useSelector(state=>state.user)
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
        return msgs?.filter(el => (el?.isReaded == false && el.senderId!=userData.value._id && !el.isDeleted))?.length
    }
    return (
        <>
            {conversations.value.length && conversations.value.map((el, key) => {
                const a = gettUnread(el.messages)
                return (
                    <div key={key} className="chatlistItem cursor-pointer p-3" onClick={() => { setConversation(el.opponent[0]._id) }} >
                        <img src={el.opponent[0].avatar_url} className='chatIcon' alt="" />
                        <div className="chatDetails">
                            <div>
                                <h5 className='userName'>{el.opponent[0].username} {el.opponent[0].isPremium && <sup className="badge badge-success rounded-pill d-inline premiumBadge">Premium</sup>}  {el.opponent[0].isBusiness && <img src={businessBadge} className='businessBadge' alt="" />} </h5>
                                <p className="lastMessage">  {el.last_message[0]?.isDeleted ? "This messsage has been vanished" : !el.last_message[0]?.isMedia ? el.last_message[0]?.content.slice(0,45):<img style={{width:"20px"}} src={imageIcon}/>}</p>
                            </div>
                            <div className="messageDetails d-flex flex-column justify-content-center align-items-center mt-2">
                                {el.last_message[0] ? <h6 className='lastMsgTime'>{new Date(parseInt(el.last_message[0].sentTime)).getDate() == new Date().getDate() ? new Date(parseInt(el.last_message[0].sentTime)).toLocaleTimeString('en-US',{hour:'2-digit',minute:"2-digit",hour12:true}) : new Date(parseInt(el.last_message[0].sentTime)).getDate() == new Date().getDate() - 1 ? "Yesterday" :new Date(parseInt(el.last_message[0].sentTime)).toLocaleDateString()} </h6> : <h6 className='lastMsgTime' >None</h6>}
                                <p className={`unreadMsgCount ${a ? 'visible' :'invisible'}`} ref={unrdRef} >{a}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </>
    )
}

export default CurrentList