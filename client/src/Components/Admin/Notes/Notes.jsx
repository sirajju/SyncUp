import React, { useState, useEffect } from 'react';
import '../Dashboard/Dashboard.css';
import './Notes.css';
import { hideLoading, showLoading } from '../../../Context/userContext';
import toast from 'react-hot-toast';
import cryptojs from 'crypto-js';
import { useDispatch } from 'react-redux';
import ListBox from '../ListBox/ListBox';
import editIcon from '../../../assets/Images/edit.png'
import viewIcon from '../../../assets/Images/view.png'
import Axios from '../../../interceptors/axios';
import { MDBIcon } from 'mdb-react-ui-kit'

function Users() {
    const dispatch = useDispatch();
    const [data, setData] = useState([]);
    const [sync, setSync] = useState(0)
    const [prog, setProg] = useState(false)
    useEffect(() => {
        // dispatch(showLoading());
        setProg(true)
        const token = localStorage.getItem('SyncUp_AdminToken');
        if (token) {
            const options = {
                route: '/admin/getNotes',
                headers: { Authorization: `Bearer ${token}` },
                crypto: true
            }
            Axios(options).then(res => {
                if (res.data.success) {
                    setData(res.data.body);
                }
            })
        }
        setTimeout(() => {
            setProg(false)
        }, 500);
    }, [sync]);

    const th = ['Email', 'Username', 'Content', 'Created', 'Expired', 'Time', 'Visibility', 'Actions']
    let sortList = ['Name', 'Blocked', 'Premium', 'Business', 'Chatpoints']

    const deleteNote = function (id) {
        const options = {
            route:"admin/archiveNote"
        }
    }

    return (
        <ListBox th={th} active={'Notes'} sortList={sortList} prog={prog}>
            {!prog && data.map((el, index) => (
                <tr className='text-center' key={index}>
                    <td>
                        <img width={'45'} style={{ borderRadius: "100%" }} src={el.userData.avatar_url} />
                    </td>
                    <td>{el.userData.email}</td>
                    <td>{el.userData.username}</td>
                    <td>{el.content}</td>
                    <td>{el.content.createdAtString ? el.content.createdAtString : new Date(el.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: "2-digit" })}</td>
                    <td> {el.isExpired ? "Yes" :"No"} </td>
                    <td style={{ textWrap: 'nowrap', textOverflow: "ellipsis" }} >{new Date(el.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                    <td>{el.visibility}</td>
                    <td style={{ display: "flex" }}>
                        <button className="btnSearch" style={{ width: "50px" }}><img style={{ width: "20px" }} src={editIcon}></img></button>
                        <button className="btnNew mx-2" disabled={el.isExpired} style={{ width: "50px" }}> <MDBIcon far icon="trash-alt" /> </button>
                    </td>
                </tr>
            ))}
        </ListBox>
    );
}


export default Users;
