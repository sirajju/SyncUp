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
  const conversationRef = useRef(null);
  const [chat, setChat] = useState(props.chat)
  const [isLoaded, setLoaded] = useState(false)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemote] = useState(null)
  const [ua, setUa] = useState(new UserAgent({
    uri: 'apiKey:58fe00be7be7c9805c1c0b98b195669a'
  }))
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
    } else {
      if (conversationRef.current)
        conversationRef.current.unsubscribeToStream(streamInfo.streamId)
          .then((stream) => {
            alert('removed')
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
    stream.removeFromDiv('opVideo', 'remote-media-' + stream.streamId)
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
    socket.on('callEnded', (data) => {
      if (conversationRef.current) {
        conversationRef.current.leave().then(() => {
          conversationRef.current.destroy()
        })
      }
      toast.error('Call ended')
    })
    socket.on('callAccepted', () => {
      props.setChat({ ...chat, isAccepted: true })
      initializeVideo().then(() => {
        setLoaded(true)
      })
    })
    // socket.on('callEnded', (data) => {
    //   const videos = document.querySelectorAll('video')
    //   videos.forEach(video => {
    //       const stream = video.srcObject
    //       stream.getVideoTracks().forEach(track => track.stop());
    //       stream.getAudioTracks().forEach(track => track.stop());
    //       video.srcObject = null
    //   })
    // })
    // socket.on('callDeclined', (data) => {
    //   const videos = document.querySelectorAll('video')
    //   videos.forEach(video => {
    //       const stream = video.srcObject
    //       stream.getVideoTracks().forEach(track => track.stop());
    //       stream.getAudioTracks().forEach(track => track.stop());
    //       video.srcObject = null
    //   })
    // })
  }, [socket])
  const initializeVideo = async () => {
    const apikey = "58fe00be7be7c9805c1c0b98b195669a"
    // const ua = new UserAgent({
    //   uri: 'apiKey:' + apikey
    // })
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
          audio: true,
          video: true
        }
      })
        .then((stream) => {
          let strm = stream
          setLocalStream(stream)
          stream.attachToElement(document.getElementById('local-video-stream'));
          conversation.join()
            .then((response) => {
              conversation
                .publish(strm)
                .then(() => {
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
    setChat({ ...chat, isAccepted: true })
    initializeVideo()
  }
  const hangupCall = function () {
    if (conversationRef.current) {
      conversationRef.current.leave().then(() => {
        conversationRef.current.destroy()
      })
      socket.emit('onHangup', chat.data)

    }
  }
  return (
    <>
      {userData && <div className='userDetailsVidCall'>
        <img src={userData.avatar_url} className='vidCallAvatar' alt="" />
        <h4>{userData.username}</h4>
      </div>}
      {callState.value && <div className="videoContainer">
        {isLoaded ? <>
          {/* <div className="callOptions"> */}
          {chat.isRecieved && !chat.isAccepted ?
            <div className={chat.isAccepted ? "AccpetedOPtions" : "callOptions"}>
              <button className="callBtn Accept" onClick={acceptCall} >
                <img src={imgAccept} alt="" />
              </button>
              <button className="callBtn Decline" onClick={props.declineCall} >
                <img src={imgDecline} alt="" />
              </button>
            </div>
            :
            <div className={chat.isAccepted ? "AccpetedOPtions" : "callOptions"}>
              <button onClick={props.declineCall}> <img src={imgDecline} alt="" /> </button>
            </div>}
          {/* </div> */}
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
      }
    </>
  )
};


export default VideoCall