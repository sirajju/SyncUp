import React, { useEffect, useState } from 'react';
import './TopBar.css';
import settingIcon from '../../../assets/svgIcons/settings.png';
import menuIcon from '../../../assets/svgIcons/menu.png';
import syncIcon from '../../../assets/svgIcons/sync.png';
import notification from '../../../assets/Images/notification.png';
import { useSelector } from 'react-redux';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios'

function TopBar({ handleSearch, setGo }) {
  let userData = useSelector(state => state.user)
  const [user,setUser]=useState('')
  const [notiNum, setNotiNum] = useState(0)
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => alert('Login Failed:', error)
});
  useEffect(() => {
    if (userData.value && userData.value.notifications) {
      setNotiNum(userData.value.notifications.filter(el=>!el.isReaded).length)
    }
    if(user){
      console.log(user);
      axios.get('https://www.googleapis.com/oauth2/v3/userinfo',{
        headers:{
          Authorization:`Bearer ${user.access_token}`
        }
      }).then(res=>{
        console.log(res);
      })
    }
  }, [userData,user])
  return (
    <div className="topBarContainer">
      <input type="text" onChange={handleSearch} maxLength={20} placeholder='Enter username' className="searchBar" />
      <div className="chatOptions">
        <div>
          {notiNum > 0 && <p className='notiNum'>{notiNum}</p>}
          <img src={notification} onClick={() => setGo(`Notifications`)} className='icon' alt='Notifcation' />
        </div>
        {/* <img src={settingIcon} className='icon settingsIcon' alt='Settings' /> */}
        <img src={syncIcon} onClick={()=>login()} className='icon' alt='Settings' />
        <img src={menuIcon} className='icon' alt='Menu' />
        <img src={userData.value.avatar_url} onClick={() => setGo(`Profile`)} style={{ borderRadius: "50px" }} className='icon' alt='Dp' />
      </div>
    </div>
  );
}

export default TopBar;
