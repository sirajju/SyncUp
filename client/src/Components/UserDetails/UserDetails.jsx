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
                <h2 className="profileUsername">{reciever.username} {reciever.isPremium && <span className="badge badge-success rounded-pill d-inline premiumBadge align-top">Premium</span>}  </h2>
                <div className="userStatus">
                    <div>
                        <h5>Notes</h5>
                        <span>65</span>
                    </div>
                    <div>
                        <h5>Likes</h5>
                        <span>32</span>
                    </div>
                    <div>
                        <h5>Chat points</h5>
                        <span>{reciever.chatpoints}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserDetails