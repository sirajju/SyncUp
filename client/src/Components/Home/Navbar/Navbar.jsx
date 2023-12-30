import React, { useEffect, useState } from 'react';
import { MDBContainer, MDBNavbar, MDBNavbarBrand, MDBNavbarToggler, MDBIcon, MDBNavbarNav, MDBNavbarItem, MDBNavbarLink, MDBCollapse, } from 'mdb-react-ui-kit';
import './Navbar.css'
import { useNavigate } from 'react-router-dom';

export default function App(props) {
    const [openBasic, setOpenBasic] = useState(false);
    const [isScrolling,setScrolling]=useState(false);
    const navigator = useNavigate()
    useEffect(()=>{
        window.addEventListener('scroll',(e)=>{
            if(window.scrollY > 20 ){
                setScrolling(true)
            }else{
                setScrolling(false)
            }
        })
        document.querySelector('.navbar-nav').addEventListener('click',(e)=>{
            if(e.target.className==='nav-link'){
                document.querySelectorAll('.nav-link').forEach(el=>{el.classList.remove('active')})
                e.target.classList.add('active')
            }
        })
    },[])
    
    return (
        <MDBNavbar expand='lg' className='navbar' bgColor={!isScrolling||'light'} style={!isScrolling?{'--mdb-navbar-box-shadow': 0}:{}} sticky >
            <MDBContainer fluid>
                <MDBNavbarBrand className='navbarTitle' href='#'>{props.title || "SyncUp"}</MDBNavbarBrand>
                <MDBNavbarToggler
                    aria-controls='navbarSupportedContent'
                    aria-expanded='false'
                    aria-label='Toggle navigation'
                    onClick={() => setOpenBasic(!openBasic)}
                >
                    <MDBIcon icon='bars' fas />
                </MDBNavbarToggler>
                <MDBCollapse navbar open={openBasic}>
                    <MDBNavbarNav className='mr-auto mb-2 mb-lg-0 justify-content-center'>
                        <MDBNavbarItem>
                            <MDBNavbarLink active aria-current='page' href='#'>
                                Home
                            </MDBNavbarLink>
                        </MDBNavbarItem>
                        <MDBNavbarItem>
                            <MDBNavbarLink href='#premium'>Premium</MDBNavbarLink>
                        </MDBNavbarItem>
                        <MDBNavbarItem>
                            <MDBNavbarLink href='#mail'>Newsletter</MDBNavbarLink>
                        </MDBNavbarItem>
                        <MDBNavbarItem>
                            <MDBNavbarLink href='#contact'>Contact</MDBNavbarLink>
                        </MDBNavbarItem>
                    </MDBNavbarNav>
                    <button onClick={()=>{navigator('/login')}} className='navbarBtn'>Get started</button>
                </MDBCollapse>
            </MDBContainer>
        </MDBNavbar>
    );
}