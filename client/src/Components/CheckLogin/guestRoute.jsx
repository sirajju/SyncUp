import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Chats from '../../main/Chats/Chats'
import axios from '../../interceptors/axios'
import { useDispatch, useSelector } from 'react-redux'
import { hideLoading, showLoading } from '../../Context/userContext'
import Otp from '../../main/Otp/Otp'

function GuestRoute({ children }) {
    const [auth, setAuth] = useState(true)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    useEffect(() => {
        dispatch(hideLoading())
        const token = localStorage.getItem('SyncUp_Auth_Token')
        if (!token) {
            return setAuth(false)
        } else {
            axios({route: 'isAlive',headers:{Authorization:`Bearer ${token}`}}).then(res=>{
                console.log(res);
                if (res.data.success) {
                    navigate('/chats')
                } else {
                    localStorage.removeItem('SyncUp_Auth_Token')
                    setAuth(false)
                    toast.error(res.data.message)
                }
            })
        }
    }, [])
    return (
        <React.Fragment>
            {!auth && children}
        </React.Fragment>
    )
}

export default GuestRoute