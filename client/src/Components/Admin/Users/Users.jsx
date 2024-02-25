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
import View from '../View/View';

function Users() {
    const dispatch = useDispatch();
    const [prog, setProg] = useState(false)

    const th = ['Username', 'Email', 'Notes', 'Premium', 'Verified', 'Points', 'Business', 'Block/Unblock', 'Actions']
    let sortList = ['Name', 'Blocked', 'Premium', 'Business', 'Chatpoints']
    const props = {
        setProg,
        prog
    }
    return (
        <ListBox th={th} sortList={sortList} prog={prog}>
            <UsersTableData {...props} />
        </ListBox>
    );
}

export const UsersTableData = function ({ prog, setProg, mainData }) {
    const [data, setData] = useState(mainData || []);
    const [viewData, setViewData] = useState({ type: null, data: null })
    const getUsers = function () {
        const options = {
            route: 'admin/isAlive',
            params: { getData: true, ref: "Users" },
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_AdminToken')}` },
            crypto: true
        }
        Axios(options).then(res => {
            if (res.data.success) {
                setData(res.data.body);
            } else {
                toast.error(res.data.message);
                localStorage.removeItem('SyncUp_AdminToken');
            }
            setProg(false)
        })
    }
    useEffect(() => {
        if (!mainData) {
            setProg(true)
            getUsers()
        }
    }, []);
    const changeBlock = ((email, state) => {
        const token = localStorage.getItem('SyncUp_AdminToken')
        const options = {
            route: "admin/changeBlock",
            payload: { user: email, state },
            headers: { Authorization: `Bearer ${token}` },
            method: "PUT"
        }
        Axios(options).then(res => {
            if (res.data.success) {
                toast.success(res.data.message)
                if (!mainData) {
                    getUsers()
                } else {
                    setData(data.map((el) => {
                        if (el.email == email) {
                            return { ...el, isBlocked: state == 'unblock' ? false : true }
                        }
                        return el
                    }))
                }
            } else {
                toast.error(res.data.message)
            }
        })
    })
    const props = {
        activeTab: "Users",
        setViewData,
        ...viewData,
        prog,
        setProg
    }
    const openView = function(userId){
        const options = {
            route:"admin/getNotesByUserId",
            headers:{Authorization:`Bearer ${localStorage.getItem("SyncUp_AdminToken")}`},
            params:{userId},
            crypto:true
        }
        Axios(options).then(res=>{
            if(res.data.success){
                setViewData({type:"notes",data:res.data.body})
            }
        })
    }
    return (
        <>
            {!viewData.type ?
                !prog && data.map((el, index) => (
                    <tr className='text-center' key={index}>
                        <td>
                            <img width={'35'} style={{ borderRadius: "100%" }} src={el.avatar_url} />
                        </td>
                        <td>{el.username}</td>
                        <td>{el.email.slice(0, 2)}...{el.email.slice(el.email.length - 2, el.email.length)}</td>
                        <td>
                            <button onClick={()=>openView(el._id)} className="btnSearch" style={{ width: "50px" }}>
                                <img src={viewIcon} style={{ width: "15px" }} alt="" />
                            </button>
                        </td>
                        <td>{el.isPremium ? <span class="badge badge-success rounded-pill d-inline premiumBadge">Premium</span> : 'No'}</td>
                        <td>{el.isEmailVerified ? 'Yes' : 'No'}</td>
                        <td>{el.chatpoints}</td>
                        <td>{el.isBusiness ? 'Yes' : 'No'}</td>
                        <td>{<button onClick={() => changeBlock(el.email, el.isBlocked ? 'unblock' : "block")} className={el.isBlocked ? "btnSearch bg-success" : "btnSearch bg-danger"} style={{ width: "70px" }}>{el.isBlocked ? "Unblock" : "Block"}</button>}</td>
                        <td style={{ display: "flex" }}>
                            <button className="btnSearch btnNew" style={{ width: "50px" }}><img style={{ width: "20px" }} src={editIcon}></img></button>
                            <button className="btnSearch" style={{ width: "50px" }}><img style={{ width: "20px" }} src={viewIcon}></img></button>
                        </td>
                    </tr>
                )) : <View {...props} />}
        </>
    )
}

export default Users;
