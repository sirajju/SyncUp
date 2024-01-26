import React from 'react'
import './Page.css'
// Div component with boxShadow
import Box from '../BoxStyle/box'
import switchIcon from '../../../assets/svgIcons/switch.png'
import lightTing from '../../../assets/svgIcons/lightening.png'

function Page(props) {
    const boxStyle = {
        width: "188px",
        height: "231px",
        margin: "30px",
        textAlign:"center"
    }
    return (
        <div className="premiumContainer" id='premium'>
            <div className="child">
                <h1>{props.bigText}</h1>
                <p>{props.smallText}</p>
            </div>
            <div className="child2">
                <Box imgUrl={switchIcon} style={boxStyle}>
                    <h4 style={{fontWeight:"bold",color:"black",fontSize:'20px'}}>Ads will be turned off</h4>
                </Box>
                <Box imgUrl={lightTing} style={{...boxStyle,'textAlign':"start",fontWeight:"bold"}}>
                    <ul>
                        <li>More privacy</li>
                        <li>Customizable</li>
                        <li>More features</li>
                    </ul>
                </Box>
            </div>
        </div>
    )
}

export default Page