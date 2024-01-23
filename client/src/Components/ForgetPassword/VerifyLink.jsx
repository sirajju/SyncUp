import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import './Forget.css'
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { hideLoading, showLoading } from '../../Context/userContext';
import Axios from '../../interceptors/axios';

function VerifyLink() {
    const [params, setParams] = useSearchParams()
    const [passData, setData] = useState({})
    const [show, setShow] = useState(false)
    const myRef = useRef()
    const token = params.get('token')
    const user = atob(params.get('user'))
    const [auth, setAuth] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    useEffect(() => {
        dispatch(showLoading())
        if (token && user) {
            const options = {
                method:"POST",
                route:"verifyChangePassword",
                payload:{token, user }
            }
            Axios(options).then(res=>{
                if (res.data.success) {
                    setAuth(true)
                } else {
                    toast.error(res.data.message)
                    navigate('/login')
                }
            })
        }else{
            navigate('/login')
        }
        setTimeout(() => {
            dispatch(hideLoading())
        }, 2000);
    }, [])
    const handleInput = (e) => {
        const regex = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$")
        if (regex.test(e.target.value)) {
            e.target.classList.remove('invalid')
            setData({ ...passData, [e.target.id]: e.target.value })
            myRef.current.disabled = false
        } else {
            e.target.classList.add('invalid')
            myRef.current.disabled = true
        }
    }
    const handleSubmit = () => {
        console.log(passData);
        if (Object.values(passData).length == 2) {
            if (passData.confirmPass == passData.pass) {
                const options = {
                    method:"PATCH",
                    route:"changePass",
                    payload:{password:passData.pass,user,token}
                }
                Axios(options).then(res=>{
                    if(res.data.success){
                        toast.success(res.data.message)
                        navigate('/login')
                    }else{
                        toast.error(res.data.message)
                    }
                })
            } else {
                toast.error('Passwords aren\'t match ')
            }
        }else{
            toast.error('Please fill it')
        }
    }
    return (
        <div className="otpContainer">
            <div className="otpBox">
                <h1 className='otpHeader'>Reset password</h1>
                {/* <span className="otpDescription">Please enter your email</span> */}
                <p className="otpDescription2"></p>
                <input id='pass' type={show ? "text" : "password"} onChange={handleInput} placeholder='Enter password' className={`resetPassInput`} />
                <input id='confirmPass' type={show ? "text" : "password"} onChange={handleInput} placeholder='Confirm password' className={`resetPassInput`} />
                <div className="options" style={{ width: "50%" }}>
                    <div className="Showpassrd">
                        <input type="checkbox" onChange={() => setShow(!show)} name="" id="showPass" />
                        <label htmlFor='showPass' className='showPassLabel'>Show password</label>
                    </div>
                </div>
                <button className="button verifyOtp" ref={myRef} onClick={handleSubmit} style={{ width: "50%" }}>Change password</button>
            </div>
        </div>
    )
}

export default VerifyLink