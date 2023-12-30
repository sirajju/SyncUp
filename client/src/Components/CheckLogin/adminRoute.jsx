import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { hideLoading, setAuthConfig, showLoading } from '../../Context/userContext'
import toast from 'react-hot-toast'
import cryptojs from 'crypto-js'
import AdminLogin from '../../Components/Admin/Login/Login'
import { useNavigate } from 'react-router-dom'

function AdminRoute({redirect}) {
    const [auth, setAuth] = useState(false)
    const dispatch = useDispatch()
    const navigate=useNavigate()
    useEffect(() => {
        dispatch(showLoading())
        const token = localStorage.getItem('SyncUp_AdminToken')
        if (token) {
            axios.get(`http://${window.location.hostname}:5000/admin/isAlive`, {
                headers: {

                    Authorization: `Bearer ${token}`
                }
            }).then(res => {
                if (res.data.success) {
                    setAuth(true)
                } else {
                    setAuth(false)
                    toast.error(res.data.message)
                    localStorage.removeItem('SyncUp_AdminToken')
                }
            })
        }else{
            setAuth(false)
        }
        setTimeout(() => {
            dispatch(hideLoading())
        }, 2000);
    }, [])
    return (
        <React.Fragment>
            {
                auth ? redirect : <AdminLogin/>
            }
        </React.Fragment>
    )
}

export default AdminRoute