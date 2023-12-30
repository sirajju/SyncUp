import React from 'react'
import Ads from '../AdsInterface/Ads'
import { useSelector } from 'react-redux'
import user from '../../../assets/Images/man.png'
import './ChatingInterface.css'
import vidCall from '../../../assets/Images/videocall.png'
import menu from '../../../assets/Images/menu.png'

function ChatingInterface({ chat }) {
    const userData = useSelector(state => state.user)
    return (
        <>
            {(!chat && userData.value.isPremium) && <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}><h1>Premium user</h1></div>}
            {(!userData.value.isPremium && !chat) && <Ads />}
            {chat &&
                <div className="conversationContainer">
                    <div className="conversationTopBar">
                        <div className="conversationDetails">
                            <img src={user} alt="" className="conversationAvatar" />
                            <div className="conversationUserDetails">
                                <span style={{ fontSize: "20px", fontWeight: "bold" }} >ansiii <sup title='Premium member' className="badge rounded-pill d-inline premiumBadge mx-1">Premium</sup> </span>
                                <span>last seen was yesterday night 11pm</span>
                            </div>
                        </div>
                        <div className="conversationMenu">
                            <img src={vidCall} alt="" />
                            <img src={menu} alt="" />
                        </div>
                    </div>
                    <div className="chatinInterface">

                    </div>
                </div>
            }
        </>
    )
}

export default ChatingInterface