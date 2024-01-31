import React from 'react'
import Menu from '../../../assets/svgIcons/menu.png'
import Collapse from '../../../assets/Images/collapse.png'
import adminDp from '../../../assets/Images/adminDp.png'
import notiIcon from '../../../assets/Images/notification.png'
function Navbar({open,setOpen}) {
    const handleCollapse = () => {
        const el = document.querySelector('.sidebar')
        setOpen(!open)
        if (el.classList.contains('animate-sidebar')) {
          el.classList.remove('animate-sidebar')
        } else {
          el.classList.add('animate-sidebar')
        }
      }
    return (
        <nav className="navbar navbar-light bg-light justify-content-between">
            <img src={open ? Collapse : Menu} onClick={handleCollapse} alt="" className="navbar-brand" />
            <h4 className='text-dark adminTitle'>Welcome to adminPanel</h4>
            <div>
                <img src={notiIcon} className='adminDp mx-3' alt="" />
                <img src={adminDp} className='adminDp' alt="" />
            </div>
        </nav>
    )
}

export default Navbar