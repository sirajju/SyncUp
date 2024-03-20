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
import { Dropdown } from 'antd'
import { MDBIcon } from 'mdb-react-ui-kit'
import deleteIcon from '../../../assets/Images/delete.png'

function Notification({ setGo, setChat, setActiveTab }) {
    const userData = useSelector(state => state.user)
    const [notifications, setNotifications] = useState(userData.value.notifications)
    const [confirm, setConfirm] = useState(false)
    const [tempId, setTempId] = useState(null)
    const [isLoading, setLoading] = useState(false)
    const history = useNavigate()
    useEffect(() => {
        let token = localStorage.getItem('SyncUp_Auth_Token')
        const options = {
            route: "getNotifications",
            headers: { Authorization: `Bearer ${token}` },
            crypto: true
        }
        Axios(options).then(res => {
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
            setLoading(false)
        })

    }, [userData])
    const acceptRequest = (userId) => {
        const options = {
            method: "PATCH",
            route: "acceptReq",
            payload: { userId },
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` }
        }
        Axios(options).then(res => {
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
            params: { userId }
        }
        Axios(options).then(res => {
            if (res.data.success) {
                setConfirm(false)
                setChat({ type: null })
            }
        })
    }
    const itemFunction = {
        clearNoti:()=>setNotifications([])
    };
    const menuItems = [
        {
            label: 'Clear Notifications',
            key: 'clearNoti',
            icon: <img className='menuIcon' src={deleteIcon} alt='Clear notes' />,
            disabled: !notifications.length
        }
    ]
    return (
        <>
            <div className="notificationOptions">
                <button className="closeBtn" onClick={() => { setGo(false) }}> <span>&times;</span> </button>
                <Dropdown
                    arrow
                    menu={{
                        items: menuItems,
                        onClick: ({ key }) => itemFunction[key]?.call(),
                    }}
                    trigger={['click']}
                >
                    <MDBIcon fas icon="bars" style={{cursor:'pointer'}} />
                </Dropdown>
            </div>
            {isLoading && <div className='subLoader'> <span className="subLoaderSpinner" ></span> </div>}
            <Confirmation posFunc={removeFromContact} value={confirm} func={setConfirm} title='Uhmm!!' content='If you change your mind then you have to request again.Do you want to decline ?' />
            {Boolean(notifications.length && !isLoading) && notifications.map((el, ind) => {
                return (
                    <>
                        {el.type == "premium" && <div key={ind} className="notificationItem premiumNoti">
                            <span className='text-center p-3' style={{ width: '100%' }}>{el.message}</span>
                            <div className="followRqstDiv" style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '10px', fontWeight: 400, margin: '60px 50px 0 0 ', position: 'absolute', textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{new Date(parseInt(el.time)).getDate() == new Date().getDate() ? (new Date(parseInt(el.time)).toLocaleTimeString('en-US', { hour: '2-digit', minute: "2-digit", hour12: true })) : new Date(parseInt(el.time)).getDate() == new Date().getDate() - 1 ? "Yesterday" : (el.sentDateString ? el.sentDateString : new Date(parseInt(el.time)).toLocaleDateString())}</span>
                            </div>
                        </div>}
                        {el.type == "request" && <div key={ind} className="notificationItem">
                            <img src={el.avatar_url} style={{ width: "60px" }} className='chatIcon' />
                            <span className='text-center p-3' style={{ width: '100%' }}>{el.type == 'request' && !userData.value.contacts.filter(cn => cn.id == el.userId && cn.isAccepted).length ? `Friend request recieved from ${el.username}` : `You accepted friend request from ${el.username}`}</span>
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

                                <span style={{ fontSize: '10px', fontWeight: 400, margin: '60px 0px 0 0 ', position: 'absolute' }}>{new Date(parseInt(el.time)).getDate() == new Date().getDate() ? (new Date(parseInt(el.time)).toLocaleTimeString('en-US', { hour: '2-digit', minute: "2-digit", hour12: true })) : new Date(parseInt(el.time)).getDate() == new Date().getDate() - 1 ? "Yesterday" : (el.sentDateString ? el.sentDateString : new Date(parseInt(el.time)).toLocaleDateString())}</span>
                            </div>
                        </div>}
                        {el.type == 'acceptRQ' && <div key={ind} className="notificationItem">
                            <img src={el.avatar_url} style={{ width: "60px" }} className='chatIcon' />
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

                                <span style={{ fontSize: '10px', fontWeight: 400, margin: '60px 0px 0 0 ', position: 'absolute' }}>{new Date(parseInt(el.time)).getDate() == new Date().getDate() ? (new Date(parseInt(el.time)).toLocaleTimeString('en-US', { hour: '2-digit', minute: "2-digit", hour12: true })) : new Date(parseInt(el.time)).getDate() == new Date().getDate() - 1 ? "Yesterday" : (el.sentDateString ? el.sentDateString : new Date(parseInt(el.time)).toLocaleDateString())}</span>
                            </div>
                        </div>}
                        {el.type == 'like' && <div key={ind} className="notificationItem">
                            <img src={el.avatar_url} style={{ width: "60px" }} className='chatIcon' />
                            <span className='text-center p-3' style={{ width: '100%' }}>{`${el.username} liked your note`}</span>
                            <div className="followRqstDiv"  >
                                <button onClick={() => { setGo(''); setActiveTab('My Notes') }} className="btnAccept mb-1 text-light">
                                    <img style={{ 'width': '20px' }} src={viewIcon} alt="" />
                                </button>
                                <span style={{ fontSize: '10px', fontWeight: 400, margin: '60px 20px 0 0 ', position: 'absolute', textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{new Date(el.time).toLocaleTimeString('en-GB', { minute: '2-digit', hour: '2-digit', hour12: true })}</span>
                            </div>
                        </div>}
                    </>
                )
            })}
            {!notifications.length && <center>No notifications</center>}
        </>
    )
}


export default Notification