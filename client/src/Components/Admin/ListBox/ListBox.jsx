import React, { useState } from 'react'
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../NavBar/Navbar';
import './ListBox.css'
import { useNavigate } from 'react-router-dom';
import { MDBIcon } from 'mdb-react-ui-kit';

function ListBox({ th, children,backButton,backButtonFunction, prog, active, sortList ,btnRedirect,btnText,sortData}) {
    const navigate=useNavigate()
    const [open, setOpen] = useState(true);
    return (
        <div className="dashboardContainer">
            <Navbar open={open} setOpen={setOpen} />
            <Sidebar active={active || 'Users'} />
            <div className="dashboard ">
                <div className="dbDetails usersList" style={{ overflowY: "scroll" }}>
                    <div className="listTop p-3">
                        <div className="search">
                            {backButton&&<button onClick={()=>backButtonFunction(false)} className='btnSearch viewBackButton' ><MDBIcon fas icon="chevron-left" /></button>}
                            <input type="text" className='inputSearch' placeholder='Enter name ' />
                            <button className='btnSearch'>Search</button>
                        </div>
                        <div className="sort" style={{ display: 'flex', 'flexDirection': "row",gap:"10px" }}>
                            <select class="form-select" aria-label="Default select example">
                                <option selected>Sort by :</option>
                                {sortList&&sortList.map(el=>{
                                    return (
                                        <option value={el}>{el}</option>
                                    )
                                })}
                            </select>
                            {btnText&&<button className='btnNew' onClick={()=>navigate(btnRedirect)} >{btnText}</button>}
                        </div>
                    </div>
                    <table className="table table-borderless mt-5">
                        <thead >
                            {prog && <div className='spinner-parent'><span></span></div>}
                            {!prog && <tr className='text-center'>
                                <th scope="col">#</th>
                                {th&&th.map(el => {
                                    return <th scope='col'>{el}</th>
                                })}
                            </tr>}
                        </thead>
                        <tbody>
                            {children}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ListBox