import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentChat } from '../../../Context/userContext'
import GetMessages from '../../../main/Chats/getMessages'
import { useSocket } from '../../../Context/socketContext'

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
                            <div className="userContent">
                                <h5 className='userName'>{el.opponent[0].username} {el.opponent[0].isPremium && <sup className="badge badge-success rounded-pill d-inline premiumBadge">Premium</sup>} </h5>
                                <p className="lastMessage">  {el.last_message[0]?.isDeleted ? "This messsage has been vanished" : el.last_message[0]?.content}</p>
                            </div>
                            <div className="messageDetails d-flex flex-column justify-content-center align-items-center mt-2">
                                <h6 className='lastMsgTime'>{new Date(el.last_message[0]?.sentTime).getHours().toString().padStart(2, '0')}:{new Date(el.last_message[0]?.sentTime).getMinutes().toString().padStart(2, '0')}</h6>
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