import React, { useEffect } from 'react'
import './Login.css'
import chat from '../../assets/svgIcons/chat.png'

function Login(props) {
  document.body.onselectstart = () => false
  return (
    <div className="center loginContainer">
      <div className="loginBox center">
        <div className="leftBox">
          <h3 className="leftTitle">{props.leftTitle}</h3>
          <p className="leftDescription">{props.leftDescription}</p>
          <img src={chat} className='loginImg' alt="" />
        </div>
        <div className="rightBox center" style={{ paddingTop: '30px' }}>
          <h3 style={{ fontWeight: '400', color: "#010851" }}>{props.rightTitle}</h3>
          {props.children}
        </div>
      </div>
    </div>
  )
}

export default Login