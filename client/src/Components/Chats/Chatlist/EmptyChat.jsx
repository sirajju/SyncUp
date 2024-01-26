import React from 'react'
import empty from '../../../assets/Images/empty_chat.png'


function EmptyChat({openContactsModal}) {
    return (
        <div className="welcomeContainer">
            <img style={{ width: '70px', margin: '20px' }} src={empty} alt="" />
            <h2>Look like your chats is empty </h2>
            <button onClick={() => openContactsModal(true)}>
                Start chat
            </button>
        </div>
    )
}

export default EmptyChat