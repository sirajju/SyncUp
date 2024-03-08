import React, { useEffect, useRef } from 'react'
import EmojiPicker from 'emoji-picker-react';
import './Emoji.css'
import { useSelector } from 'react-redux';

function Emoji({ setMessage, setOpenEmoji }) {
  const userData = useSelector(state => state.user)
  const emojiContainerRef = useRef(null)
  useEffect(() => {
    const listener = (e) => {
      if (emojiContainerRef.current == e.target || e.key=='Escape') {
        setOpenEmoji(false)
      }
    }
    document.querySelector('.emojiContainer')?.addEventListener('click', listener)
    document.addEventListener('keyup', listener)
    return ()=>{
      document.querySelector('.emojiContainer')?.removeEventListener('click',listener)
      document.removeEventListener('keyup',listener)
    }
  }, [])
  function a(e) {

    setMessage((msg) => msg + e.emoji)
  }
  return (
    <div ref={emojiContainerRef} className="emojiContainer" >
      <EmojiPicker autoFocusSearch={false} emojiStyle='google' onEmojiClick={a} />
    </div>
  )
}

export default Emoji