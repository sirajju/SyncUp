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
} from 'mdb-react-ui-kit';

const App= React.memo(
    function ({value,func,title,content,posFunc}) {
        const toggleOpen = () => func(!value);

        return (
            <>
                <MDBModal tabIndex='-1' open={value} setOpen={func}>
                    <MDBModalDialog size='sm' centered>
                        <MDBModalContent>
                            <MDBModalHeader>
                            <span style={{width:'100%',textAlign:'center'}} ><MDBModalTitle> {title} </MDBModalTitle></span>
                                <MDBBtn className='btn-close' color='none' onClick={toggleOpen}></MDBBtn>
                            </MDBModalHeader>
                            <MDBModalBody>
                                <p className='text-center' >
                                   {content}
                                </p>
                            </MDBModalBody>
                            <MDBModalFooter>
                                <MDBBtn style={{background:'#5961F9',color:'white'}} onClick={toggleOpen}>
                                    No
                                </MDBBtn>
                                <MDBBtn onClick={posFunc} style={{background:'#ED80FD'}} >Yes</MDBBtn>
                            </MDBModalFooter>
                        </MDBModalContent>
                    </MDBModalDialog>
                </MDBModal>
            </>
        );
    }
)
export default App