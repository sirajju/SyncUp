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


function VideoCallUi({ setChat, chat, reciever }) {
  const socket = useSocket()
  const [userData, setUserData] = useState({})
  const [isAccepted, setAccepted] = useState(false)
  const me = useSelector(state => state.user)
  const [totalCount, setCount] = useState(0)
  const conversationRef = useRef(null);
  const [isLoading, setLoading] = useState(false)
  const [isModalOpen, setModalOpen] = useState(false)
  const localStream = useRef(null)

  const getUserData = async function () {
    if (chat.data.participants.length) {
      const options = {
        route: 'getUserInfo',
        params: { arrayOfIds: chat.data.participants },
        headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
        crypto: true
      }
      const res = await Axios(options)
      if (res.data.success) {
        setUserData(res.data.body)
        return res.data.body
      } else {
        toast.error(res.data.message)
      }
    }
  }

  useEffect(() => {
    getUserData()
  }, [])


  const addStreamInVideo = useCallback(async function (stream, isSelf) {
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
      const avatar = await !userData.length ? getUserData().then(res => res.filter(el => el._id != me.value._id)[0].avatar_url) : userData.filter(el => el._id != me.value._id)[0].avatar_url
      userImg.src = avatar
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
    setLoading(false)
  }, [totalCount])

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
    setCount(prev => prev + 1)
    if (stream.isRemote) {
      addStreamInVideo(stream)
    }

  }
  //streamRemoved: Remove the participant's display from the UI
  const onStreamRemovedHandler = function (stream) {
    if (totalCount == 0) {
      toast("Call ended")
      if (localStream.current) {
        localStream.current.data.getTracks().forEach(el => {
          return el.stop()
        })
      }
      setChat({ type: null })
    }
    setCount(prev => prev - 1)
    // removeStream(stream)
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
      if (!localStream.current) {
        navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true
        })
          .then(async (stream) => {
            let strm = await ua.createStreamFromMediaStream(stream)
            localStream.current = strm
            addStreamInVideo(strm, true)
            strm.attachToElement(document.getElementById('local-video-stream'));
            console.log(conversation);
            conversation.join()
              .then((response) => {
                conversation
                  .publish(strm)
                  .then(() => {
                    toast.success('User joined')
                  })
                  .catch((err) => {
                    toast.error("publish error");
                  });
              }).catch((err) => {
                toast.error('Conversation join error' + err.message);
              });
          }).catch((err) => {
            toast.error(`${err.message} ${localStream.current?.streamId}`);
          });
      }
    });
  }

  useEffect(() => {

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
      setLoading(true)
      setAccepted(true)
      setChat({ ...chat, isAccepted: true })
      initializeVideo()

    }
    socket.on('userJoinedToCall', (data) => {
      toast('someone joined')
    })
    socket.on('callEnded', handleCallEnd)
    socket.on('callDeclined', handleCallEnd)
    socket.on('callAccepted', handleCallAccepted)
    return () => {
      socket.off('callEnded', handleCallEnd)
      socket.off('callAccepted'.handleCallAccepted)
    }
  }, [socket])

  const acceptCall = function () {
    setAccepted(true)
    setLoading(true)
    socket.emit('userAcceptedACall', chat.data)
    setChat({ ...chat, isAccepted: true })
    initializeVideo()
  }

  const hangUpCall = function () {
    if (localStream.current) {
      localStream.current.data.getTracks().forEach(el => {
        return el.stop()
      })
    }
    if (conversationRef.current) {
      conversationRef.current.cancelJoin()
      conversationRef.current.leave()
    }
    socket.emit('onHangup', chat.data)
    setChat({ type: null })
  }
  const declineCall = () => {
    if (localStream.current) {
      localStream.current.data.getTracks().forEach(el => {
        return el.stop()
      })
    }
    if (conversationRef.current) {
      conversationRef.current.cancelJoin()
      conversationRef.current.leave()
    }
    socket.emit('onDeclined', chat.data)
    setChat({ type: null })
  }

  const addMember = (id) => {
    socket.emit('onCall', { ...chat.data, to: id })
    setChat({ ...chat, data: { ...chat.data, participants: { ...chat.data?.participants, id } } })
  }
  return (
    <div className="videoCallUIParent">
      <ContactLIst contactsModal={isModalOpen} openContactsModal={setModalOpen} subTitle={"Add user to the meeting"} modalTitle={'New member'} icon={videoCallIcon} onClick={addMember} />
      {!isAccepted && <div className="videoCallUserDetails center">
        <div className='d-flex'>
          {userData.length && userData.map(el => {
            return <div>
              <img src={el.avatar_url} className='vidCallAvatar m-3' alt="" />
              <h4>{el.username}</h4>
            </div>
          })}
        </div>
      </div>}
      <div id='videoCallStreams' className="videoCallStreams center">

        {
          (isLoading || (!isAccepted&&chat?.data?.from == me.value?._id)) &&
          <div className="videoCallLoader center flex-column">
            <span className="videoCallLoaderSpinner" />
            <p>Waiting...</p>
          </div>
        }
        {
          (chat.isRecieved && !isAccepted) &&
          <p style={{ fontSize: "20px", color: "white" }} >Incoming video call from <b>sirajju</b>...</p>

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