import React, { useState } from 'react'
import LoginPage from '../../Components/LoginPage/Login'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { hideLoading, showLoading } from '../../Context/userContext'

function Register() {
    const [userData, setUserData] = useState({})
    const [err, setErr] = useState()
    const [params, setParams] = useSearchParams()
    const [showPass, setShow] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
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
                axios.get(`http://${window.location.hostname}:5000/checkUsername?username=${e.target.value}`).then(res => {
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
                axios.post(`http://${window.location.hostname}:5000/register`, userData).then(res => {
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
                }).catch(err => { toast.error(err.message); dispatch(hideLoading()) })
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
            <button className="btnLogin" onClick={handleSubmit}>Register</button>
            <p className='createHere'>Alreay have an account ? <Link to={'/login'}>Login here</Link></p>
        </LoginPage>
    )
}

export default Register