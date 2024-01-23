import React, { useEffect, useState } from 'react'
import './Chatlist.css'
import dp from '../../../assets/Images/man.png'
import { useDispatch, useSelector } from 'react-redux'
import Ads from '../AdsInterface/Ads'
import follow from '../../../assets/Images/follow.png'
import message from '../../../assets/Images/message.png'
import pending from '../../../assets/Images/pending.png'
import empty from '../../../assets/Images/empty_chat.png'
import toast from 'react-hot-toast'
import Axios from '../../../interceptors/axios'
import CurrentList from './currentList'
import Contactslist from './ContactsList'
import ChatingInterface from './ChatingInterface'
import { setConversations } from '../../../Context/userContext'
import GetChatList from '../../../main/Chats/getChatList'


const Chatlist = React.memo(function Chatlist({ searchResult, setChat }) {
    const conversation = useSelector(state => state.conversations)
    const userData = useSelector(state => state.user)
    const [status, setStatus] = useState({})
    const [contactsModal, openContactsModal] = useState(false)
    const dispatch = useDispatch()
    useEffect(() => {
        if (!searchResult) {
            async function a() {
                const mes = await GetChatList()
                dispatch(setConversations(mes))
            }
            a()
        }
    }, [])
    const addToContact = (userId) => {
        const token = localStorage.getItem(`SyncUp_Auth_Token`)
        const options = {
            route: 'addToContact',
            payload: { userId },
            headers: { Authorization: `Bearer ${token}` },
            method: "POST"
        }
        Axios(options).then(res=>{
            if (res.data.success) {
                toast.success(res.data.message)
            } else {
                toast.error(res.data.message)
            }
        })

    }
    const checkCondact = (id) => {
        const contact = userData.value.contacts.find(el => el.id === id);
        if (contact) {
            if (contact.isAccepted) {
                return "Accepted";
            } else {
                return 'Pending';
            }
        } else if (userData.value._id == id) {
            return 'Accepted'
        } else if (id.toString().length < 5) {
            return 404
        }
        return 0;
    };
    const cancellRequest = (userId) => {
        const token = localStorage.getItem(`SyncUp_Auth_Token`)
        const options = {
            method: "DELETE",
            route: "cancellRequest",
            params: { userId },
            headers: { Authorization: `Bearer ${token}` }
        }
        Axios(options).then(res=>{
            if (res.data.success) {
                toast.success(res.data.message)
            } else {
                toast.error(res.data.message)
            }
        })
    }
    const copyLink = async (name) => {
        if (navigator.share) {
            navigator.share({
                title: 'SyncUp',
                text: 'Share your refferal link by',
                url: `http://${window.location.hostname}:3000/register?refferal=${btoa(userData.value.email)}`
            })
        }
        await navigator.clipboard.writeText(`Hi ${name} ,User ${userData.value.username} want to connect with you on SyncUp \n\nClick below link to join \nhttp://localhost:3000/register?refferal=${btoa(userData.value.email)}`).then(() => {
            toast.success('Link copied to clipboard')
        }).catch(err => {
            toast.error(err.message)
        })
    }
    return (
        <div className="chatlistContainer" data-aos="fade-up" data-aos-duration="700" >
            {contactsModal && <Contactslist contactsModal={contactsModal} openContactsModal={openContactsModal} />}
            {Boolean(conversation.value.length) && <CurrentList setChat={setChat} />}
            {(!conversation.value.length && !searchResult.length && !searchResult.notfound) &&
                <div className="welcomeContainer">
                    <img style={{ width: '70px', margin: '20px' }} src={empty} alt="" />
                    <h2>Look like your chats is empty </h2>
                    <button onClick={() => openContactsModal(true)}>
                        Start chat
                    </button>
                </div>
            }
            {Boolean(searchResult.length) && searchResult.map(el => {
                return (
                    <div className="chatlistItem">

                        <img src={el.avatar_url} className='chatIcon' alt="" />
                        <div className="chatDetails">
                            <div className="userContent">
                                <h5 className='userName' style={{ textTransform: 'capitalize' }}>
                                    {userData.value._id == el._id ? `${el.username} (You)` : el.username} {el?.isPremium && <sup title='Premium member' className="badge rounded-pill d-inline premiumBadge">Premium</sup>}
                                </h5>
                                <p className="lastMessage">
                                    {(() => {
                                        const rs = checkCondact(el._id);
                                        if (rs == 'Pending') {
                                            return "Request is not accepted yet"
                                        } else if (rs == 'Accepted') {
                                            if (el._id == userData.value._id) {
                                                return "Message yourself"
                                            }
                                            return "Message to your contacts"
                                        } else if (rs == 404) {
                                            return "Not found , Invite to get chat points"
                                        }
                                        else {
                                            return "Send friend request to message"
                                        }
                                    })()}
                                </p>
                            </div>
                            <div className="followRqstDiv">
                                {(() => {
                                    const rs = checkCondact(el._id);
                                    if (rs == 'Pending') {
                                        return (
                                            <button onClick={() => cancellRequest(el._id)} className="sendFrndRqst">
                                                <img style={{ 'width': '20px' }} src={pending} alt="" />
                                            </button>
                                        );
                                    } else if (rs == 'Accepted') {
                                        return (
                                            <button onClick={() => setChat({ type: 'chat', data: el._id })} className="sendFrndRqst">
                                                <img style={{ 'width': '20px' }} src={message} alt="" />
                                            </button>
                                        );
                                    }
                                    else if (rs == 404) {
                                        return <button className='btnStart' onClick={() => copyLink(el.username)} style={{ width: '80px', margin: '7px', height: '35px' }} >Invite</button>

                                    }
                                    else {
                                        return (
                                            <button onClick={() => addToContact(el._id)} className="sendFrndRqst">
                                                <img style={{ 'width': '20px' }} src={follow} alt="" />
                                            </button>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    </div>
                );

            })}
            {(searchResult.notfound && !conversation.value.length) &&
                searchResult.data.map(el => {
                    return (
                        <div className="chatlistItem">
                            <img src={el.avatar_url || 'https://res.cloudinary.com/drjubxrbt/image/upload/v1703079644/gz8rffstvw1squbps9ag.png'} className='chatIcon' alt="" />
                            <div className="chatDetails">
                                <div className="userContent">
                                    <h5 className='userName'>{el.username}</h5>
                                    <p className="lastMessage">Not found , Invite to get chat points </p>
                                </div>
                                <div className="messageDetails">
                                    <button className='btnStart' onClick={() => copyLink(el.username)} style={{ width: '80px', margin: '7px', height: '35px' }} >Invite</button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            <div className="chatlistItem smallAds" style={{ 'height': '200px' }}>
                <Ads />
            </div>
        </div>
    )
})
export default Chatlist