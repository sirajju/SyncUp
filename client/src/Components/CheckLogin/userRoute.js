import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import cryptojs from 'crypto-js';
import { hideLoading, setUserData, showLoading } from '../../Context/userContext';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast'
import Otp from '../../main/Otp/Otp';
import AlreadyOpen from '../AlreadyOpen/AlreadyOpen';

function IsAuth({ children }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // const [opened, setOpened] = useState(localStorage.getItem('syncup_opened'))
    const token = localStorage.getItem('SyncUp_Auth_Token');
    const userData = useSelector(state => state.user)
    const [auth,setAuth]=useState(false)
    useEffect(() => {
        dispatch(showLoading())
        if (!token) {
            navigate('/login')
        }
        else {
            // if (!opened) {
            //     localStorage.setItem('syncup_opened', true)
            //     window.addEventListener('beforeunload', () => localStorage.removeItem('syncup_opened'))
            // } else {
            //     setOpened(true)
            // }
            axios.get(`http://${window.location.hostname}:5000/isAlive?getData=true`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    if (res.data.success) {
                        if (res.data.body) {
                            const decrypted = cryptojs.AES.decrypt(res.data.body, 'syncupservercryptokey').toString(cryptojs.enc.Utf8);
                            dispatch(setUserData(JSON.parse(decrypted)));
                            setAuth(true)
                        }
                    }
                    else {
                        toast.error(res.data.message)
                        localStorage.removeItem('SyncUp_Auth_Token')
                        return navigate('/login');
                    }
                })
                .catch(err => {
                    toast.error(err.message)
                    localStorage.removeItem('SyncUp_Auth_Token')
                    return navigate('/login');
                });
            setTimeout(() => {
                dispatch(hideLoading())
            }, 2000);
        }
    }, []);
    return <>
        {/* {opened && <AlreadyOpen />} */}
        {/* {!opened&&auth && children} */}
        {auth && children}
    </>;
}

export default IsAuth;
