import React, { useEffect } from 'react'
import './App.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import Home from './main/Home/Home';
import Login from './main/Login/Login'
import Register from './main/Register/Register'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Chats from './main/Chats/Chats';
import { Provider, useDispatch, useSelector } from 'react-redux';
import UserRoute from './Components/CheckLogin/userRoute';
import GuestRoute from './Components/CheckLogin/guestRoute';
import Forget from './Components/ForgetPassword/Forget';
import VerifyLink from './Components/ForgetPassword/VerifyLink';
import AdminRoute from './Components/CheckLogin/adminRoute';
import Users from './Components/Admin/Users/Users';
import Dashboard from './Components/Admin/Dashboard/Dashboard';
import Ads from './Components/Admin/Ads/Ads';
import CreateAd from './Components/Admin/Ads/CreateAd';
import Premium from './Components/Premium/Premium';
import { hideLoading } from './Context/userContext';
import _ from 'lodash';
import { requestPermission } from './Context/firebaseConfig';
import Reports from './Components/Admin/Reports/Reports';
import AdminChats from './Components/Admin/Chats/Chats'
import AdminNotes from './Components/Admin/Notes/Notes'
import AdminBroadcasts from './Components/Admin/Broadcast/Broadcast'
import CreateBroadcast from './Components/Admin/Broadcast/newBroadcast'

function App() {
  const isLoading = useSelector(state => state.progress.value)
  const dispatch = useDispatch()
  useEffect(() => {
    if (isLoading) {
      _.delay(() => dispatch(hideLoading()), 5000)
    }
  }, [])
  return (
    <React.Fragment>
      <div className='spinnerParent' style={{ display: isLoading ? "block" : 'none' }} ><span className="spinner-border" role="status" aria-hidden="true" /></div>
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<GuestRoute><Login /></GuestRoute>} />
          <Route path='/register' element={<GuestRoute><Register /></GuestRoute>} />
          <Route path='/chats' element={<UserRoute><Chats /></UserRoute>} />
          <Route path='/plans' element={<UserRoute><Premium /></UserRoute>} />
          <Route path='/forgetPassword' element={<GuestRoute><Forget /></GuestRoute>} />
          <Route path='/resetPassword' element={<GuestRoute><VerifyLink /></GuestRoute>} />
          <Route path='/admin' element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path='/admin/users' element={<AdminRoute><Users /></AdminRoute>} />
          <Route path='/admin/ads' element={<AdminRoute><Ads /></AdminRoute>} />
          <Route path='/admin/ads/new' element={<AdminRoute><CreateAd /></AdminRoute>} />
          <Route path='/admin/reports' element={<AdminRoute><Reports /></AdminRoute>} />
          <Route path='/admin/chats' element={<AdminRoute><AdminChats /></AdminRoute>} />
          <Route path='/admin/notes' element={<AdminRoute><AdminNotes /></AdminRoute>} />
          <Route path='/admin/broadcasts' element={<AdminRoute><AdminBroadcasts /></AdminRoute>} />
          <Route path='/admin/broadcasts/new' element={<AdminRoute><CreateBroadcast /></AdminRoute>} />
          <Route path='*' element={<h4>Not found</h4>} />
          
        </Routes>
      </Router>
    </React.Fragment>
  );
}


export default App;
