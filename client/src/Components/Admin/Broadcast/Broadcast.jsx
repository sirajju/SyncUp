import { useEffect, useState } from "react"
import ListBox from "../ListBox/ListBox"
import Axios from "../../../interceptors/axios"
import viewIcon from '../../../assets/Images/view.png'
import rejectIcon from '../../../assets/Images/reject.png'
import forwardIcon from '../../../assets/Images/forward.png'


export default function () {
    const th = ['Type','Username', 'Reason', 'Date', 'Rep-By', 'Rejected', 'Resolved', 'Actions']
    const sortList = ['Rejected', 'Resolved']
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
            setProg(false)
        })
    }, [])
    return (
        <ListBox btnRedirect={'new'} btnText={'Send new'} prog={prog} active='Broadcasts' sortList={sortList} th={th}>
           <tr>  
            
           </tr>
        </ListBox>
    )
}