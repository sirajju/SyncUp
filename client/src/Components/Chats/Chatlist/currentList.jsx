import React from 'react'

function currentList({ chatlist }) {
    return (
        <>
            {chatlist.map(el => {
                <div className="chatlistItem">
                    <img src={el.avatar_url} className='chatIcon' alt="" />
                    <div className="chatDetails">
                        <div className="userContent">
                            <h5 className='userName'>{el.username} {el.isPremium && <span class="badge badge-success rounded-pill d-inline premiumBadge">Premium</span>} </h5>
                            <p className="lastMessage">Hey there how are you ?</p>
                        </div>
                        <div className="messageDetails">
                            <h6 className='lastMsgTime'>1:27pm</h6>
                            <p className='unreadMsgCount'>2</p>
                        </div>
                    </div>
                </div>
            })}
        </>
    )
}

export default currentList