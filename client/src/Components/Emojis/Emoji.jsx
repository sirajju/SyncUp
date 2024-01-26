import React, { useEffect, useRef } from 'react'
import EmojiPicker from 'emoji-picker-react';
import './Emoji.css'
import { useSelector } from 'react-redux';

function Emoji({ setMessage, setOpenEmoji }) {
  const userData = useSelector(state=>state.user)
  const emojiContainerRef = useRef(null)
  useEffect(() => {
      document.querySelector('.emojiContainer').addEventListener('click', (e) => {
        if(emojiContainerRef.current == e.target){
          setOpenEmoji(false)
        }
      })
  }, [])
  function a(e) {

    setMessage((msg)=>msg+e.emoji)
  }
  return (
    <div ref={emojiContainerRef} className="emojiContainer" >
      <EmojiPicker lazyLoadEmojis={true} emojiStyle='native' onEmojiClick={a} />
    </div>
  )
}

export default Emoji