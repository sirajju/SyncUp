import React, { useEffect, useState } from 'react'
import ListBox from '../ListBox/ListBox'
import axios from '../../../interceptors/axios'
import { useNavigate } from 'react-router-dom'
import editIcon from '../../../assets/Images/edit.png'
import viewIcon from '../../../assets/Images/view.png'


function Ads() {
    const th = ['Image', 'Name', 'Title', 'Redirect URL', 'Unlisted', , 'Created At', 'Actions']
    const sortList = ['Name', 'Unlisted', 'Listed']
    const [adsData, setAdsData] = useState([])
    const [prog, setProg] = useState(false)
    const navigate = useNavigate()
    useEffect(() => {
        const token = localStorage.getItem('SyncUp_AdminToken')
        if (token) {
            setProg(true)
            const options = {
                route: 'admin/isAlive',
                params: { getData: true, ref: 'Ads' },
                headers: { Authorization: `Bearer ${token}` },
                crypto: true
            }
            axios(options).then(res => {
                if (res.data.success) {
                    setAdsData(res.data.body)
                    setProg(false)
                } else {
                    setProg(false)
                    localStorage.removeItem('SyncUp_AdminToken')
                    navigate('/admin')
                }
            })
        }
    }, [])
    return (
        <ListBox prog={prog} btnText={'New ad'} btnRedirect={'/admin/ads/new'} sortList={sortList} active='Advertisments' th={th}>
            {!prog && adsData.map((el, ind) => {
                return (
                    <tr className='text-center'>
                        <td>{ind + 1}</td>
                        <td> <img src={el.image_url} alt="" style={{ width: "30px" }} /> </td>
                        <td>{el.name}</td>
                        <td>{el.title.slice(0, 5)}..{el.title.slice(el.title.length - 3, el.title.length)}</td>
                        <td>{el.redirect_url.slice(8, 12)}..{el.redirect_url.slice(el.redirect_url.length - 7, el.redirect_url.length)}</td>
                        <td>{el.isUnlisted ? "Yes" : "No"}</td>
                        <td>{new Date(el.createdAt).toDateString().substring(0, 10)}</td>
                        <td style={{ display: "flex" }}>
                            <button className="btnSearch btnNew" style={{ width: "50px" }}><img style={{ width: "20px" }} src={editIcon}></img></button>
                            <button className="btnSearch" style={{ width: "50px" }}><img style={{ width: "20px" }} src={viewIcon}></img></button>
                        </td>
                    </tr>
                )
            })}
        </ListBox>
    )
}

export default Ads