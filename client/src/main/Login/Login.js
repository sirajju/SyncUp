import React, { useEffect, useState } from 'react'
import LoginPage from '../../Components/LoginPage/Login'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { setUserData as setGlobalData, showLoading, hideLoading, setAuthConfig } from '../../Context/userContext'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import Otp from '../../main/Otp/Otp';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import Axios from '../../interceptors/axios'


function Login() {
    const [userData, setUserData] = useState({})
    const [err, setErr] = useState()
    const [showPass, setShow] = useState(false)
    const [isAuth, setAuth] = useState({ hasToVerify: false })
    const [isLoading,setLoading]=useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const login = useGoogleLogin({
        scope: "https://www.googleapis.com/auth/contacts.readonly",
        onSuccess: (codeResponse) => loginGoogleAccount(codeResponse),
        onError: (error) => alert('Login Failed:', error)
    });
    function loginGoogleAccount(user) {
        axios.get('https://people.googleapis.com/v1/people/me/connections', {
            headers: { Authorization: `Bearer ${user.access_token}` },
            params: {
                pageSize: 800,
                personFields: 'names,emailAddresses,coverPhotos,photos',
                sortOrder: "LAST_MODIFIED_ASCENDING"
            }
        }).then(res => {
            saveContacts(res.data.connections)
        })
        async function saveContacts(cont) {
            const options = {
                url: 'https://www.googleapis.com/',
                route: "/oauth2/v3/userinfo",
                headers: { Authorization: `Bearer ${user.access_token}` }
            }
            Axios(options).then(res => {
                if (res.data) {
                    const options = {
                        route: "OauthLogin",
                        method: "POST",
                        payload: { data: res.data }
                    }
                    Axios(options).then(res => {
                        if (res.data.success) {
                            toast.success(res.data.message)
                            localStorage.setItem('SyncUp_Auth_Token', res.data.token)
                            navigate('/chats')
                        }
                        if (res.data.notSynced) {
                            const opt = {
                                headers: { Authorization: `Bearer ${res.data.token}` },
                                payload: { contacts: cont },
                                route: "saveContacts",
                                method: "POST"
                            }
                            Axios(opt, res => {
                                navigate('/chats')
                            })
                        }
                        else if (res.data.err == 'EMAILNOTVERERR') {
                            localStorage.setItem('SyncUp_Auth_Token', res.data.token)
                            setAuth({ hasToVerify: true })
                            toast.error(res.data.message)
                        }
                        else {
                            toast.error(res.data.message)
                        }
                    })
                }
            })

        }
    }
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
            setLoading(true)
            const options = {
                route: "login",
                payload: userData,
                method: "POST"
            }
            Axios(options).then(res => {
                if (res.data.success) {
                    toast.success(res.data.message)
                    localStorage.setItem('SyncUp_Auth_Token', res.data.token)
                    setLoading(false)
                    navigate('/chats')
                }
                else if (res.data.err == 'EMAILNOTVERERR') {
                    localStorage.setItem('SyncUp_Auth_Token', res.data.token)
                    setAuth({ hasToVerify: true })
                    setLoading(false)
                    toast.error(res.data.message)
                }
                else {
                    setLoading(false)
                    toast.error(res.data.message)
                }
            })

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
                <button className="btnLogin" onClick={isLoading ? ()=>toast('Validating..') : handleSubmit}> {isLoading ? <div className='loginBtnSpinnerParent' > <span className="spinner"></span> </div> : "Login" }</button>
                <button className="button resendOtp m-1 mt-2" style={{ height: '35px', width: '130px' }} onClick={login}>Google</button>

                <p className='createHere'>Don't have an account ? <Link to={'/register'}>Create here</Link></p>
            </LoginPage> : <Otp />}
        </React.Fragment>
    )
}

export default Login