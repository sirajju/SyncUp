import React, { useEffect, useState } from 'react'
import './UserDetails.css'
import { useSelector } from 'react-redux'
import Axios from '../../interceptors/axios'

function UserDetails({chat,reciever}) {
    // const userData = useSelector(state=>state.conversations)
    const [userData,setUserData] = useState([])
    useEffect(()=>{
        if(reciever){
            setUserData(reciever)
            const options = {
                route:"getUserInfo",
                headers:{Authorization:`Bearer ${localStorage.getItem('SyncUp_Auth_Token')}`},
                params:{userId:chat.data},
                crypto:true,
            }
            Axios(options).then(res=>{
                setUserData(res.data.body)
            })
        }
    },[])
    return (
        <div className="userProfileParent ">
            <div className="userProfileChild">
                <img className='avatrProfile' src={userData.avatar_url} alt="" />
                <h2 className="profileUsername">{userData.username} {userData.isPremium && <span title='Premium member' className="badge badge-success rounded-pill d-inline premiumBadge align-top">Premium</span>}  </h2>
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
                        <span>{userData.chatpoints}</span>
                    </div>
                </div>
            </div>
            <div className="userProfileChild">
                
            </div>
        </div>
    )
}

export default UserDetails