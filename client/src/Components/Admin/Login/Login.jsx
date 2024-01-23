import React, { useState } from 'react'
import './Login.css'
import axios from '../../../interceptors/axios'
import {useNavigate} from 'react-router-dom'
import {toast}from 'react-hot-toast'
import {showLoading,hideLoading} from '../../../Context/userContext'
import {useDispatch} from 'react-redux'

function Login() {
    const [adminData,setData]=useState({})
    const navigate=useNavigate()
    const dispatch=useDispatch()
    const handleInput=(e)=>{
        if(e.target.value.trim()){
            setData({...adminData,[e.target.id]:e.target.value})
        }
    }
    const handleSubmit=()=>{
        if(Object.values(adminData).length==2){
            dispatch(showLoading())
            axios({route:'admin/login',payload:adminData,method:"POST"}).then(res=>{
                if(res.data.success){
                    localStorage.setItem('SyncUp_AdminToken',res.data.token)
                    toast.success(res.data.message)
                    window.location.reload()
                }else{
                    toast.error(res.data.message)
                }
            })
        }else{
            toast.error('Please fill it')
        }
        setTimeout(() => {
            dispatch(hideLoading())
        }, 2000);
    }
    return (
        <LoginPage handleInput={handleInput} handleSubmit={handleSubmit}/>
    )
}
const LoginPage = ({handleInput,handleSubmit})=>{
    return (
        <div className="adminLoginContainer">
            <div className="adminLoginBox">
                <h1 className="loginHead">Admin login</h1>
                <div className="inputBoxAdmin">
                    <div className="item">
                        <label htmlFor="email">Username :</label>
                        <input type="email" id='username' onChange={handleInput} placeholder='Enter your username' name="" />
                    </div>
                    <div className="item">
                        <label htmlFor="email">Password :</label>
                        <input type="password" id='password' onChange={handleInput} placeholder='Enter your password' name="" />
                    </div>
                    <button onClick={handleSubmit} className="btnAdminLogin">Login</button>
                </div>
            </div>
        </div>
    )
}
export default Login