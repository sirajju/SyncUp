import React, { useEffect, useRef, useState, useMemo } from 'react'
import './VideoCall.css'
import { useSelector } from 'react-redux'

function VideoCall({ hangUpCall, chat,declineCall }) {
  const myStream = useRef()
  const callState = useSelector(state => state.call)
  useEffect(() => {
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
        opponentVideo.addEventListener('loadedmetadata', () => {
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
  }, [])

  return (
    <>
      {callState.value && <div className="videoContainer">
        <div className="callOptions">
          {/* {callState.value.isAccepted&&!callState.value.isRecieved &&
            <>
              <button className="handUp" onClick={hangUpCall}>HangUp</button>
              <button className="Mute">Mute</button>
            </>}
          
          {!callState.value.isRecieved&&!callState.value.isAccepted &&
            <>
              <button className="handUp" onClick={hangUpCall}>Hangup</button>
            </>} */}
          {chat.isRecieved ?
            <>
              <button className="Accept">Accept</button>
              <button className="Decline" onClick={declineCall} >Decline</button>
            </>
            :
            <>
              <button onClick={hangUpCall}>HangUp</button>
            </>}
        </div>
        <div className="callUi">
          <div className="selfVideo"></div>
          <div className="opVideo"></div>
        </div>
      </div>
      }
    </>
  )
};


export default VideoCall