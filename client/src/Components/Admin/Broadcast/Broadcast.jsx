import { useEffect, useState } from "react"
import ListBox from "../ListBox/ListBox"
import Axios from "../../../interceptors/axios"
import viewIcon from '../../../assets/Images/view.png'
import rejectIcon from '../../../assets/Images/reject.png'
import forwardIcon from '../../../assets/Images/forward.png'
import { Link } from "react-router-dom"
import { MDBIcon } from "mdb-react-ui-kit"


export default function () {
    const th = ['Type','ContentType','Persons', 'Exclude', 'Content', 'Media', 'ParyPopper','Date']
    const sortList = ['Broadcast', 'Banned','Excluded']
    const [broadcasts, setBroadcasts] = useState([])
    const [prog, setProg] = useState(false)
    useEffect(() => {
        setProg(true)
        const options = {
            route: "admin/getBroadcasts",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_AdminToken')}` },
            crypto: true,
        }
        Axios(options).then(res => {
            setBroadcasts(res.data.body)
            console.log(res.data.body);
            setProg(false)
        })
    }, [])
    return (
        <ListBox btnRedirect={'new'} btnText={'Send new'} prog={prog} active='Announcement' sortList={sortList} th={th}>
        {broadcasts.length && broadcasts.map((el, ind) => {
            return (
                <tr className="text-center" key={ind}>
                    <td>{ind + 1}</td>
                    <td>{el.type}</td>
                    <td>{el.contentType}</td>
                    <td>{el?.persons.toString()}</td>
                    <td>{el?.exclude?.toString() || 'none'}</td>
                    <td style={{ maxWidth: "150px" }}>
                        <div style={{ maxHeight: "30px", overflowY: "auto",overflowX:"hidden" }}>{el.content || 'none'}</div>
                    </td>
                    <td>{el.isMedia ? <Link target="_blank" to={el.mediaConfig?.url}>Click</Link> : 'none'} </td>
                    <td>{el.isConfettiEnabled ? "Yes" : "No"}</td>
                    <td>{el.createdAtString}</td>
                </tr>
            )
        })}
    </ListBox>
    )
}