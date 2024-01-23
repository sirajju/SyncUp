import React, { useEffect, useRef, useState, useMemo } from 'react'
import './VideoCall.css'
import imgDecline from '../../assets/Images/decline.png'
import { useSelector } from 'react-redux'
import { UserAgent } from '@apirtc/apirtc';
import { useSocket } from '../../Context/socketContext';
import Axios from '../../interceptors/axios';
import axios from 'axios';
import toast from 'react-hot-toast';

function VideoCall({ hangUpCall, chat, declineCall, acceptCall }) {
  const socket = useSocket()
  const userData = useSelector(state => state.user)
  const conversationRef = useRef(null);
  const [conversationName, setConversationName] = useState("")
  const [isLoaded, setLoaded] = useState(true)
  const callState = useSelector(state => state.call)
  useEffect(() => {
    const onStreamListChangedHandler = function (streamInfo) {
      if (streamInfo.listEventType === 'added' && streamInfo.isRemote) {
        if (conversationRef.current)
          conversationRef.current.subscribeToStream(streamInfo.streamId)
            .then((stream) => {
              console.log('subscribeToStream success', streamInfo);
            }).catch((err) => {
              console.error('subscribeToStream error', err);
            });
      }
    }
    const onStreamAddedHandler = function (stream) {
      alert('added')
      if (stream.isRemote) {
        stream.addInDiv('opVideo', 'remote-media-' + stream.streamId, {}, false);
      }
    }
    const onStreamRemovedHandler = function (stream) {
      if (stream.isRemote) {
        stream.removeFromDiv('opVideo', 'remote-media-' + stream.streamId)
      }
    }
    let localStream = null;
    let apikey = "58fe00be7be7c9805c1c0b98b195669a"
    let ua = new UserAgent({
      uri: 'apiKey:' + apikey
    })
    if (chat.isRecieved) {
      ua.register().then(session => {
        const connectedSession = session
        const connectedConversation = connectedSession.getConversation(chat.data.conversationName)
        connectedConversation.on("streamListChanged", onStreamListChangedHandler)
        connectedConversation.on("streamAdded", onStreamAddedHandler)
        connectedConversation.on("streamRemoved", onStreamRemovedHandler)
        createLocalStream(connectedConversation)
      })
    } else {
      ua.register().then((session) => {
        let conversationName = "CONVERSATION_" + userData.value._id
        const conversation = session.getOrCreateConversation(conversationName, { meshOnlyEnabled: true })
        conversation.on("streamListChanged", onStreamListChangedHandler)
        conversation.on("streamAdded", onStreamAddedHandler)
        conversation.on("streamRemoved", onStreamRemovedHandler)
        setConversationName(conversation.getName())
        conversationRef.current = conversation
        createLocalStream(conversation)
      });
    }
  }, [])
  const createLocalStream = (conversation) => {
    let localStream = null;
    let apikey = "58fe00be7be7c9805c1c0b98b195669a"
    let ua = new UserAgent({
      uri: 'apiKey:' + apikey
    })
    ua.createStream({
      constraints: {
        audio: true,
        video: true
      }
    })
      .then((stream) => {
        localStream = stream;
        stream.attachToElement(document.getElementById('local-video-stream'));
        conversation.join()
          .then((response) => {
            conversation
              .publish(localStream)
              .then((stream) => {
                console.log("Your local stream is published in the conversation", stream);
              })
              .catch((err) => {
                console.error("publish error", err);
              });
          }).catch((err) => {
            console.error('Conversation join error', err);
          });
      }).catch((err) => {
        console.error('create stream error', err);
      });
  }
  return (
    <>
      {callState.value && <div className="videoContainer">
        {isLoaded ? <>
          <div className="callOptions">
            {chat.isRecieved ?
              <>
                <button className="Accept" onClick={acceptCall} >Accept</button>
                <button className="Decline" onClick={declineCall} >Decline</button>
              </>
              :
              <>
                <button onClick={hangUpCall}> <img src={imgDecline} alt="" /> </button>
              </>}
          </div>
          <div className="callUi">
            <div className="selfVideo">
              <video id="local-video-stream" className='selfStream' autoPlay muted></video>
            </div>
            <div className="opVideo">

            </div>
          </div></> : <div className="vidLoading">
          <span className="spinner" />
          <p className='text-light' >Connecting...</p>
        </div>}
      </div>
      }
    </>
  )
};


export default VideoCall