import React, { useEffect, useRef, useState, useMemo } from 'react'
import './VideoCall.css'
import imgDecline from '../../assets/Images/decline.png'
import { useDispatch, useSelector } from 'react-redux'
import { UserAgent } from '@apirtc/apirtc';
import { useSocket } from '../../Context/socketContext';
import Axios from '../../interceptors/axios';
import axios from 'axios';
import toast from 'react-hot-toast';
import { setChat } from '../../Context/userContext';

function VideoCall({ hangUpCall, declineCall }) {
  const socket = useSocket()
  const userData = useSelector(state => state.user)
  const chat = useSelector(state => state.chat)
  const conversationRef = useRef(null);
  const dispatch = useDispatch()
  const [conversationName, setConversationName] = useState("")
  const [isConnected, setConnected] = useState(false)
  const [isLoaded, setLoaded] = useState(false)
  const callState = useSelector(state => state.call)
  const onStreamListChangedHandler = function (streamInfo) {
    if (streamInfo.listEventType === 'added' && streamInfo.isRemote) {

      if (conversationRef.current)
        conversationRef.current.subscribeToStream(streamInfo.streamId)
          .then((stream) => {
            console.log('subscribeToStream success', stream);
          }).catch((err) => {
            console.error('subscribeToStream error', err);
          });
    }
  }
  //streamAdded : Add the participant's display to the UI
  const onStreamAddedHandler = function (stream) {
    if (stream.isRemote) {
      stream.addInDiv('opVideo', 'remote-media-' + stream.streamId, {}, false);
    }
  }
  //streamRemoved: Remove the participant's display from the UI
  const onStreamRemovedHandler = function (stream) {
    console.log(stream);
    stream.removeFromDiv('opVideo', 'remote-media-' + stream.streamId)
  }
  useEffect(() => {
    socket.on('callAccepted', () => {
      alert('accepted')
      setConnected(true)
      initializeVideo()
    })
    socket.on('callEnded', (data) => {
      // const videos = document.querySelectorAll('video')
      // videos.forEach(video => {
      //     const stream = video.srcObject
      //     stream.getVideoTracks().forEach(track => track.stop());
      //     stream.getAudioTracks().forEach(track => track.stop());
      //     video.srcObject = null
      // })
    })
    socket.on('callDeclined', (data) => {
      // const videos = document.querySelectorAll('video')
      // videos.forEach(video => {
      //     const stream = video.srcObject
      //     stream.getVideoTracks().forEach(track => track.stop());
      //     stream.getAudioTracks().forEach(track => track.stop());
      //     video.srcObject = null
      // })
    })
  }, [socket])
  const initializeVideo = () => {

    let localStream = null;
    const apikey = "58fe00be7be7c9805c1c0b98b195669a"
    const ua = new UserAgent({
      uri: 'apiKey:' + apikey
    })
    //Connect the UserAgent and get a session
    ua.register().then((session) => {

      const conversationName = chat.data.conversationName

      const conversation = session.getOrCreateConversation(conversationName, { meshOnlyEnabled: true })

      setConversationName(conversation.getName())

      conversationRef.current = conversation

      conversation.on("streamListChanged", onStreamListChangedHandler)
      conversation.on("streamAdded", onStreamAddedHandler)
      conversation.on("streamRemoved", onStreamRemovedHandler)

      //Instantiate a local video stream object
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
                  console.log('local published')
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
    });
  }
  const acceptCall = function () {
    socket.emit('userAcceptedACall', chat.data)
    setConnected(true)
    setLoaded(true)
    initializeVideo()

  }
  return (
    <>
      {callState.value && <div className="videoContainer">
        {isLoaded ? <>
          <div className="callOptions">
            {chat.isRecieved && !callState.value.isAccepted ?
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
            <div className="selfVideo" id='selfVideo'>
              <video id="local-video-stream" className='selfStream' autoPlay muted></video>
            </div>
            <div className="opVideo" id='opVideo'>
              <video id="op-video-stream" className='selfStream' autoPlay muted></video>

            </div>
          </div></> : <div className="vidLoading">
          <span className="spinner" />
          <p className='text-light' >Connecting...</p>
          <button className='btnHangup' onClick={hangUpCall}> <img src={imgDecline} alt="" /></button>

        </div>}
      </div>
      }
    </>
  )
};


export default VideoCall