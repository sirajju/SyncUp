import React, { useEffect, useRef, useState } from 'react'
import LoginPage from '../../Components/LoginPage/Login'
import { Link, useNavigate } from 'react-router-dom'
import OtpPage from '../../Components/OtpPage/Otp'
import { useDispatch } from 'react-redux'
import { useTimer } from 'react-timer-hook'
import toast from 'react-hot-toast'
import { hideLoading, setAuthConfig, showLoading } from '../../Context/userContext'
import Axios from '../../interceptors/axios'

function Otp() {
  const [otp, setOtp] = useState({})
  const [isTimeExpired, setExpired] = useState(false)
  const timer = useTimer({ expiryTimestamp: Date.now() + 500 * 60, onExpire: () => { setExpired(true) } })
  let [count, setCount] = useState(1)
  let [tries, incTrie] = useState(0)
  const dispatch = useDispatch()
  const inputRefs = [useRef(null),useRef(null),useRef(null),useRef(null),useRef(null)]
  const navigate = useNavigate()
  useEffect(() => {
    let token = localStorage.getItem('SyncUp_Auth_Token')
    if (token) {
      const options = {
        route: "sendOtp",
        headers: { 'Authorization': `Bearer ${token}` }
      }
      Axios(options, res => {
        if (!res.data.success) {
          toast.error(res.data.message)
          navigate('/login')
        }
      })
    }
  }, [])
  const handleBack = function(e,i){
    if(e.key=='Backspace' && inputRefs[i-2]?.current){
      e.target.value =''
      inputRefs[i-2].current.focus()
    }
  }
  const checkValid = function (e,i) {
    if (isNaN(parseInt(e.target.value))) {
      e.target.value = ''
    }
    else if (parseInt(e.target.value) > 9) {
      e.target.value = e.target.value[0]
    } else {
      if(inputRefs[i+1]?.current) {
        inputRefs[i+1].current.focus()
      }
      return true
    }
  }
  const generateOtpInputs = function (num) {
    const elements = []
    for (let i = 1; i <= num; i++) {
      elements.push(<input key={i} type='number' onKeyDown={(e)=>handleBack(e,i)} ref={inputRefs[i-1]} name={i} onChange={(e) => { checkValid(e,i-1) && setOtp({ ...otp, [e.target.name]: parseInt(e.target.value) }) }} pattern='[0-9]' />)
    }
    return elements
  }
  const resendOtp = function () {
    const token = localStorage.getItem('SyncUp_Auth_Token')
    const options = {
      route: "resendOtp",
      headers: { 'Authorization': `Bearer ${token}` }
    }
    Axios(options).then(res => {
      if (res.data.success) {
        timer.restart(Date.now() + (30000 * count))
        setCount((prevCount) => prevCount + 1)
        setExpired(false)
        toast.success(res.data.message)
      }
      else {
        toast.error(res.data.message)
        localStorage.removeItem('SyncUp_Auth_Token')
        window.onbeforeunload = 'return false'
        window.location.reload()
      }
    })
  }
  const verifyOtp = () => {
    dispatch(showLoading())
    if (tries >= 3) {
      toast.error('You have tried many times. Try again later')
      return false
    }
    let last_otp = '';
    for (let i = 1; i < Object.values(otp).length + 1; i++) {
      last_otp += otp[i.toString()]
    }
    if (last_otp.length == 5) {
      const token = localStorage.getItem('SyncUp_Auth_Token')
      const options = {
        route: "verifyOtp",
        params: { otp: last_otp },
        headers: { Authorization: `Bearer ${token}` }
      }
      Axios(options).then(res => {
        incTrie(prev => prev + 1)
        if (!res.data.success) {
          toast.error(res.data.message)
        } else {
          toast.success(res.data.message)
          dispatch(setAuthConfig({ isVerified: true }))
          window.onbeforeunload = null
          navigate('/chats')
        }
      })
    } else {
      toast.error('Please enter otp')
    }
    setTimeout(() => {
      dispatch(hideLoading())
    }, 2000);
  }
  const obj = {
    isTimeExpired,
    generateOtpInputs,
    resendOtp,
    verifyOtp,
    timer
  }
  return (
    <OtpPage {...obj} />
  )
}
export default Otp