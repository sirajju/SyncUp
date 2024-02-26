import React, { useEffect } from 'react'
import Box from '../Home/BoxStyle/box'
import { useDispatch } from 'react-redux'
import { hideLoading } from '../../Context/userContext'

function AlreadyOpen() {
    const dispatch = useDispatch()
    const boxStyle = {
        background: 'white',
        width: '40%',
        height: '60vh',
        color:'black'
    }
    useEffect(()=>{
        dispatch(hideLoading())   
    },[])
    return (
        <div className="otpContainer">
            <Box style={boxStyle}>
                <div style={{display:"flex",justifyContent:'center',flexDirection:'column',alignItems:'center',textAlign:'center',padding:'30px',gap:'20px'}}>
                    <h1>Alert!!</h1>
                    <p>A window of syncUp is already open.close the tab and reload to continue here</p>
                    <button onClick={()=>{window.location.reload()}} className='btnLogin' style={{height:'45px'}}>Reload</button>
                </div>
            </Box>
        </div>
    )
}

export default AlreadyOpen