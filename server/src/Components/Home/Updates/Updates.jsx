import React from 'react'
import Banner from '../Banner/Banner'
import mailIcon from '../../../assets/svgIcons/mail.png'
import './Updates.css'

function Updates() {
  return (
    <Banner id='mail' style={{minHeight:"300px",padding:'50px'}} bigText='Get in touch with our latest feature and more' btnOff={true} imgUrl={mailIcon}>
        <div className="mailer">
            <input type="text" placeholder='Enter email' className='emailInput' />
            <button className='btnSubmit'>Submit</button>
        </div>
    </Banner>
  )
}

export default Updates