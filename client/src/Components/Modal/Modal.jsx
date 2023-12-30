import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios'
import toast from 'react-hot-toast'
import { hideLoading, setUserData, showLoading } from '../../Context/userContext'

export default function Basic() {
  const userData = useSelector(state => state.user)
  const [loading, setLoading] = useState(false)
  const [img, setImg] = useState()
  const imgRef = useRef()
  const dispatch = useDispatch()
  const closeBtnRef = useRef()
  const handleAvatarInput = (e) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      document.querySelector(`.choosedImg`).src = e.target.result
      setImg(e.target.result)
    }
    if (e.target.files[0] && e.target.files[0].type.startsWith('image/')) {
      reader.readAsDataURL(e.target.files[0])
    }
  }
  const setProfilePic = async () => {
    setLoading(true)
    const secureUrl = await HandleUpload(img)
    const token = localStorage.getItem('SyncUp_Auth_Token')
    if (token) {
      axios.post(`http://${window.location.hostname}:5000/changeDp`, { img: secureUrl }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(res => {
        if (res.data.success) {
          toast.success(res.data.message)
          dispatch(setUserData({ ...userData, avatar_url: secureUrl }))
          closeBtnRef.current.click()
        } else {
          toast.error(res.data.message)
        }
      }).catch(err => {
        console.log(err);
        toast.error(err.message)
      })
      setTimeout(() => {
        setLoading(false)
        dispatch(hideLoading())
      }, 100);
    }
  }
  return (
    <>

      <div className="modal fade" style={{ background: 'linear-gradient(160deg, #ee9ae5ff 0%, #5961f9ff 100%)' }} id="profileAvatarModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" ref={closeBtnRef} className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <h5 className="text-dark">Choose image to you profile pic</h5>
              <img src={userData.value.avatar_url} alt="" onClick={() => imgRef.current.click()} className="profileAvatar choosedImg" />
              <input type="file" hidden onChange={handleAvatarInput} ref={imgRef} accept='image/*' />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
              <button type="button" className="btn" onClick={!loading ? setProfilePic : ()=>toast('Please wait..')} style={{ background: 'linear-gradient(160deg, #ee9ae5ff 0%, #5961f9ff 100%)', color: 'white' }}>{loading ? <> Uploading... </> : "Apply"}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
const HandleUpload = async (base64File) => {
  const formData = new FormData();
  formData.append('file', base64File);
  formData.append('upload_preset', 'syncup_preset');

  const data = await fetch('https://api.cloudinary.com/v1_1/drjubxrbt/image/upload', {
    method: 'POST',
    body: formData,
  })
  const { secure_url } = await data.json()
  return secure_url
};