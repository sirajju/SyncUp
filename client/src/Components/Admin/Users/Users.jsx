import React, { useState, useEffect } from 'react';
import '../Dashboard/Dashboard.css';
import './Users.css';
import { hideLoading, showLoading } from '../../../Context/userContext';
import toast from 'react-hot-toast';
import cryptojs from 'crypto-js';
import { useDispatch } from 'react-redux';
import ListBox from '../ListBox/ListBox';
import editIcon from '../../../assets/Images/edit.png'
import viewIcon from '../../../assets/Images/view.png'
import Axios from '../../../interceptors/axios';

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
                route: 'admin/isAlive',
                params: { getData: true, ref: "Users" },
                headers: { Authorization: `Bearer ${token}` },
                crypto: true
            }
            Axios(options).then(res => {
                if (res.data.success) {
                    setData(res.data.body);
                } else {
                    toast.error(res.data.message);
                    localStorage.removeItem('SyncUp_AdminToken');
                }
            })
        }
        setTimeout(() => {
            // dispatch(hideLoading());
            setProg(false)
        }, 500);
    }, [sync]);

    const th = ['Username', 'Email', 'Premium', 'Verified', 'Points', 'Business', 'Block/Unblock', 'Actions']
    let sortList = ['Name', 'Blocked', 'Premium', 'Business', 'Chatpoints']
    return (
        <ListBox th={th} sortList={sortList} prog={prog}>
            {!prog && data.map((el, index) => (
                <tr className='text-center' key={index}>
                    <td>
                        <img width={'25'} style={{ borderRadius: "10px" }} src={el.avatar_url} />
                    </td>
                    <td>{el.username}</td>
                    <td>{el.email.slice(0, 2)}...{el.email.slice(el.email.length - 2, el.email.length)}</td>
                    <td>{el.isPremium ? <span class="badge badge-success rounded-pill d-inline premiumBadge">Premium</span> : 'No'}</td>
                    <td>{el.isEmailVerified ? 'Yes' : 'No'}</td>
                    <td>{el.chatpoints}</td>
                    <td>{el.isBusiness ? 'Yes' : 'No'}</td>
                    <td>{<button onClick={() => changeBlock(el.email, el.isBlocked ? 'unblock' : "block", setSync)} className={el.isBlocked ? "btnSearch bg-success" : "btnSearch bg-danger"} style={{ width: "70px" }}>{el.isBlocked ? "Unblock" : "Block"}</button>}</td>
                    <td style={{ display: "flex" }}>
                        <button className="btnSearch btnNew" style={{ width: "50px" }}><img style={{ width: "20px" }} src={editIcon}></img></button>
                        <button className="btnSearch" style={{ width: "50px" }}><img style={{ width: "20px" }} src={viewIcon}></img></button>
                    </td>
                </tr>
            ))}
        </ListBox>
    );
}

const changeBlock = ((email, state, func) => {
    const token = localStorage.getItem('SyncUp_AdminToken')
    const options = {
        route: "admin/changeBlock",
        params: { user: email, state },
        headers: { Authorization: `Bearer ${token}` }
    }
    Axios(options, res => {
        if (res.data.success) {
            toast.success(res.data.message)
        } else {
            toast.error(res.data.message)
        }
    })
    func(Math.floor(Math.random() * 100))
})

export default Users;
