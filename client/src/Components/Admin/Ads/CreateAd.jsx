import React, { useRef, useState } from 'react'
import NewPage from '../NewPage/NewPage'
import './CreateAd.css'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

function CreateAd() {
    const myRef = useRef()
    const navigate=useNavigate()
    const [adData,setAdData]=useState({})
    const [err,setErr]=useState(null)
    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAdData({...adData,img:e.target.result})
                document.getElementById('adImg').src = e.target.result;
            };
            reader.readAsDataURL(file);

        }
    }
    const handleInput=(e)=>{
        if(e.target.value.trim()){
            setErr(null)
            setAdData({...adData,[e.target.id]:e.target.value})
        }else{
            setErr(`Please fill ${e.target.id}`)
        }
    }
    const handleSubmit=()=>{
        const data = Object.values(adData).length==4
        if(data&&!err){
            const token=localStorage.getItem('SyncUp_AdminToken')
            if(token){
                axios.post('http://localhost:5000/admin/createAd',{adData:adData},{
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }).then(res=>{
                    if(res.data.success){
                        toast.success(res.data.message)
                        navigate('/admin/ads')
                    }else{
                        toast.error(res.data.message)
                    }
                })
            }
        }
    }
    return (
        <NewPage>
            <div className="createAdContainer">
                <h3 className='m-4'>Create Ad</h3>
                <img src="" id='adImg' onClick={() => myRef.current.click()} className="adImageInput" />
                <input onChange={handleImage} ref={myRef} type='file' hidden accept='image/*' />
                <div className="inputAd mt-3">
                    <input id='ad_name' onChange={handleInput} type="text" placeholder='Enter name' />
                    <input id='ad_title' onChange={handleInput} type="text" placeholder='Enter title' />
                    <input id='ad_redirect_url' onChange={handleInput} type="text" placeholder='Enter redirect url' />
                    <button onClick={handleSubmit} className="submitAd">Create</button>
                    {err&&<p className='text-danger mt-3'>{err}</p>}
                </div>
            </div>
        </NewPage>
    )
}

export default CreateAd