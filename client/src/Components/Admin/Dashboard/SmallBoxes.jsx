import React from 'react'

function SmallBoxes({count,text,icon}) {
    return (
        <div className="dbItem">
            <img src={icon} alt="" />
            <div>
                <h4>{count}</h4>
                <span>{text}</span>
            </div>
        </div>
    )
}

export default SmallBoxes