import React, { useRef, useState,useEffect } from 'react';
import ChatBox from '../Chats/ChatBox/ChatBox';
import { useDispatch, useSelector } from 'react-redux';
import './Profile.css';
import Modal from '../Modal/Modal';
import { useNavigate } from 'react-router-dom';
import pencil from '../../assets/Images/pencil.png';
import tickSave from '../../assets/Images/tick_save.png';
import axios from 'axios';
import toast from 'react-hot-toast';
import { setUserData } from '../../Context/userContext';
import Axios from '../../interceptors/axios';
import { Switch } from 'antd'
import PremiumDailogue from '../Premium/PremiumDailogue'

function Profile({ setGo,chat }) {
    const userData = useSelector((state) => state.user);
    const [editable, setEditable] = useState({ usernameEditable: false, afkEditable: false });
    const dispatch = useDispatch();
    const [username, setUsername] = useState(userData.value.username);
    const [afkMessage, setAfkMessage] = useState(userData.value.afk.message)
    const [isUsernameValid, setIsUsernameValid] = useState(true);
    const [isPremiumModalOpen,openPremiumModal]=useState(false)
    const navigate = useNavigate()
    const toggleAfk = function () {
        const options = {
            route: "toggleAfk",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
            method: "PATCH"
        }
        Axios(options).then(res => {
            if (res.data.success) {
                dispatch(setUserData({ ...userData.value, afk: { ...userData.value.afk, isOn: !userData.value.afk.isOn } }))
            } else {
                toast.error(res.data.message)
            }
        })
    }
    const saveUsername = () => {
        if (isUsernameValid) {
            const token = localStorage.getItem('SyncUp_Auth_Token');
            const options = {
                route: "changeUsername",
                payload: { username },
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            }
            Axios(options).then(res => {
                if (res.data.success) {
                    dispatch(setUserData({ ...userData.value, username }))
                    toast.success(res.data.message);
                } else {
                    toast.error(res.data.message);
                }
                setEditable({ ...editable, usernameEditable: false })
            })
        } else {
            toast.error('Please choose a different one.');
        }
    };
    const checkUsername = async (e) => {
        const newUsername = e.target.value;
        setUsername(newUsername);
        try {
            const options = {
                route: "checkUsername",
                params: { username: newUsername }
            }
            Axios(options).then(res => {
                if (!res.data.success && e.target.value != userData.value.username) {
                    setIsUsernameValid(false);
                } else {
                    setIsUsernameValid(true);
                }
            })

        } catch (error) {
            console.error('Error checking username:', error);
            setIsUsernameValid(false);
        }
    };
    
    const changeAfkMessage = function (e) {
        if (e.target.value.trim()) {
            setAfkMessage(e.target.value)
        }
    }
    const submitAfkMessage = function () {
        setEditable({ ...editable, afkEditable: !editable.afkEditable })
        const options = {
            route: "changeAfkMessage",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
            payload: { message: afkMessage },
            method: "PUT"
        }
        Axios(options).then(res => {
            if (res.data.success) {
                dispatch(setUserData({ ...userData.value, afk: { ...userData.value.afk, message: afkMessage } }))
                toast.success(res.data.message)
            } else {
                toast.error(res.data.message)
            }

        })
    }
    return (
        <>
            <button
                type="button"
                className="close closeProfile"
                onClick={() => {
                    setGo(false);
                }}
                aria-label="Close"
            >
                <span aria-hidden="true">&times;</span>
            </button>
            <div className="profileContainer">
                <img
                    src={userData.value.avatar_url}
                    alt="dp"
                    data-toggle="modal"
                    data-target="#profileAvatarModal"
                    className="profileAvatar"
                />
                <Modal />
            </div>
            <PremiumDailogue setIsModalOpen={openPremiumModal} isModalOpen={isPremiumModalOpen} />
            <div className="profileConfig">
                <div class="input-group mb-3">
                    <input
                        type="text"
                        value={username}
                        onInput={checkUsername}
                        onKeyUp={(e) => e.key == 'Enter' && saveUsername(e)}
                        class={`form-control profileUsernameInput ${!isUsernameValid ? 'invalid' : ''}`}
                        disabled={editable.usernameEditable ? false : true}
                        placeholder="Username"
                        aria-label="Username"
                        aria-describedby="basic-addon1"
                    />
                    <div class="input-group-append" style={{ cursor: 'pointer' }}>
                        <span
                            class="input-group-text"
                            onClick={editable.usernameEditable ? saveUsername : () => setEditable({ ...editable, usernameEditable: !editable.usernameEditable })}
                            id="basic-addon1"
                        >
                            <img style={{ width: '20px' }} src={editable.usernameEditable ? tickSave : pencil} />{' '}
                        </span>
                    </div>
                </div>
                <div onClick={userData.value.isPremium ? () => toast('Currently we only have this type    ') : () => openPremiumModal(true)} className={`profilePremiumBadge ${!userData.value.isPremium && 'cursor-pointer'}`}>
                    <span>Select your premium badge : </span>
                    <span class="badge badge-success rounded-pill d-inline premiumBadge" style={{ cursor: 'pointer' }} >Premium</span>
                </div>
                <div className='afkDiv' onClick={()=>!userData.value.isPremium && openPremiumModal(true)} >
                    <span>Turn on or off away from keyboard : </span>
                    <Switch
                        checkedChildren={'ON'}
                        unCheckedChildren={'OFF'}
                        defaultChecked={userData.value.afk.isOn}
                        onClick={toggleAfk}
                        className='premiumToggle'
                        disabled={!userData.value.isPremium}
                    />

                </div>
                <p style={{fontSize:"10px",color:"red"}} >Note : Afk will automatically turn off if an activity detects</p>
                <div class="input-group mb-3" hidden={!userData.value.afk.isOn} >
                    <input
                        type="text"
                        value={afkMessage}
                        onInput={changeAfkMessage}
                        onKeyUp={(e) => e.key == 'Enter' && submitAfkMessage(e)}
                        class={`form-control profileUsernameInput ${!isUsernameValid ? 'invalid' : ''}`}
                        disabled={editable.afkEditable ? false : true}
                        placeholder="Username"
                        aria-label="Username"
                        aria-describedby="basic-addon1"
                    />
                    <div class="input-group-append" style={{ cursor: 'pointer' }} >
                        <span
                            class="input-group-text"
                            onClick={editable.afkEditable ? submitAfkMessage : () => setEditable({ ...editable, afkEditable: !editable.afkEditable })}
                            id="basic-addon1"
                        >
                            <img style={{ width: '20px' }} src={editable.afkEditable ? tickSave : pencil} />{' '}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile;
