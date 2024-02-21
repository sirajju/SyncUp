import { useEffect, useState } from "react"
import Axios from "../../interceptors/axios"
import toast from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import videoCallIcon from '../../assets/Images/videocall.png'
import './CallLog.css'
import { Dropdown } from 'antd';
import deleteIcon from '../../assets/Images/delete.png'
import { MDBIcon } from "mdb-react-ui-kit"
import { resetLogs, setLogs as setLocalLog } from "../../Context/userContext"

export default function ({ setGo, setChat }) {
    const localLogs = useSelector(state => state.callLogs)
    const [logs, setLogs] = useState(localLogs.value)
    const dispatch = useDispatch()
    const userData = useSelector(state => state.user)
    useEffect(() => {
        const options = {
            route: "getCallLogs",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
            params:{setRead:true},
            crypto: true
        }
        Axios(options).then(res => {
            if (res.data.success) {
                dispatch(setLocalLog(res.data.body))
                setLogs(res.data.body)
            } else {
                toast.error(res.data.message)
            }
        })
    }, [])
    const menuItems = [
        {
            label: 'Clear logs',
            key: 'clearLogs',
            icon: <img className='menuIcon' src={deleteIcon} alt='Clear notes' />,
            disabled: !localLogs.value?.length
        }
    ]
    function clearCallLogs() {
        dispatch(resetLogs())
        setLogs([])
        const options = {
            route: "resetCallLogs",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
            method: "DELETE"
        }
        Axios(options).then(res => {
            if (res.data.success) {
                toast.success(res.data.message)
            } else {
                toast.error(res.data.message)
            }
        })
    }
    const itemFunction = {
        'clearLogs': clearCallLogs
    }
    return (
        <>
            <div className="callLogOptions">
                <button onClick={() => setGo('')} >
                    <MDBIcon fas icon="angle-left" />
                </button>
                <button>
                    <Dropdown
                        arrow
                        menu={{
                            items: menuItems,
                            onClick: ({ key }) => itemFunction[key]?.call(),
                        }}
                        trigger={['click']}
                    >
                        <MDBIcon fas icon="bars" />
                    </Dropdown>
                </button>
            </div>
            <div className="text-center callLogParent"  data-aos="fade-up" data-aos-duration="700">
                {logs.length ? logs.map(el => (
                    <div className={`callLogItem ${el.data.isAccepted ? 'acceptedCall' : (el.data.from == userData.value._id ? "outgoingCall" : "incomingCall")} `}>
                        <img src={el.opponentData.avatar_url} className='chatIcon' />
                        <span className='text-center p-3' style={{ width: '100%' }}>{el.data.from == userData.value._id ? `Outgoing videocall to ${el.opponentData.username}` : (el.data.isAccepted ? `Incoming videocall from ${el.opponentData.username}` : `Missed videocall from ${el.opponentData.username}`)}</span>
                        <div className="followRqstDiv" style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '10px', fontWeight: 400, margin: '60px 10px 10px 0 ', whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{new Date(el.data.createdAt).toLocaleTimeString('en-US', { hour: "2-digit", minute: "2-digit", hour12: true })}</span>
                        </div>
                        <img className="logVidCallIcon" onClick={() => setChat({ type: "videoCall", data: { from: userData.value._id, to: el.opponentData._id, conversationName: `CONVERSATION_${userData.value._id}` } })} src={videoCallIcon} alt="" />
                    </div>
                )) : <h3>There is no logs available</h3>}
            </div>
        </>
    )
}