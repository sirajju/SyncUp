import React, { useEffect, useRef, useState, useMemo } from 'react'
import './VideoCall.css'
import imgDecline from '../../assets/Images/decline.png'
import { useSelector } from 'react-redux'
import Peer from 'simple-peer'
import {v4 as randomUUID} from 'uuid'

function VideoCall({ hangUpCall, chat, declineCall, socket }) {
  const userData = useSelector(state=>state.user)
  const myStream = useRef()
  const userStream = useRef()
  const peerRef = useRef()
  const [isLoaded, setLoaded] = useState(false)
  const [roomId, setRoomId] = useState(false)
  const callState = useSelector(state => state.call)
  function initializeMedia() {
    try {
      let video = document.createElement('video')
      video.muted = true
      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        }).then(stream => {
          myStream.current = stream
          video.srcObject = stream
          video.addEventListener('loadedmetadata', () => {
            video.play()
          })
          video.classList.add('selfStream')
          const div = document.querySelector('.selfVideo')
          if (div) {
            div.append(video)
          }
        })
        let opponentVideo = document.createElement('video')
        opponentVideo.muted = true
        navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        }).then(stream => {
          opponentVideo.srcObject = stream
          userStream.current = stream
          opponentVideo.addEventListener('loadedmetadata', () => {
            setLoaded(true)
            opponentVideo.play()
          })
          opponentVideo.classList.add('opponentVideo')
          const div = document.querySelector('.opVideo')
          if (div) {
            div.append(opponentVideo)
          }
        })
      } else {
        alert('videoCall is not supperted yet')
      }
    } catch (error) {
      alert(error.message)
    }
  }
  useEffect(() => {
    initializeMedia()
  }, [isLoaded])
  useEffect(()=>{
    if(myStream){
      startStreaming()
    }
  },[])
  function startStreaming() {
    const peer = new Peer({ initiator: true, trickle: false, myStream })
    peerRef.current = peer

    peer.on('signal', (data) => {
      const roomId = randomUUID()
      socket.emit('join-room',{roomId,data,userId:userData.value._id})
      socket.on('userConnected',(data)=>{
        alert('userConnected')
        setRoomId(data.roomId)
      })
    })
    peer.on('stream',()=>{
      alert('streaming.........')
    })
  }
  const acceptCall = ()=>{
    socket.emit('join-room',{roomId,userId:userData.value._id})
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
            <div className="selfVideo"></div>
            <div className="opVideo"></div>
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