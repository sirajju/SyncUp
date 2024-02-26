import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import './Notification.css'
import Axios from '../../../interceptors/axios'
import message from '../../../assets/Images/message.png'
import viewIcon from '../../../assets/Images/view.png'
import close from '../../../assets/Images/close.png'
import toast from 'react-hot-toast'
import Confirmation from '../../Confirmation/Dailogue'
import { useNavigate } from 'react-router-dom'

function Notification({ setGo, setChat,setActiveTab }) {
    const userData = useSelector(state => state.user)
    const [notifications, setNotifications] = useState([])
    const [confirm, setConfirm] = useState(false)
    const [tempId, setTempId] = useState(null)
    const history = useNavigate()
    useEffect(() => {
        let token = localStorage.getItem('SyncUp_Auth_Token')
        const options = {
            route: "getNotifications",
            headers: { Authorization: `Bearer ${token}` },
            crypto: true
        }
        Axios(options).then(res=>{
            if (res.data.success) {
                let temp = []
                res.data.body.forEach(el => {
                    if (el.notifications?.type) {
                        temp.unshift({ ...el, ...el.notifications })
                    } else {
                        temp.unshift(el)
                    }
                })
                setNotifications([...temp])
            }
        })

    }, [userData])
    const acceptRequest = (userId) => {
        const options = {
            method: "PATCH",
            route: "acceptReq",
            payload: { userId },
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` }
        }
        Axios(options).then(res=>{
            if (!res.data.sucess) {
                toast.error(res.data.message)
            }
        })
    }
    const removeFromContact = () => {
        const userId = tempId
        const options = {
            route: "removeContact",
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
            params:{userId}
        }
        Axios(options).then(res=>{
            if (res.data.success) {
                setConfirm(false)
                setChat({ type: null })
            }
        })
    }
    return (
        <>
            <button className="closeBtn" onClick={() => { setGo(false) }}> <span>&times;</span> </button>
            <Confirmation posFunc={removeFromContact} value={confirm} func={setConfirm} title='Uhmm!!' content='If you change your mind then you have to request again.Do you want to decline ?' />
            {notifications && notifications.map((el, ind) => {
                return (
                    <>
                        {el.type == "premium" && <div key={ind} data-aos="fade-down" data-aos-duration="700" className="notificationItem premiumNoti">
                            <span className='text-center p-3' style={{ width: '100%' }}>{el.message}</span>
                            <div className="followRqstDiv" style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '10px', fontWeight: 400, margin: '60px 50px 0 0 ', position: 'absolute' }}>{new Date(el.time).toLocaleTimeString()}</span>
                            </div>
                        </div>}
                        {el.type == "request" && <div key={ind} data-aos="fade-down" data-aos-duration="700" className="notificationItem">
                            <img src={el.avatar_url} style={{width:"60px"}} className='chatIcon' />
                            <span className='text-center p-3' style={{ width: '100%' }}>{el.type == 'request' && !userData.value.contacts.filter(cn => cn.id == el.userId && cn.isAccepted).length ? `Freind request recieved from ${el.username}` : `You accepted friend request from ${el.username}`}</span>
                            <div className="followRqstDiv"  >

                                {(() => {
                                    if (userData.value.contacts.filter(cn => cn.id == el.userId && cn.isAccepted).length) {
                                        return (
                                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                <button onClick={() => setChat({ type: 'chat', data: el.userId })} className="btnAccept mb-1 text-light">
                                                    <img style={{ 'width': '20px' }} src={message} alt="" />
                                                </button>
                                                <button onClick={() => { setConfirm(!confirm); setTempId(el.userId); }} className="btnAccept mb-1 text-light">
                                                    <img style={{ 'width': '20px' }} src={close} alt="" />
                                                </button>
                                            </div>
                                        )
                                    } else {
                                        return (
                                            <button onClick={() => acceptRequest(el.userId)} className="btnAccept mb-1 text-light">
                                                Accept
                                            </button>
                                        )
                                    }
                                })()}

                                <span style={{ fontSize: '10px', fontWeight: 400, margin: '60px 0px 0 0 ', position: 'absolute' }}>{new Date(el.time).toLocaleTimeString()}</span>
                            </div>
                        </div>}
                        {el.type == 'acceptRQ' && <div key={ind} data-aos="fade-down" data-aos-duration="700" className="notificationItem">
                            <img src={el.avatar_url} style={{width:"60px"}} className='chatIcon' />
                            <span className='text-center p-3' style={{ width: '100%' }}>{el.message}</span>
                            <div className="followRqstDiv"  >

                                {(() => {
                                    if (userData.value.contacts.filter(cn => cn.id == el.userId && cn.isAccepted).length) {
                                        return (
                                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                <button onClick={() => setChat({ type: 'chat', data: el.userId })} className="btnAccept mb-1 text-light">
                                                    <img style={{ 'width': '20px' }} src={message} alt="" />
                                                </button>
                                            </div>
                                        )
                                    }
                                })()}

                                <span style={{ fontSize: '10px', fontWeight: 400, margin: '60px 0px 0 0 ', position: 'absolute' }}>{new Date(el.time).toLocaleTimeString()}</span>
                            </div>
                        </div>}
                        {el.type == 'like' && <div key={ind} data-aos="fade-down" data-aos-duration="700" className="notificationItem">
                            <img src={el.avatar_url} style={{width:"60px"}} className='chatIcon' />
                            <span className='text-center p-3' style={{ width: '100%' }}>{`${el.username} liked your note`}</span>
                            <div className="followRqstDiv"  >
                            <button onClick={() => {setGo('');setActiveTab('My Notes')}} className="btnAccept mb-1 text-light">
                                                    <img style={{ 'width': '20px' }} src={viewIcon} alt="" />
                                                </button>
                                <span style={{ fontSize: '10px', fontWeight: 400, margin: '60px 20px 0 0 ', position: 'absolute' }}>{new Date(el.time).toLocaleTimeString('en-GB',{minute:'2-digit',hour:'2-digit',hour12:true})}</span>
                            </div>
                        </div>}
                    </>
                )
            })}
        </>
    )
}


export default Notification