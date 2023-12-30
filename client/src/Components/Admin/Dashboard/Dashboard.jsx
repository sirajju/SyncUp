import React, { useState,useEffect } from 'react'
import './Dashboard.css'
import usersIcon from '../../../assets/Images/users.png'
import businessIcon from '../../../assets/Images/business.png'
import blockedIcon from '../../../assets/Images/blocked.png'
import premiumIcon from '../../../assets/Images/premium.png'
import Chart from './Chart'
import SmallBoxes from './SmallBoxes'
import Navbar from '../NavBar/Navbar'
import Sidebar from '../Sidebar/Sidebar'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { hideLoading, setAuthConfig, showLoading } from '../../../Context/userContext'
import toast from 'react-hot-toast'
import cryptojs from 'crypto-js'

function Dashboard() {
  const dispatch = useDispatch()
  const [open, setOpen] = useState(true)
  const [data, setData] = useState({})
  useEffect(() => {
    dispatch(showLoading())
    const token = localStorage.getItem('SyncUp_AdminToken')
    if (token) {
      axios.get(`http://localhost:5000/admin/isAlive?getData=${!Boolean(Object.values(data).length)}&&ref=Dashboard`, {
        headers: {

          Authorization: `Bearer ${token}`
        }
      }).then(res => {
        if (res.data.success) {
          if (res.data.body) {
            const decrypted = cryptojs.AES.decrypt(res.data.body, 'syncupservercryptokey').toString(cryptojs.enc.Utf8);
            setData(JSON.parse(decrypted))
          }
        } else {
          toast.error(res.data.message)
          localStorage.removeItem('SyncUp_AdminToken')
        }
      })
    }
    setTimeout(() => {
      dispatch(hideLoading())
    }, 500);
  }, [])
  return (
    <div className="dashboardContainer">
      <Navbar open={open} setOpen={setOpen} />
      <Sidebar active='Dashboard' />
      <section className="dashboard">
        <div className="dbDetails">
          <div className="dtCont">
            <SmallBoxes count={data.users} text={"Users"} icon={usersIcon} />
            <SmallBoxes count={data.premium} text={"Premium"} icon={premiumIcon} />
            <SmallBoxes count={data.business} text={"Business"} icon={businessIcon} />
            <SmallBoxes count={data.blocked} text={"Blocked"} icon={blockedIcon} />
          </div>
          <div className="graph">
            <div className="hel">
              <h5>Revenue</h5>
              <Chart barColors={['lightblue', '#2b5797', 'green']} xValues={["Ads", "Premium", "Business"]} yValues={[40, 100, 20,]} />
            </div>
            <div className="hel">
              <h5>Accounts</h5>
              <Chart barColors={["green", "#00aba9", "#2b5797", "red",]} xValues={["Users", "Premium", "Business", "Blocked"]} yValues={[data.users, data.premium, data.business, data.blocked,]} />
            </div>
          </div>

        </div>
      </section>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"></script>

    </div>
  )
}

export default Dashboard