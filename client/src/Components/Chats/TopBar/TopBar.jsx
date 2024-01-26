import React, { useEffect, useState } from 'react';
import './TopBar.css';
import settingIcon from '../../../assets/svgIcons/settings.png';
import menuIcon from '../../../assets/svgIcons/menu.png';
import syncIcon from '../../../assets/svgIcons/sync.png';
import notification from '../../../assets/Images/notification.png';
import { useDispatch, useSelector } from 'react-redux';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios'
import Axios from '../../../interceptors/axios';
import { useNavigate } from 'react-router-dom';
import { setUserData } from '../../../Context/userContext';
import toast from 'react-hot-toast';

function TopBar({ handleSearch, setGo }) {
  let userData = useSelector(state => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [notiNum, setNotiNum] = useState(0)
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => saveCondact(codeResponse),
    onError: (error) => alert('Login Failed:', error)
  });
  function saveCondact(user) {
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
      const opt = {
        headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
        payload: { contacts: cont },
        route: "saveContacts",
        method: "POST"
      }
      Axios(opt).then(res => {
        if (res.data.success) {
          dispatch(setUserData({ ...userData.value, googleSynced: true }))
          toast.success('Google contacts imported')
        }
      })
    }
  }
  useEffect(() => {
    if (userData.value && userData.value.notifications) {
      setNotiNum(userData.value.notifications.filter(el => !el.isReaded).length)
    }
  }, [userData])
  return (
    <div className="topBarContainer">
      <input type="text" onChange={handleSearch} maxLength={20} placeholder='Enter username' className="searchBar" />
      <div className="chatOptions">
        <div>
          {notiNum > 0 && <p className='notiNum'>{notiNum}</p>}
          <img src={notification} onClick={() => setGo(`Notifications`)} className='icon' alt='Notifcation' />
        </div>
        {/* <img src={settingIcon} className='icon settingsIcon' alt='Settings' /> */}
        {!userData.value.googleSynced && <img src={syncIcon} onClick={() => login()} className='icon' alt='Settings' />}
        <img src={menuIcon} className='icon' alt='Menu' />
        <img src={userData.value.avatar_url} onClick={() => setGo(`Profile`)} style={{ borderRadius: "50px" }} className='icon' alt='Dp' />
      </div>
    </div>
  );
}

export default TopBar;
