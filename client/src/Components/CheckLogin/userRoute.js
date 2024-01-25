import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cryptojs from 'crypto-js';
import { hideLoading, setUserData, showLoading } from '../../Context/userContext';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast'
import AlreadyOpen from '../AlreadyOpen/AlreadyOpen';
import axios from '../../interceptors/axios';

function IsAuth({ children }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // const [opened, setOpened] = useState(localStorage.getItem('syncup_opened'))
    const userData = useSelector(state => state.user)
    const [auth, setAuth] = useState(false)
    useEffect(() => {
        const token = localStorage.getItem('SyncUp_Auth_Token')
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
            const options = {
                route: 'isAlive',
                headers: { Authorization: `Bearer ${token}` },
                params: { getData: true },
                crypto: true,
            }
            axios(options).then(res=>{
                if (res.data.success) {
                    dispatch(setUserData(res.data.body));
                    setAuth(true)
                }
                else {
                    toast.error(res.data.message)
                    localStorage.removeItem('SyncUp_Auth_Token')
                }
            })
            setTimeout(() => {
                dispatch(hideLoading())
            }, 1500);
        }
    }, []);
    return <>
        {/* {opened && <AlreadyOpen />} */}
        {/* {!opened&&auth && children} */}
        {auth && children}
    </>;
}

export default IsAuth;
