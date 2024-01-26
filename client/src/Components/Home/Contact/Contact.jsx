import React from 'react'
import './Contact.css'

function Contact() {
    return (
        <div className="contactContainer" id='contact'>
            <div className="pinkBox">
                <h2>Contact us</h2>
                <p style={{ textAlign: "center" }}>Let us know how we can help you today</p>
                <div className="contact">
                    <input placeholder='Enter name' className='contactInput'/>
                    <input placeholder='Enter email' className='contactInput'/>
                </div>
                    <textarea placeholder='Enter your complaint' className='textArea'/>
                    <button className='btnBuy'>Submit</button>
            </div>
        </div>
    )
}

export default Contact