import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentChat } from '../../../Context/userContext'
import GetMessages from '../../../main/Chats/getMessages'

function CurrentList({ setChat, setGo }) {
    const conversations = useSelector(state => state.conversations)
    const dispatch = useDispatch()
    const setConversation = function (id) {
        setChat({ type: 'chat', data: id })
        

    }
    return (
        <>
            {conversations.value.map((el, key) => {
                return (
                    <div key={key} className="chatlistItem cursor-pointer p-3" onClick={() => { setConversation(el.opponent[0]._id) }} >
                        <img src={el.opponent[0].avatar_url} className='chatIcon' alt="" />
                        <div className="chatDetails">
                            <div className="userContent">
                                <h5 className='userName'>{el.opponent[0].username} {el.opponent[0].isPremium && <sup className="badge badge-success rounded-pill d-inline premiumBadge">Premium</sup>} </h5>
                                <p className="lastMessage">  {el.last_message[0].content}</p>
                            </div>
                            <div className="messageDetails d-flex flex-column justify-content-center align-items-center mt-2">
                                <h6 className='lastMsgTime'>{new Date(el.last_message[0].sentTime).getHours().toString().padStart(2, '0')}:{new Date(el.last_message[0].sentTime).getMinutes().toString().padStart(2, '0')}</h6>
                                <p className='unreadMsgCount'>2</p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </>
    )
}

export default CurrentList