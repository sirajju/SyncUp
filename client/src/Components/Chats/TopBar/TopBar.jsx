import React, { useEffect, useState } from 'react';
import './TopBar.css';
import settingIcon from '../../../assets/svgIcons/settings.png';
import menuIcon from '../../../assets/svgIcons/menu.png';
import notification from '../../../assets/Images/notification.png';
import { useSelector } from 'react-redux';
import axios from 'axios'

function TopBar({ handleSearch, setGo }) {
  let userData = useSelector(state => state.user)
  const [notiNum, setNotiNum] = useState(0)
  useEffect(() => {
    if (userData.value && userData.value.notifications) {
      setNotiNum(userData.value.notifications.filter(el=>!el.isReaded).length)
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
        <img src={settingIcon} className='icon settingsIcon' alt='Settings' />
        <img src={menuIcon} className='icon' alt='Menu' />
        <img src={userData.value.avatar_url} onClick={() => setGo(`Profile`)} style={{ borderRadius: "50px" }} className='icon' alt='Dp' />
      </div>
    </div>
  );
}

export default TopBar;
