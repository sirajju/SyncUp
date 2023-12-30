import React, { useEffect, useState } from 'react'
import LoginPage from '../../Components/LoginPage/Login'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { setUserData as setGlobalData, showLoading, hideLoading, setAuthConfig } from '../../Context/userContext'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import Otp from '../../main/Otp/Otp';

function Login() {
    const [userData, setUserData] = useState({})
    const [err, setErr] = useState()
    const [showPass, setShow] = useState(false)
    const [isAuth, setAuth] = useState({ hasToVerify: false })
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const props = {
        leftTitle: "Login to continue",
        leftDescription: "Login to chat with your friends and family.By logging in you will accept our terms and conditions.",
        rightTitle: "User login"
    }
    const handleChange = (e) => {
        if (e.target.value !== '') {
            setErr(null)
            setUserData({ ...userData, [e.target.id]: e.target.value })
        } else {
            setErr(`Please enter the ${e.target.id}`)
            setUserData({ ...userData, [e.target.id]: e.target.value })
        }
    }
    const handleSubmit = (e) => {
        const val = Object.values(userData).filter((el) => el.trim()).length
        if (val == 2) {
            dispatch(showLoading())
            axios.post(`http://${window.location.hostname}:5000/login`, userData).then(res => {
                if (res.data.success) {
                    toast.success(res.data.message)
                    localStorage.setItem('SyncUp_Auth_Token', res.data.token)
                    navigate('/chats')
                }
                else if (res.data.err == 'EMAILNOTVERERR') {
                    localStorage.setItem('SyncUp_Auth_Token',res.data.token)
                    setAuth({ hasToVerify: true })
                    toast.error(res.data.message)
                }
                else {
                    toast.error(res.data.message)
                }
                setTimeout(() => {
                    dispatch(hideLoading())
                }, 1000);
            }).catch(err => { toast.error(err.message); dispatch(hideLoading()) })
        }
        else {
            toast.error("Please fill everything")
        }

    }
    return (
        <React.Fragment>
            {!isAuth.hasToVerify ? <LoginPage {...props}>
                <div className='formContainer'>
                    <div data-mdb-input-init class="form-outline">
                        <input type="email" onChange={handleChange} id="email" placeholder='Enter email or username' className='loginInput' />
                    </div>
                    <div data-mdb-input-init class="form-outline">
                        <input type={showPass ? "text" : "password"} onChange={handleChange} id="password" placeholder='Enter password' className='loginInput' />
                    </div>
                </div>
                <div className="options">
                    <div className="Showpassrd">
                        <p style={{ 'fontSize': "12px", fontWeight: "bold" }} className={err ? "visible text-danger" : "invisible"}>{err}</p>
                        <input type="checkbox" onChange={() => setShow(!showPass)} name="" id="showPass" />
                        <label htmlFor='showPass' className='showPassLabel'>Show password</label>
                    </div>
                    <Link style={{ 'fontSize': "13px" }} to='/forgetPassword'>Forget password ?</Link>
                </div>
                <button className="btnLogin" onClick={handleSubmit}>Login</button>
                <p className='createHere'>Don't have an account ? <Link to={'/register'}>Create here</Link></p>
            </LoginPage> : <Otp/>}
        </React.Fragment>
    )
}

export default Login