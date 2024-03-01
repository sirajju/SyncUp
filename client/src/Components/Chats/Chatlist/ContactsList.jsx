import React, { useState, useEffect } from 'react';
import Axios from '../../../interceptors/axios'
import {
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
} from 'mdb-react-ui-kit';
import { useSelector } from 'react-redux';
import follow from '../../../assets/Images/follow.png'
import message from '../../../assets/Images/message.png'
import pending from '../../../assets/Images/pending.png'
import businessBadge from '../../../assets/Images/verified.png'

export default function App({ contactsModal, openContactsModal,setChat }) {
  const [data, setData] = useState([])
  const [isLoading, setLoading] = useState(true)
  useEffect(() => {
    const options = {
      route: "getContacts",
      headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
      crypto: true
    }
    Axios(options).then(res => {
      if (res.data.success) {
        setData(res.data.body)
        setLoading(false)
      }
    })
  }, [])
  return (
    <>
      <MDBModal animationDirection='bottom' open={contactsModal} setOpen={openContactsModal} tabIndex='-1'>
        <MDBModalDialog centered>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle className='text-center w-100' >New chat</MDBModalTitle>
              <MDBBtn
                className='btn-close'
                color='none'
                onClick={() => openContactsModal(!contactsModal)}
              ></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <div className="contactsListParent">
                {isLoading && <div className='subLoader'> <span className="subLoaderSpinner" ></span> </div>}
                {Boolean(!data.length && !isLoading) && <h1>No contacts found !!</h1>}
                {Boolean(data.length && !isLoading) && data.map(el => (
                  <div className="chatlistItem contactItem">
                    <img src={el.contactData.avatar_url} className='chatIcon' alt="sd" />
                    <div className="chatDetails">
                      <div className="userContent">
                        <h5 className='userName' style={{ textTransform: 'capitalize' }}>
                          {(el.contactData.username.length > 10 ? el.contactData.username.slice(0, 10) + '...' : el.contactData.username)} {el?.contactData.isPremium && <span title='Premium member' className="badge rounded-pill d-inline premiumBadge">Premium</span>} {el.contactData.isBusiness && <img src={businessBadge} className='businessBadge'></img>}
                        </h5>
                        <p className="lastMessage">
                          Message to your contacts
                        </p>
                      </div>
                      <div className="followRqstDiv">
                        <button className="sendFrndRqst"  onClick={()=>{openContactsModal(!contactsModal);setChat({type:"chat",data:el.contactData._id})}}  >
                          <img style={{ 'width': '20px' }} src={message} alt="" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );
}