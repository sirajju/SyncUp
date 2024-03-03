import React, { useEffect, useRef, useState, useMemo } from 'react'
import './VideoCall.css'
import imgDecline from '../../assets/Images/decline.png'
import imgAccept from '../../assets/Images/accept.png'
import { useDispatch, useSelector } from 'react-redux'
import { UserAgent } from '@apirtc/apirtc';
import { useSocket } from '../../Context/socketContext';
import Axios from '../../interceptors/axios';
import axios from 'axios';
import toast from 'react-hot-toast';

function VideoCall(props) {
  const socket = useSocket()
  const [userData, setUserData] = useState({})
  const me = useSelector(state => state.user)
  const conversationRef = useRef(null);
  const [chat, setChat] = useState(props.chat)
  const [isLoaded, setLoaded] = useState(false)
  const localStream = useRef(null)
  const [remoteStream, setRemote] = useState(null)
  // const [ua, setUa] = useState(new UserAgent({
  //   uri: 'apiKey:58fe00be7be7c9805c1c0b98b195669a'
  // }))
  const callState = useSelector(state => state.call)

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
  //streamAdded : Add the participant's display to the UI
  const onStreamAddedHandler = function (stream) {
    if (stream.isRemote) {
      setLoaded(true)
      console.log(stream);
      stream.addInDiv('opVideo', 'remoteMediaPlayer', {}, false);
    }
  }
  //streamRemoved: Remove the participant's display from the UI
  const onStreamRemovedHandler = function (stream) {
    stream.removeFromDiv('opVideo', 'remoteMediaPlayer' + stream.streamId)
  }
  const initializeVideo = async () => {
    const apikey = "58fe00be7be7c9805c1c0b98b195669a"
    const ua = new UserAgent({
      uri: 'apiKey:' + apikey
    })
    // setUa(ua)
    //Connect the UserAgent and get a session
    ua.register().then((session) => {

      const conversationName = chat.data.conversationName

      const conversation = session.getOrCreateConversation(conversationName, { meshOnlyEnabled: true })

      conversationRef.current = conversation

      conversation.on("streamListChanged", onStreamListChangedHandler)
      conversation.on("streamAdded", onStreamAddedHandler)
      conversation.on("streamRemoved", onStreamRemovedHandler)
      //Instantiate a local video stream object
      ua.createStream({
        constraints: {
          audio: false,
          video: true
        }
      })
        .then((stream) => {
          let strm = stream
          localStream.current = strm
          stream.attachToElement(document.getElementById('local-video-stream'));
          conversation.join()
            .then((response) => {
              conversation
                .publish(strm)
                .then(() => {
                  console.log('local published')
                })
                .catch((err) => {
                  toast.error("publish error", err);
                });
            }).catch((err) => {
              toast.error('Conversation join error', err);
            });
        }).catch((err) => {
          toast.error('create stream error', err);
        });
    });
  }
  useEffect(() => {
    if (chat.isRecieved) {
      setLoaded(true)
    }
    const id = chat.isRecieved ? chat.data.from : chat.data.to
    if (id) {
      const options = {
        route: 'getUserInfo',
        params: { userId: id },
        headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
        crypto: true
      }
      Axios(options).then(res => {
        if (res.data.success) {
          setUserData(res.data.body)
        } else {
          toast.error(res.data.message)
        }
      })
    }

    const handleCallEnd = (data) => {
      if (localStream.current) {
        localStream.current.data.getTracks().forEach(el => {
          return el.stop()
        })
      }
      setChat({ type: null })
      toast.error('Call ended')
    }
    const handleCallAccepted = () => {
      setChat({ ...chat, isAccepted: true })
      initializeVideo()
      setLoaded(true)

    }
    socket.on('callEnded', handleCallEnd)
    socket.on('callDeclined', handleCallEnd)
    socket.on('callAccepted', handleCallAccepted)
    return () => {
      socket.off('callEnded', handleCallEnd)
      socket.off('callAccepted'.handleCallAccepted)
    }
  }, [socket])

  const acceptCall = function () {
    socket.emit('userAcceptedACall', chat.data)
    setChat({ ...chat, isAccepted: true })
    initializeVideo()
  }

  const hangUpCall = function () {
    if (conversationRef.current) {
      conversationRef.current.leave()
    }
    if (localStream.current) {
      localStream.current.data.getTracks().forEach(el => {
        return el.stop()
      })
    }
    socket.emit('onHangup', chat.data)
    const id = chat.data.from == me.value._id ? chat.data.to : chat.data.from
    setChat({ type: null })
  }

  return (
    <>
      {userData && <div className='userDetailsVidCall'>
        <img src={userData.avatar_url} className='vidCallAvatar' alt="" />
        <h4>{userData.username}</h4>
      </div>}
      {callState.value && <div className="videoContainer">

        <div className="callOptions">
          {Boolean(chat.isRecieved && !chat.isAccepted)?
            <div>
              <button className="callBtn Accept" onClick={acceptCall} >
                <img src={imgAccept} alt="" />
              </button>
              <button className="callBtn Decline" onClick={props.declineCall} >
                <img src={imgDecline} alt="" />
              </button>
            </div>
            :
           isLoaded && <div>
           <button onClick={hangUpCall}> <img src={imgDecline} alt="" /> </button>
         </div> }
          {isLoaded ? <>

            <div className="callUi">
              <div className="selfVideo" id='selfVideo'>
                <video id="local-video-stream" className='selfStream' autoPlay muted></video>
              </div>
              <div className="opVideo" id='opVideo'>
                <video id="op-video-stream" className='opponentVideo' autoPlay muted></video>

              </div>
            </div></> : <div className="vidLoading">
            <span className="spinner" />
            <p className='text-light' >Waiting...</p>
            <button className='btnHangup' onClick={props.declineCall}> <img src={imgDecline} alt="" /></button>

          </div>}
        </div>

      </div>
      }
    </>
  )
};


export default VideoCall