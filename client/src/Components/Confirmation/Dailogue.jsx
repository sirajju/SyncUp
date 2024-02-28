import React, { useEffect, useState } from 'react';
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
import './Dailogue.css'

const App = React.memo(
    function ({ blockOutSideClick,okBtnText,okBtnDisabled,noBtnText,value, func, title, content, posFunc,children,params,negFunc}) {
        const toggleOpen = () => func(!value);
        return (
            <>
                <MDBModal staticBackdrop={blockOutSideClick} tabIndex='-1' open={value} setOpen={func}>
                    <MDBModalDialog size='sm' centered>
                        <MDBModalContent>
                            <MDBModalHeader>
                                <span style={{ width: '100%', textAlign: 'center' }} ><MDBModalTitle> {title} </MDBModalTitle></span>
                                <MDBBtn className='btn-close' color='none' onClick={toggleOpen}></MDBBtn>
                            </MDBModalHeader>
                            <MDBModalBody>
                                <p className='text-center' >
                                    {content}
                                    {children}
                                </p>
                            </MDBModalBody>
                            <MDBModalFooter>
                                <MDBBtn style={{ background: '#5961F9', color: 'white' }} onClick={negFunc || toggleOpen}>
                                    {noBtnText || 'No'}
                                </MDBBtn>
                                <MDBBtn disabled={okBtnDisabled || false} onClick={(e)=>posFunc(params || e)} style={{ background: '#ED80FD' }} >{okBtnText || 'Yes'}</MDBBtn>
                            </MDBModalFooter>
                        </MDBModalContent>
                    </MDBModalDialog>
                </MDBModal>
            </>
        );
    }
)
export default App