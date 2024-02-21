import { useEffect, useState } from "react"
import Axios from "../../interceptors/axios"
import toast from "react-hot-toast"
import { useSelector } from "react-redux"
import videoCallIcon from '../../assets/Images/videocall.png'
import './CallLog.css'

export default function ({ setGo, setChat }) {
    const [logs, setLogs] = useState([])
    const userData = useSelector(state => state.user)
    useEffect(() => {
        const options = {
            route: "getCallLogs",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
            crypto: true
        }
        Axios(options).then(res => {
            if (res.data.success) {
                setLogs(res.data.body)
            } else {
                toast.error(res.data.message)
            }
        })
        document.addEventListener('keyup', () => {
            setGo('')
        })
    }, [])
    return (
        <div data-aos="fade-down" data-aos-duration="700" className="callLogParent">
            {logs.map(el => (
                <div className={`callLogItem ${el.data.isAccepted ? 'acceptedCall' : (el.data.from == userData.value._id ? "outgoingCall" : "incomingCall")} `}>
                    <img src={el.opponentData.avatar_url} className='chatIcon' />
                    <span className='text-center p-3' style={{ width: '100%' }}>{el.data.from == userData.value._id ? `Outgoing videocall to ${el.opponentData.username}` : (el.data.isAccepted ? `Incoming videocall from ${el.opponentData.username}` : `Missed videocall from ${el.opponentData.username}`)}</span>
                    <div className="followRqstDiv" style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '10px', fontWeight: 400, margin: '60px 10px 10px 0 ', whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{new Date(el.data.createdAt).toLocaleTimeString('en-US', { hour: "2-digit", minute: "2-digit", hour12: true })}</span>
                    </div>
                    <img className="logVidCallIcon" src={videoCallIcon} alt="" />
                </div>
            ))}

        </div>
    )
}