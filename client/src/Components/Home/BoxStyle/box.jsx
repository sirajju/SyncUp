import React from 'react'
import './Box.css'

function box(props) {
  return (
    <div className="boxContainer" style={props.style}>
        {props.imgUrl&&<div className="subBox1">
            <img src={props.imgUrl} alt="Image" className="boxImg" />
        </div>}
        <div className="subBox2">{props.children}</div>
    </div>
  )
}

export default box