import React from 'react'
import './ChatTabs.css'
import rightIcon from '../../../assets/svgIcons/right.png'

function ChatTabs({ activeTab }) {
    return (
        <div className="chatTabs">
            <h2 className='activeTab'>{activeTab || 'Chats'}</h2>
            <img className='rightIcon' src={rightIcon} alt="" />
            <h5>{activeTab == 'Chats' ? "Updates" : "Chats"}</h5>
        </div>
    )
}

export default ChatTabs