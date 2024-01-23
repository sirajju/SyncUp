import React, { useEffect } from 'react'
import './App.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import Home from './main/Home/Home';
import Login from './main/Login/Login'
import Register from './main/Register/Register'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Chats from './main/Chats/Chats';
import { Provider, useSelector } from 'react-redux';
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
// import {GetToken} from './Context/firebaseConfig'
// GetToken()

function App() {
  const isLoading = useSelector(state => state.progress.value)

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
          <Route path='/admin' element={<AdminRoute redirect={<Dashboard />} />} />
          <Route path='/admin/users' element={<AdminRoute redirect={<Users />} />} />
          <Route path='/admin/ads' element={<AdminRoute redirect={<Ads />} />} />
          <Route path='/admin/ads/new' element={<AdminRoute redirect={<CreateAd />} />} />
          <Route path='*' element={<h4>Not found</h4>} />
        </Routes>
      </Router>
    </React.Fragment>
  );
}


export default App;
