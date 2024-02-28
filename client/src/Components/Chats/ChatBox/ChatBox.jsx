import React from 'react'
import './ChatBox.css'

function ChatBox({ children, rightComponent }) {
    return (
        <>
        {/* <div className="navbarBannedParent"></div> */}
            <div className="chatsContainer">
                <div className="chatsLeft chatsStyle">
                    {children}
                </div>
                <div className="chatsRight chatsStyle">
                    {rightComponent}
                </div>
            </div>
        </>
    )
}

export default ChatBox