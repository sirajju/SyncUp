import React, { useEffect } from 'react'
import './Banner.css'
import { useNavigate } from 'react-router-dom'

function Banner(props) {
  const navigator = useNavigate()
  return (
    <div id={props.id} className='bannerParent'>
      <div style={props.style || props.isCurved && { borderRadius: "48px 48px 150px 48px" } || {}} className="banner">
        <div className="leftSub">
          <h1 className='bigText'>{props.bigText}</h1>
          <p className='smallText'>{props.smallText}</p>
          <div className="btnDiv">
            {props.children}
            {!props.btnOff && <><button onClick={()=>navigator('/login')}className="btnStart">Get started</button>
              <button className="btnStart lightBtn" style={{ 'background': "transparent" }}>Learn more</button></>}
          </div>
        </div>
        <div className="rightSub">
          <img src={props.imgUrl} alt="" className="bannerImage" />
        </div>
      </div>
    </div>
  )
}

export default Banner