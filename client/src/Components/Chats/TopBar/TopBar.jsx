import React, { useEffect, useState } from 'react';
import './TopBar.css';
import settingIcon from '../../../assets/svgIcons/settings.png';
import menuIcon from '../../../assets/svgIcons/menu.png';
import syncIcon from '../../../assets/svgIcons/sync.png';
import notification from '../../../assets/Images/notification.png';
import newIcon from '../../../assets/Images/new.png';
import notesIcon from '../../../assets/Images/notes.png';
import premiumIcon from '../../../assets/Images/premium_icon.png';
import shareIcon from '../../../assets/Images/share.png';
import deleteIcon from '../../../assets/Images/delete.png';
import scheduleIcon from '../../../assets/Images/schedule.png';
import { useDispatch, useSelector } from 'react-redux';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import Axios from '../../../interceptors/axios';
import { clearNotes, setArchived, setMyNotes, setUserData } from '../../../Context/userContext';
import toast from 'react-hot-toast';
import { Dropdown } from 'antd';
import CreateNote from '../../../main/Notes/CreateNote/CreateNote';
import { useNavigate } from 'react-router-dom';

function TopBar({ handleSearch, setGo, activeTab, setActiveTab }) {
  let userData = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isOpen, setOpen] = useState(false);
  const [notiNum, setNotiNum] = useState(0);
  const myNotes = useSelector(state => state.myNotes)
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => saveContact(codeResponse),
    onError: (error) => alert('Login Failed:', error),
  });

  async function saveContact(user) {
    try {
      const response = await axios.get('https://people.googleapis.com/v1/people/me/connections', {
        headers: { Authorization: `Bearer ${user.access_token}` },
        params: {
          pageSize: 800,
          personFields: 'names,emailAddresses,coverPhotos,photos',
          sortOrder: 'LAST_MODIFIED_ASCENDING',
        },
      });
      saveContacts(response.data.connections);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      toast.error('Failed to fetch contacts');
    }
  }

  async function saveContacts(contacts) {
    try {
      const response = await Axios({
        headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
        payload: { contacts },
        route: 'saveContacts',
        method: 'POST',
      });
      if (response.data.success) {
        dispatch(setUserData({ ...userData.value, googleSynced: true }));
        toast.success('Google contacts imported');
      }
    } catch (error) {
      console.error('Failed to save contacts:', error);
      toast.error('Failed to save contacts');
    }
  }

  useEffect(() => {
    console.log(userData.value.notifications);
    if (userData.value && userData.value.notifications) {
      setNotiNum(userData.value.notifications.filter((el) => !el.isReaded).length);
    }
  }, [userData]);

  const copyLink = async () => {
    try {
      if (navigator.share) {
        navigator.share({
          title: 'SyncUp',
          text: 'Share your referral link by',
          url: `http://${window.location.hostname}:3000/register?referral=${btoa(userData.value.email)}`,
        });
      }
      await navigator.clipboard.writeText(`Hi, User ${userData.value.username} wants to connect with you on SyncUp.\n\nClick the link to join:\nhttp://localhost:3000/register?referral=${btoa(userData.value.email)}`);
      toast.success('Link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };
  const clearUserNotes = function () {
    const options = {
      route: "clearNotes",
      headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
      method: "DELETE"
    }
    Axios(options).then(res => {
      if (res.data.success) {
        dispatch(setMyNotes(myNotes.value.filter(el=>el.isExpired==false)))
        toast.success(res.data.message)
      } else {
        toast.error(res.data.message)
      }
    })
  }
  
  const itemFunction = {
    reffer: copyLink,
    createNote: () => setOpen(!isOpen),
    myNotes: () => setActiveTab('My Notes'),
    premium: () => navigate('/plans'),
    clearNotes:clearUserNotes
  };
  const canCreateNote = function () {
    if (myNotes?.value?.length) {
      if (typeof myNotes.value == 'object') {
        return !myNotes.value.filter(el => el.isExpired == false).length
      }
    }
    return true
  }
  const notesItems = [
    {
      label: 'My notes',
      key: 'myNotes',
      icon: <img className='menuIcon' src={notesIcon} alt='My Notes' />,
    },
    {
      label: 'Create note',
      key: 'createNote',
      icon: <img className='menuIcon' src={newIcon} alt='Create Note' />,
      hidden: !canCreateNote(),
    },
  ];

  const myNotesItems = [
    {
      label: 'Create note',
      key: 'createNote',
      icon: <img className='menuIcon' src={newIcon} alt='Create Note' />,
      hidden: !canCreateNote(),
    },
    {
      label: 'Clear expired notes',
      key: 'clearNotes',
      icon: <img className='menuIcon' src={deleteIcon} alt='Clear notes' />,
      disabled:!myNotes.value?.filter(el=>el?.isExpired==true).length
    },
  ];

  const chatsItems = [
    {
      label: <span className='premiumRequired'>Schedule message</span>,
      key: 'scheduleMsg',
      icon: <img className='menuIcon' src={scheduleIcon} alt='Schedule Message' />,
    },
    {
      label: <span className='premiumRequired'>Premium</span>,
      key: 'premium',
      icon: <img className='menuIcon' src={premiumIcon} alt='Premium' />,
      hidden: userData.value.isPremium
    },
    {
      label: 'Refer friends',
      key: 'reffer',
      icon: <img className='menuIcon' src={shareIcon} alt='Refer Friends' />,
    },
  ];
  const menuItems = {
    'Notes': notesItems,
    'Chats': chatsItems,
    'My Notes': myNotesItems
  }
  return (
    <div className="topBarContainer">
      <input type="text" onChange={handleSearch} maxLength={20} placeholder='Enter username' className="searchBar" />
      <div className="chatOptions">
        <div>
          {notiNum > 0 && <p className='notiNum'>{notiNum}</p>}
          <img src={notification} onClick={() => {setGo('Notifications');dispatch(setUserData({...userData.value,notifications:userData.value.notifications.map(el=>el={...el,isReaded:true})}))}} className='icon notificationsIcon' alt='Notification' />
        </div>
        <CreateNote isOpen={isOpen} setOpen={setOpen} />
        {!userData.value.googleSynced && <img src={syncIcon} onClick={() => login()} className='icon googleSync' alt='Google Sync' />}
        <Dropdown
          arrow
          menu={{
            items: menuItems[activeTab],
            onClick: ({ key }) => itemFunction[key]?.call(),
          }}
          trigger={['click']}
        >
          <img src={menuIcon} className='icon menuIcon' alt='Menu Icon' />
        </Dropdown>
        <img src={userData.value.avatar_url} onClick={() => setGo('Profile')} style={{ borderRadius: '50px' }} className='icon profileIcon' alt='Profile' />
      </div>
    </div>
  );
}

export default TopBar;
