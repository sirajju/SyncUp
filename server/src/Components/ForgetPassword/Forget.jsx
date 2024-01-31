import React, { useEffect, useRef, useState } from 'react'
import './Forget.css'
import { useTimer } from 'react-timer-hook'
import { useDispatch } from 'react-redux'
import { hideLoading, setAuthConfig, showLoading } from '../../Context/userContext'
import toast from 'react-hot-toast'
import Axios from '../../interceptors/axios'

export default function Forget() {
    const [email, setEmail] = useState('')
    const myRef = useRef()
    const [invalid, setInvalid] = useState(true)
    const dispatch = useDispatch()
    useEffect(() => myRef.current.focus())
    const handleInput = (e) => {
        const emailPattern = new RegExp("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$")
        if (emailPattern.test(e.target.value)) {
            setInvalid(false)
            setEmail(e.target.value)
        } else {
            setInvalid(true)
        }
    }
    const handleSubmit = () => {
        dispatch(showLoading())
        const options = {
            route:"sendReset",
            params:{user:email}
        }
        Axios(options).then(res=>{
            if (res.data.success) {
                toast.success(res.data.message)
            } else {
                toast.error(res.data.message)
            }
        })
        setTimeout(() => {
            dispatch(hideLoading())
        }, 2000);
    }
    return (
        <div className="otpContainer">
            <div className="otpBox">
                <h1 className='otpHeader'>Forget Password</h1>
                {/* <span className="otpDescription">Please enter your email</span> */}
                <p className="otpDescription2">{ }</p>
                <input ref={myRef} type="email" onChange={handleInput} placeholder='Please enter your email' className={`forgetInput ${invalid && "invalid"}`} />
                <button className="button verifyOtp" disabled={invalid} onClick={handleSubmit} style={{ width: "50%" }}>Send reset link</button>
            </div>
        </div>
    )
}