import React, { useCallback, useEffect, useRef, useState } from 'react'
import './VideoCall.css'
import Dp from '../../assets/Images/man.png'
import { UserAgent } from '@apirtc/apirtc';
import { useSocket } from '../../Context/socketContext';
import Axios from '../../interceptors/axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import ContactLIst from '../Chats/Chatlist/ContactsList'
import videoCallIcon from '../../assets/Images/videocall.png'
import Webcam from 'react-webcam';
import ReactPlayer from 'react-player'


function VideoCallUi({ setChat, chat, reciever }) {
  const socket = useSocket()
  const [userData, setUserData] = useState({})
  const [isAccepted, setAccepted] = useState(false)
  const me = useSelector(state => state.user)
  const [totalCount, setCount] = useState(0)
  const streamsIds = new Set([])
  const [totalStreams, setTotalStreams] = useState([])
  const conversationRef = useRef(null);
  const [isLoading, setLoading] = useState({ type: null })
  const [isModalOpen, setModalOpen] = useState(false)
  const userAgentRef = useRef(null)
  const localStream = useRef(null)
  const webcamRef = useRef(null);

  useEffect(() => {
    if (chat.type == 'videoCall' && !chat.isRecieved) {
      const id = chat.data.to
      if (id) {
        const options = {
          route: 'getUserInfo',
          params: { userId: id },
          headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
          crypto: true
        }
        Axios(options).then(res => {
          if (res.data.success) {
            setUserData([res.data.body])
          } else {
            toast.error(res.data.message)
          }
        })
      }
    } else {
      console.log(chat);
      setUserData(chat.data?.participantsData.filter(el => el.username != me.value.username) || [])
    }
  }, [chat])


  const addStreamInVideo = useCallback(async function (stream, isSelf) {
    if (!streamsIds.has(stream.streamId)) {
      streamsIds.add(stream.streamId)
      const el = document.querySelector('#videoCallStreams')
      const videEl = document.createElement('video')
      videEl.srcObject = stream.data
      videEl.style.width = !isSelf && 90 / (totalCount) + '%'
      videEl.id = stream.streamId
      videEl.classList.add(isSelf ? "selfStream" : "remoteStream")
      videEl.muted = true
      videEl.play()
      if (!isSelf) {
        const parVidDiv = document.createElement('div')
        const userImg = document.createElement('img')
        // userImg.src = userData[0].avatar_url
        userImg.classList.add('vidCallUserImg')
        parVidDiv.appendChild(userImg)
        parVidDiv.classList.add('vidParent')
        videEl.style.width = '100%'
        parVidDiv.style.width = 100 / (totalCount) + '%'
        parVidDiv.appendChild(videEl)
        el.appendChild(parVidDiv)
      } else {
        el.appendChild(videEl)
      }
      setLoading({ type: null })
    }
  }, [totalCount])

  const removeCamAccess = () => {
    if (localStream.current) {
      if (conversationRef.current && conversationRef.current.isPublishedStream(localStream.current)) {
        toast('UnPublishing ')
        conversationRef.current.unpublish(localStream.current)
        conversationRef.current.cancelJoin()
        conversationRef.current.leave()
      }
      localStream.current.data.getTracks().forEach(el => {
        return el.stop()
      })
    }
  }

  const removeStream = function (stream) {
    const el = document.querySelector('#videoCallStreams')
    el && el?.removeChild(document.getElementById(stream.streamId))
  }

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
      setCount(prev => prev + 1)
      console.log(userData);
      addStreamInVideo(stream)
    }

  }
  //streamRemoved: Remove the participant's display from the UI
  const onStreamRemovedHandler = function (stream) {
    toast("Call ended")
    try {
      if (totalCount <= 1) {
        removeCamAccess()
        if (userAgentRef.current?.isRegistered()) {
          userAgentRef.current.unregister()
        }
        setChat({ type: null })
      }
    } catch (error) {
      toast.error(error.message)
    }
    setCount(prev => prev - 1)
    // removeStream(stream)
  }
  const initializeVideo = async () => {
    const apikey = "23a4e92766509f0902d27275395c1d18"
    const ua = new UserAgent({
      uri: 'apiKey:' + apikey
    })
    // setUa(ua)
    //Connect the UserAgent and get a session
    userAgentRef.current = ua
    ua.setUsername(me.value.username)
    ua.register().then((session) => {

      const conversationName = chat.data.conversationName

      const conversation = session.getOrCreateConversation(conversationName, { meshOnlyEnabled: true })

      // session.setUsername(me.value.username)
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
        .then(async (stream) => {
          localStream.current = stream
          addStreamInVideo(stream, true)
          stream.attachToElement(document.getElementById('local-video-stream'));
          conversation.join()
            .then((response) => {
              conversation
                .publish(stream)
                .then(() => {
                  setLoading({ type: null })
                })
                .catch((err) => {
                  console.log("publish error");
                });
            }).catch((err) => {
              console.log('Conversation join error' + err.message);
            });
        }).catch((err) => {
          console.log(`${err.message} ${localStream.current?.streamId}`);
        });
    });
  }

  useEffect(() => {

    const handleCallEnd = (data) => {
      removeCamAccess()
      setChat({ type: null })
    }
    const handleCallAccepted = () => {
      setLoading({ type: "Connecting" })
      setAccepted(true)
      setChat({ ...chat, isAccepted: true })
      initializeVideo()

    }
    const handleUserJoinedCall = (data) => {
      toast("User joined")
      console.log(data);
    }

    socket.on('callEnded', handleCallEnd)
    socket.on('callDeclined', handleCallEnd)
    socket.on('callAccepted', handleCallAccepted)
    socket.on('userJoinedToCall', handleUserJoinedCall)
    return () => {
      socket.off('callEnded', handleCallEnd)
      socket.off('callAccepted'.handleCallAccepted)
      socket.off('callDeclined'.handleCallEnd)
      socket.off('userJoinedToCall'.handleUserJoinedCall)
    }
  }, [])

  const acceptCall = function () {
    setAccepted(true)
    setLoading({ type: "Connecting" })
    if (userData.length <= 2) {
      const dataToPass = { ...chat, isAccepted: true }
      socket.emit('userAcceptedACall', dataToPass.data)
      setChat(dataToPass)
    } else {
      socket.emit('memberJoined', chat)
    }
    initializeVideo()
  }

  const hangUpCall = function () {
    if (conversationRef.current) {
      if (userAgentRef.current?.isRegistered()) {
        userAgentRef.current.unregister()
      }
    }
    removeCamAccess()
    socket.emit('onHangup', chat.data)
    setChat({ type: null })
  }
  const declineCall = () => {
    if (conversationRef.current) {
      if (userAgentRef.current?.isRegistered()) {
        userAgentRef.current.unregister()
      }
    }
    removeCamAccess()
    socket.emit('onDeclined', chat.data)
    setChat({ type: null })
  }

  const addMember = (id) => {
    socket.emit('requestJoin', { ...chat.data, request: id })
  }
  const videoConstraints = {
    width: 1,  // Set to a very small width
    height: 1, // Set to a very small height
    facingMode: 'user', // Use the user-facing camera
  };
  return (
    <div className="videoCallUIParent">
      {/* <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}

      /> */}
      {isModalOpen && <ContactLIst contactsModal={isModalOpen} openContactsModal={setModalOpen} subTitle={"Add user to the meeting"} modalTitle={'New member'} icon={videoCallIcon} onClick={addMember} />}
      {Boolean(!isAccepted && !isLoading.type) && <div className="videoCallUserDetails center">
        <div className='d-flex'>
          {userData?.length && userData.map(el => {
            return <div>
              <img src={el.avatar_url} className='vidCallAvatar m-3' alt="" />
              <h4>{el.username}</h4>
            </div>
          })}
        </div>
      </div>}
      <div id='videoCallStreams' className="videoCallStreams center">

        {
          (isLoading.type || (!isAccepted && chat?.data?.from == me.value?._id)) &&
          <div className="videoCallLoader center flex-column">
            <span className="videoCallLoaderSpinner" />
            <p>{isLoading.type || "Waiting for join"}...</p>
          </div>
        }
        {
          Boolean(chat.isRecieved && !isAccepted && !isLoading.type) &&
          <p style={{ fontSize: "20px", color: "white" }} >Incoming video call from <b>{userData?.length && userData.map(el => { if (el.username != me.value.username) return el.username }).toString()}</b>...</p>

        }
      </div>
      <div className="videoCallControls center">
        {
          (!chat.isRecieved || isAccepted) && <>
            <button onClick={declineCall} className='syncup-pink-btn' >Hangup</button>
            <button onClick={() => setModalOpen(true)} className='syncup-pink-btn' >Add members</button>
          </>
        }
        {
          (chat.isRecieved && !isAccepted) &&
          <>
            <button className='syncup-pink-btn' onClick={hangUpCall} >Decline</button>
            <button className='syncup-pink-btn' onClick={acceptCall} >Accept</button>
          </>
        }
      </div>
    </div>
  )
}


export default VideoCallUi