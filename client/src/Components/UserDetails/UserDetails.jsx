import React, { useEffect, useState } from 'react'
import './UserDetails.css'
import { useDispatch, useSelector } from 'react-redux'
import Axios from '../../interceptors/axios'
import ConfirmBox from '../Confirmation/Dailogue'
import toast from 'react-hot-toast'
import {setUserData} from '../../Context/userContext'

function UserDetails({ chat, reciever }) {
    const allConversation = useSelector(state => state.conversations)
    const me = useSelector(state => state.user)
    const [userData, setUser] = useState([])
    const [isConfirmOpened, openConfirmBox] = useState(false)
    const [blockConfirm, openBlockConfirm] = useState(false)
    const [isBlocked, setBlocked] = useState(false)
    const [conversation, setConversation] = useState(null)
    const dispatch = useDispatch()
    const [reason, setReason] = useState('')
    useEffect(() => {
        if (reciever) {
            setUser(reciever)
            const options = {
                route: "getUserInfo",
                headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
                params: { userId: chat.data },
                crypto: true,
            }
            Axios(options).then(res => {
                setUser(res.data.body)
            })
            if (me) {
                const res = me.value.blockedContacts?.filter(el => el.userId == reciever._id)?.length
                console.log(res);
                setBlocked(res)

            }
        }
        const data = allConversation.value.filter(el => el.opponent[0]._id == reciever._id)
        setConversation(data)
    }, [me])
    const reportContact = function () {
        const options = {
            route: 'reportContact',
            payload: { reason, userId: userData._id },
            method: "POST",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` }
        }
        Axios(options).then(res => {
            if (res.data.success) {
                toast.success(res.data.message)
            } else {
                toast.error(res.data.message)
            }
        })
        openConfirmBox(false)
        setReason('')
    }
    const blockContact = function () {
        const options = {
            route: 'blockContact',
            payload: { userId: userData._id, reason },
            method: "POST",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` }
        }
        Axios(options).then(res => {
            if (res.data.success) {
                dispatch(setUserData({...me.value,blockedContacts:[...me.value.blockedContacts,{userId:userData._id,blockedAt:Date.now()}]}))
                toast.success(res.data.message)
            } else {
                toast.error(res.data.message)
            }
        })
        openBlockConfirm(false)
    }
    return (
        <div className="userProfileParent ">
            <div className="userProfileChild">
                <ConfirmBox func={openConfirmBox} posFunc={reportContact} title="Do you..?" content='Ok we will review the report and take appropriate action based on its Community Guidelines.' value={isConfirmOpened}>
                    <input value={reason} className='confirmInput' onChange={(e) => setReason(e.target.value)} type="text" placeholder={'Enter reason behind this...'} />
                </ConfirmBox>
                <ConfirmBox func={openBlockConfirm} posFunc={blockContact} title="Warning ⚠️ " content="If you block this user then you cannot send or reciever message from this user." value={blockConfirm} />
                <img className='avatrProfile' src={userData.avatar_url} alt="" />
                <h2 className="profileUsername">{userData.username} {userData.isPremium && <span title='Premium member' className="badge badge-success rounded-pill d-inline premiumBadge align-top">Premium</span>}  </h2>
                <p>{userData.email} </p>
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
                <button className="profileBtn viewNotes">View notes</button>
                <button className="profileBtn chatLock">Chatlock</button>
            </div>
            {conversation && <div className="userProfileChild">
                <div className="stausContainer">
                    <h1>Status</h1>
                    <div className="statusText text-start">
                        <p><span>Conversation started : </span> {new Date(parseInt(conversation[0].startedAt)).toLocaleDateString('en-GB', { day: '2-digit', 'month': '2-digit', "year": 'numeric' })}</p>
                        <p><span>Chat locked : </span> {conversation[0].isLocked ? "Yes" : "No"}</p>
                    </div>
                    <div className="blkReport">
                        <button className="profileBtn viewNotes" onClick={() => openConfirmBox(true)} >Report</button>
                        {!isBlocked ?
                            <button className="profileBtn chatLock btnBlk" onClick={() => openBlockConfirm(true)} >Block</button> :
                            <button className="profileBtn chatLock btnBlk" onClick={() => openBlockConfirm(true)} >Unblock</button>
                        }
                        <button className="profileBtn chatLock btnBlk">Remove friend</button>
                    </div>
                </div>
            </div>}
        </div>
    )
}

export default UserDetails