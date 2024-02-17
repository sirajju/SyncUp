import React, { useState } from 'react';
import {
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBInput,
} from 'mdb-react-ui-kit';
import Axios from '../../../interceptors/axios'
import toast from 'react-hot-toast';
import { setMyNotes } from '../../../Context/userContext';
import { useDispatch } from 'react-redux';

export default function App({ isOpen, setOpen }) {
  const [note, setNote] = useState({ content: '' })
  const dispatch = useDispatch()
  const handleInput = function (e) {
    setNote({ ...note, content: e.target.value })
  }
  const discardChanges = function () {
    setOpen(false)
    setNote({ content: '' })
  }
  const refreshMyNotes = function () {
    const options = {
        route: "getMyNotes",
        headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
        crypto: true
    }
    Axios(options).then(res => {
        if (res.data.success) {
            dispatch(setMyNotes(res.data.body))
        } else {
            toast.error(res.data.message)
        }
    })
}
  const publishNote = function () {
    if (note.content.length) {
      const options = {
        route: "publishNote",
        payload: { note },
        headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
        crypto: true,
        method: "POST"
      }
      Axios(options).then(res => {
        if (res.data.success) {
          toast.success(res.data.message)
          setOpen(false)
          refreshMyNotes()
        } else {
          toast.error(res.data.message)
        }
      })
    }
    discardChanges()
  }

  return (
    <>
      <MDBModal tabIndex='-1' open={isOpen} setOpen={setOpen}>
        <MDBModalDialog size='sm' centered>
          <MDBModalContent>
            <MDBModalHeader>
              <span style={{ width: '100%', textAlign: 'center' }} ><MDBModalTitle> Create a note </MDBModalTitle></span>
              <MDBBtn className='btn-close' color='none' onClick={discardChanges}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody style={{padding:'20px'}} >
              <MDBInput autoComplete='off' value={note.content} onInput={handleInput} id='form5Example1' label='Content' />
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn style={{ background: '#5961F9', color: 'white' }} onClick={discardChanges}>
                Cancell
              </MDBBtn>
              <MDBBtn style={{ background: '#ED80FD' }} onClick={publishNote} >Publish</MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );
}