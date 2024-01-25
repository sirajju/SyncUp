import React, { useEffect, useState } from 'react'
import './Chatlist.css'
import dp from '../../../assets/Images/man.png'
import { useDispatch, useSelector } from 'react-redux'
import Ads from '../AdsInterface/Ads'

import toast from 'react-hot-toast'
import Axios from '../../../interceptors/axios'
import CurrentList from './currentList'
import Contactslist from './ContactsList'
import ChatingInterface from './ChatingInterface'
import { setConversations } from '../../../Context/userContext'
import GetChatList from '../../../main/Chats/getChatList'
import EmptyChat from './EmptyChat'
import SearchResult from './SearchResult'


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
        Axios(options).then(res => {
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
        Axios(options).then(res => {
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
                <EmptyChat openContactsModal={openContactsModal} />
            }
            {Boolean(searchResult.length) &&
                <SearchResult addToContact={addToContact} copyLink={copyLink} cancellRequest={cancellRequest} setChat={setChat} searchResult={searchResult} checkCondact={checkCondact}/>
            }
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