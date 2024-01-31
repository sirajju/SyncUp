import React, { useRef, useState } from 'react';
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

function Profile({ setGo }) {
    const userData = useSelector((state) => state.user);
    const [editable, setEditable] = useState(false);
    const dispatch = useDispatch();
    const [username, setUsername] = useState(userData.value.username);
    const [isUsernameValid, setIsUsernameValid] = useState(true);
    const navigate = useNavigate()

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
                setEditable(false)
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
            <div className="profileConfig">
                <div class="input-group mb-3">
                    <input
                        type="text"
                        value={username}
                        onInput={checkUsername}
                        onKeyUp={(e) => e.key == 'Enter' && saveUsername(e)}
                        class={`form-control profileUsernameInput ${!isUsernameValid ? 'invalid' : ''}`}
                        disabled={editable ? false : true}
                        placeholder="Username"
                        aria-label="Username"
                        aria-describedby="basic-addon1"
                    />
                    <div class="input-group-append">
                        <span
                            class="input-group-text cursor-pointer"
                            onClick={editable ? saveUsername : () => setEditable(!editable)}
                            id="basic-addon1"
                        >
                            {' '}
                            <img style={{ width: '20px' }} src={editable ? tickSave : pencil} />{' '}
                        </span>
                    </div>
                </div>
                <div onClick={userData.value.isPremium ? () => toast('Currently we only have this type    ') : () => navigate('/plans')} className={`profilePremiumBadge ${!userData.value.isPremium && 'cursor-pointer'}`}>
                    <span>Select your premium badge : </span>
                    <span class="badge badge-success rounded-pill d-inline premiumBadge cursor-pointer">Premium</span>
                </div>
            </div>
        </>
    );
}

export default Profile;
