import React from 'react'
import './ChatTabs.css'
import rightIcon from '../../../assets/svgIcons/right.png'
import callLog from '../../../assets/Images/call_log.png'
import declineIcon from '../../../assets/Images/decline.png'

function ChatTabs({ activeTab, setActiveTab,setGo }) {
    return (
        <div className="chatTabs">
            <h2 className='activeTab'>{activeTab || 'Chats'}</h2>
            <img className='rightIcon' src={rightIcon} alt="" />
            <h5 className='inActiveTab' onClick={() => setActiveTab(activeTab == 'Chats' ? "Notes" : "Chats")} >{activeTab == 'Chats' ? "Notes" : "Chats"}</h5>
            <div>
                <img onClick={()=>setGo('CallLogs')} className='rightIcon callLogIcon' title='Call logs' style={{cursor:'pointer'}} src={callLog} alt="" />
            </div>
        </div>
    )
}

export default ChatTabs