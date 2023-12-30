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

function Profile({ setGo }) {
    const userData = useSelector((state) => state.user);
    const [editable, setEditable] = useState(false);
    const dispatch = useDispatch();
    const [username, setUsername] = useState(userData.value.username);
    const [isUsernameValid, setIsUsernameValid] = useState(true);

    const saveUsername = () => {
        if (isUsernameValid) {
            const token = localStorage.getItem('SyncUp_Auth_Token');
            axios.post(`http://${window.location.hostname}:5000/changeUsername`,{username},{
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
                .then((res) => {
                    if (res.data.success) {
                        toast.success(res.data.message);
                    } else {
                        toast.error(res.data.message);
                    }
                    setEditable(false)
                });
        } else {
            toast.error('Please choose a different one.');
        }
    };

    const checkUsername = async (e) => {
        const newUsername = e.target.value;
        setUsername(newUsername);

        try {
            const res = await axios.get(
                `http://${window.location.hostname}:5000/checkUsername?username=${newUsername}`
            );

            if (!res.data.success&&e.target.value!=userData.value.username) {
                setIsUsernameValid(false);
            } else {
                setIsUsernameValid(true);
            }
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
                    alt=""
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
                        value={editable ? username : userData.value.username}
                        onInput={checkUsername}
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
            </div>
        </>
    );
}

export default Profile;
