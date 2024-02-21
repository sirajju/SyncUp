import React, { useEffect, useState } from 'react'
import './ChatTabs.css'
import rightIcon from '../../../assets/svgIcons/right.png'
import callLog from '../../../assets/Images/call_log.png'
import declineIcon from '../../../assets/Images/decline.png'
import { useSelector } from 'react-redux'

function ChatTabs({ activeTab, setActiveTab,setGo }) {
    const callLogs = useSelector(state=>state.callLogs)
    const userData = useSelector(state=>state.user)
    const [hasToRead,setunRead] = useState(false)
    useEffect(()=>{
        const lenUnRead = callLogs.value.filter(el=>{
            if(el.data.to == userData.value._id.toString() && el.data.isReaded==false){
                return el
            }
        }).length
        setunRead(Boolean(lenUnRead))
    },[callLogs])
    return (
        <div className="chatTabs">
            <h2 className='activeTab'>{activeTab || 'Chats'}</h2>
            <img className='rightIcon' src={rightIcon} alt="" />
            <h5 className='inActiveTab' onClick={() => setActiveTab(activeTab == 'Chats' ? "Notes" : "Chats")} >{activeTab == 'Chats' ? "Notes" : "Chats"}</h5>
            <div>
                <img onClick={()=>setGo('CallLogs')} className='rightIcon callLogIcon' title='Call logs' style={{cursor:'pointer'}} src={callLog} alt="" />
                {hasToRead && <span className='callLogIndicator'/>}
            </div>
        </div>
    )
}

export default ChatTabs