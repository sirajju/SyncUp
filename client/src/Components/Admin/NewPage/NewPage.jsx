import React, { useState } from 'react'
import Navbar from '../NavBar/Navbar'
import Sidebar from '../Sidebar/Sidebar'
import './NewPage.css'

function NewPage({children,active}) {
    const [open,setOpen]=useState(true)
    return (
        <>
            <Navbar open={open} setOpen={setOpen} />
            <Sidebar active={active}/>
            <div className="newBox">
                <div className="boxAdd">
                    {children}
                </div>
            </div>
        </>
    )
}

export default NewPage