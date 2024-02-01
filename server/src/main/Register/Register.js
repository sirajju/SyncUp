import React, { useEffect, useState } from 'react'
import LoginPage from '../../Components/LoginPage/Login'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { hideLoading, showLoading } from '../../Context/userContext'
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import Axios from '../../interceptors/axios'


function Register() {
    const [userData, setUserData] = useState({})
    const [err, setErr] = useState()
    const [params, setParams] = useSearchParams()
    const [showPass, setShow] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const login = useGoogleLogin({
        onSuccess: (codeResponse) => registerGoogle(codeResponse),
        onError: (error) => alert('Login Failed:', error)
    });
    function registerGoogle(user) {
        const refferal = params.get('refferal')
        const options = {
            url: "https://www.googleapis.com/",
            route: "oauth2/v3/userinfo",
            headers: { Authorization: `Bearer ${user.access_token}` }
        }
        Axios(options).then(res => {
            if (res.data) {
                const options = {
                    route: "OauthRegister",
                    payload: { data: { ...res.data, refferal } },
                    method: "POST"
                }
                Axios(options, res => {
                    if (res.data.success) {
                        toast.success('Now login to continue')
                        navigate('/login')
                    } else {
                        toast.error(res.data.message)

                    }
                })

            }
        })
    }
    const props = {
        leftTitle: "Register to continue",
        leftDescription: "Register to chat with your friends and family.By registering you will accept our terms and conditions.",
        rightTitle: "User register"
    }
    const handleChange = (e) => {
        const refferal = params.get('refferal')
        if (refferal) {
            setUserData({ ...userData, refferal });;
        }
        if (e.target.value !== '') {
            if (e.target.id == 'username') {
                const options = {
                    route: "checkUsername",
                    params: { username: e.target.value }
                }
                Axios(options).then(res => {
                    if (!res.data.success) {
                        setErr(res.data.message)
                        e.target.classList.add('invalid')
                    } else {
                        setErr(null)
                        setUserData({ ...userData, username: e.target.value })
                        e.target.classList.remove('invalid')
                    }
                })
            }
            else if (e.target.id == 'password') {
                const pattern = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{6,}$/
                if (pattern.test(e.target.value)) {
                    setErr(null)
                    setUserData({ ...userData, [e.target.id]: e.target.value })
                } else {
                    setErr('Please make a strong password')
                }
            }
            else if (e.target.id == 'email') {
                const emailPattern = new RegExp("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$")
                if (emailPattern.test(e.target.value)) {
                    setErr(null)
                    setUserData({ ...userData, email: e.target.value })
                } else {
                    setErr('Invalid email')
                }
            }
            else {
                setErr(null)
                setUserData({ ...userData, [e.target.id]: e.target.value })
            }
        } else {
            setErr(`Please enter the ${e.target.id}`)
            setUserData({ ...userData, [e.target.id]: e.target.value })
        }
    }
    const handleSubmit = (e) => {
        const val = Object.values(userData).filter((el) => el.trim()).length
        if (val >= 4) {
            if (userData['password'] == userData['confirm password']) {
                dispatch(showLoading())
                const options = {
                    route: "register",
                    payload: userData
                }
                Axios(options).then(res => {
                    if (res.data) {
                        setTimeout(() => {
                            dispatch(hideLoading())
                        }, 1500);
                        if (res.data.success) {
                            toast.success('Now login to continue')
                            navigate('/login')
                        } else {
                            toast.error(res.data.message)
                        }
                    }
                })
            } else {
                toast.error('Passwords are\'nt match')
            }
        }
        else {
            toast.error("Please fill everything")
        }
    }
    return (
        <LoginPage {...props}>
            <div className='formContainer'>
                <div data-mdb-input-init className="form-outline">
                    <input onInput={handleChange} type="text" id="username" placeholder='Enter username' className='loginInput' />
                </div>
                <div data-mdb-input-init className="form-outline">
                    <input onInput={handleChange} type="email" id="email" placeholder='Enter email' className='loginInput' />
                </div>
                <div data-mdb-input-init className="form-outline">
                    <input onInput={handleChange} type={showPass ? "text" : "password"} id="password" placeholder='Enter password' className='loginInput' />
                </div>
                <div data-mdb-input-init className="form-outline">
                    <input onInput={handleChange} type={showPass ? "text" : "password"} id="confirm password" placeholder='Confirm password' className='loginInput' />
                </div>
            </div>
            <div className="options">
                <div className="Showpassrd">
                    <p style={{ 'fontSize': "12px", fontWeight: "bold" }} className={err ? "visible text-danger" : "invisible"}>{err}</p>
                    <input type="checkbox" onChange={() => setShow(!showPass)} name="" id="showPass" />
                    <label htmlFor='showPass' className='showPassLabel'>Show password</label>
                </div>
            </div>
            <button className="btnLogin mt-1" style={{ height: '35px' }} onClick={handleSubmit}>Register</button>
            <button className="button resendOtp m-1 mt-2" style={{ height: '30px', width: '130px' }} onClick={login}>Google</button>
            <p className='createHere'>Alreay have an account ? <Link to={'/login'}>Login here</Link></p>
        </LoginPage>
    )
}

export default Register