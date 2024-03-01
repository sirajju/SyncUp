import React, { useEffect, useRef, useState } from 'react'
import { useTimer } from 'react-timer-hook'
import './Otp.css'
import { useDispatch } from 'react-redux'
import { hideLoading, setAuthConfig, showLoading } from '../../Context/userContext'


export default function Otp({  isTimeExpired, generateOtpInputs, resendOtp,verifyOtp,timer }) {
    const dispatch = useDispatch()
    const showLoadingFunction = function () {
        dispatch(showLoading())
        setTimeout(() => {
            dispatch(hideLoading())
        }, 2000);
    }
    const resendMyOtp=()=>{
        showLoadingFunction()
        resendOtp()

    }
    return (
        <div className="otpContainer">
            <div className="otpBox">
                <h1 className='otpHeader'>OTP</h1>
                <span className="otpDescription">We have sent you <b>OTP</b> to your registered email</span>
                <p className="otpDescription2">Please enter the otp</p>
                {!isTimeExpired && <p className="timer">{timer.minutes}:{timer.seconds}</p>}
                <div className="otp">
                    {generateOtpInputs(5)}
                </div>
                <div className="btns">
                    <button onClick={resendMyOtp} disabled={!isTimeExpired} className="button resendOtp">Resend otp</button>
                    <button onClick={verifyOtp} className="button verifyOtp">Verify otp</button>
                </div>
            </div>
        </div>
    )
}