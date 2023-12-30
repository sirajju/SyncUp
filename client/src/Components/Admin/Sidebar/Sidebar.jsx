import React from 'react'
import { useNavigate } from 'react-router-dom'

function Sidebar({active}) {
  const changeActive = (e) => {
    document.querySelectorAll('.sidebarBtn').forEach(el => {
      if (el != e.target) {
        el.classList.remove('sideBtnActive')
      } else {
        el.classList.add('sideBtnActive')
      }
    })
  }
  const navigate = useNavigate()
  const btnArray = ['Dashboard', 'Users', 'Advertisments', 'Business', 'Groups', 'Reported','Verification']
  const redirectLinks = [' ','users','ads','business','groups','reports','verification']
  const redirectUrl = (i)=>{
    navigate('/admin/'+redirectLinks[i])
  }
  return (
    <section className='sidebar animate-sidebar'>
        {btnArray.map((el,ind) => {
          return <button key={ind} onClick={(e)=>{changeActive(e);redirectUrl(ind)}} className={el == active ? "sidebarBtn sideBtnActive" : "sidebarBtn"}>{el}</button>
        })}
      </section>
  )
}

export default Sidebar