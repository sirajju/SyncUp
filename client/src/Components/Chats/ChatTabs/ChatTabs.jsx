import React from 'react'
import './ChatTabs.css'
import rightIcon from '../../../assets/svgIcons/right.png'

function ChatTabs({ activeTab,setActiveTab }) {
    return (
        <div className="chatTabs">
            <h2 className='activeTab'>{activeTab || 'Chats'}</h2>
            <img className='rightIcon' src={rightIcon} alt="" />
            <h5 className='inActiveTab' onClick={()=>setActiveTab(activeTab == 'Chats' ? "Notes" : "Chats")} >{activeTab == 'Chats' ? "Notes" : "Chats"}</h5>
        </div>
    )
}

export default ChatTabs