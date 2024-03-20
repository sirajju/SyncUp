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
import { v4 } from "uuid"
import missedIcon from '../../assets/Images/incoming_red.png'
import outgoingIcon from '../../assets/Images/outgoing.png'
import outgoingAccepted from '../../assets/Images/outgoing_accepted.png'
import acceptedIcon from '../../assets/Images/call_accepted.png'
import Confirmation from '../Confirmation/Dailogue'

export default function ({ setGo, setChat }) {
    const localLogs = useSelector(state => state.callLogs)
    const [logs, setLogs] = useState(localLogs.value)
    const dispatch = useDispatch()
    const userData = useSelector(state => state.user)
    const [isOpened,setOpened]=useState(!userData.value.settingsConfig.save_call_logs)
    useEffect(() => {
        const options = {
            route: "getCallLogs",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
            params: { setRead: true },
            crypto: true
        }
        Axios(options).then(res => {
            if (res.data.success) {
                dispatch(setLocalLog(res.data.body))
                console.log(res.data.body);
                setLogs(res.data.body)
            } else {
                toast.error(res.data.message)
            }
        })
        const eventListener = function(e){
            if(e.key=='Escape'){
                setGo('')
            }
        }
        window.addEventListener('keyup',eventListener)
        return ()=>window.removeEventListener('keyup',eventListener)
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
                <Confirmation value={isOpened} func={setOpened} title='Warning!!' content='You have disabled saving call logs..' posFunc={()=>setGo("Settings")} okBtnText="Change" noBtnText="cancell" />
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
            <div className="text-center callLogParent" data-aos="fade-up" data-aos-duration="700">
                {logs.length ? logs.map(el => (
                    <div className={`callLogItem`}>
                        <img src={el.opponentData.avatar_url} className='chatIcon' style={{maxWidth:"60px"}} />
                        <div className='text-center p-3' style={{ width: '100%',display:"flex",flexDirection:'column' }}>
                            <div>
                                <img className="callStateIndicator" src={el.data.isAccepted ? (el.data.from == userData.value._id ? outgoingAccepted :acceptedIcon) : (el.data.from == userData.value._id ? outgoingIcon : missedIcon)} alt="" />
                                {el.data.from == userData.value._id ? `Outgoing videocall to ${el.opponentData.username}` : (el.data.isAccepted ? `Incoming videocall from ${el.opponentData.username}` : `Missed videocall from ${el.opponentData.username}`)}
                            </div>
                            {el.data.isAccepted && <span className="callDuration" > Duration : {el.data.duration} </span>}
                        </div>
                        <div className="followRqstDiv" style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '10px', fontWeight: 400, margin: '60px 10px 10px 0 ', whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{new Date(parseInt(el.data.createdAt)).getDate() == new Date().getDate() ? (new Date(parseInt(el.data.createdAt)).toLocaleTimeString('en-US', { hour: '2-digit', minute: "2-digit", hour12: true })) : new Date(parseInt(el.data.createdAt)).getDate() == new Date().getDate() - 1 ? "Yesterday" : (new Date(parseInt(el.data.createdAt)).toLocaleDateString())}</span>
                        </div>
                        <img className="logVidCallIcon" onClick={() => setChat({ type: "videoCall", data: { from: userData.value._id, to: el.opponentData._id, conversationName: `CONVERSATION_${v4()}` } })} src={videoCallIcon} alt="" />
                    </div>
                )) : <h3>There is no logs available</h3>}
            </div>
        </>
    )
}