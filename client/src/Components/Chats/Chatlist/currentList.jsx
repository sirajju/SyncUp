import React from 'react'
import { useSelector } from 'react-redux'

function CurrentList({ setChat}) {
    const conversations = useSelector(state=>state.conversations)
    return (
        <>
            {conversations.value.map((el,key) => {
                return (
                    <div key={key} className="chatlistItem cursor-pointer p-3" onClick={()=>{setChat({type:'chat',data:el.opponent[0]._id})}} >
                        <img src={el.opponent[0].avatar_url} className='chatIcon' alt="" />
                        <div className="chatDetails">
                            <div className="userContent">
                                <h5 className='userName'>{el.opponent[0].username} {el.isPremium && <span class="badge badge-success rounded-pill d-inline premiumBadge">Premium</span>} </h5>
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