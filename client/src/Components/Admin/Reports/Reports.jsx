import { useEffect, useState } from "react"
import ListBox from "../ListBox/ListBox"
import Axios from "../../../interceptors/axios"
import viewIcon from '../../../assets/Images/view.png'
import rejectIcon from '../../../assets/Images/reject.png'
import forwardIcon from '../../../assets/Images/forward.png'


export default function () {
    const th = ['Type','Username', 'Reason', 'Date', 'Rep-By', 'Rejected', 'Resolved', 'Actions']
    const sortList = ['Rejected', 'Resolved']
    const [reports, setReports] = useState([])
    const [prog, setProg] = useState(false)
    useEffect(() => {
        setProg(true)
        const options = {
            route: "admin/getReports",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_AdminToken')}` },
            crypto: true,
        }
        Axios(options).then(res => {
            setReports(res.data.body)
            setProg(false)
        })
    }, [])
    return (
        <ListBox prog={prog} active='Reports' sortList={sortList} th={th}>
            {reports.map((el, ind) => (
                <tr className="text-center" >
                    <td><img width={'30'} style={{ borderRadius: "10px" }} src={el.userData.avatar_url} alt="" /></td>
                    <td>{el.type}</td>
                    <td>{el.userData.username}</td>
                    <td>{el.reason?el.reason.substring(0,15)+'...' : 'null'}</td>
                    <td>{el.reportedAtString}</td>
                    <td>
                        <button title="View reported user" style={{ width: "50px" }} className="btnSearch" >
                            <img src={viewIcon} alt="" />
                        </button>
                    </td>
                    <td>{el.isRejected ? "Yes" : "No"}</td>
                    <td>{el.isSolved ? "Yes" : "No"}</td>
                    <td>
                        {!el.isRejected&&<button title="Reject report" style={{ width: "50px" }} className="btnSearch btnNew" >
                            <img src={rejectIcon} alt="" />
                        </button>}
                        <button title="View report" style={{ width: "50px" }} className="btnSearch" >
                            <img src={forwardIcon} alt="" />
                        </button>
                    </td>
                </tr>
            ))}
        </ListBox>
    )
}