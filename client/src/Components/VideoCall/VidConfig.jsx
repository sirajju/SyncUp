import React, { useRef, useState } from 'react'
import VideoCall from './VideoCall'
import { UserAgent } from '@apirtc/apirtc';
import VideoCallUi from './VideoCallUi';

function VidConfig({ ...props }) {
    const conversationRef = useRef(null);
    const [conversationName, setConversationName] = useState("")
    return (
        <div className="App">
            <header className="App-header">
                {/* <VideoCallUi {...props} /> */}
                <VideoCall {...props} />
            </header>
        </div>
    )
}

export default VidConfig