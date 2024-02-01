import React, { useEffect, useState } from 'react'
import './UserDetails.css'
import { useSelector } from 'react-redux'

function UserDetails({chat,reciever}) {
    // const userData = useSelector(state=>state.conversations)
    const [userData,setUserData] = useState([])
    useEffect(()=>{
        if(reciever){
            setUserData(reciever)
        }
    },[])
    return (
        <div className="userProfileParent">
            <div className="userProfileChild">
                <img className='avatrProfile' src={reciever.avatar_url} alt="" />
            </div>
        </div>
    )
}

export default UserDetails