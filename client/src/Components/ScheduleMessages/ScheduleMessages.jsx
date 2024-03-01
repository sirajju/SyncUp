import React, { useEffect, useState } from 'react';
import Dp from '../../assets/Images/man.png';
import { MDBIcon } from 'mdb-react-ui-kit';
import './ScheduleMessages.css';
import { Dropdown } from 'antd';
import { FloatButton } from 'antd';
import Dailogue from '../Confirmation/Dailogue'
import { Input } from 'antd';
import Axios from '../../interceptors/axios'
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux'
import { markScheduledSent, setScheduledMsgs } from '../../Context/userContext'
import { useSocket } from '../../Context/socketContext';
import Confirmation from '../Confirmation/Dailogue'


function ScheduleMessages({ setGo, setChat, setSubLoading, isSubLoading }) {
    const [isOpen, setOpen] = useState(false)
    const [scheduleData, setSchedule] = useState({ content: '', date: '', time: '', username: "" })
    const [isValidated, setValidated] = useState(false)
    const [isInvalid, setInvalid] = useState(false)
    const scheduledMsg = useSelector(state => state.scheduledMsg)
    const socket = useSocket()
    const [openDltConfirm,setOpenDltConfirm] = useState(false)
    const [data, setData] = useState([])
    const [err, setErr] = useState('')
    const dispatch = useDispatch()
    const getScheduledMsg = function () {
        setSubLoading(true)
        const options = {
            route: "getScheduledMessages",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
            crypto: true
        }
        Axios(options).then(res => {
            if (res.data.success) {
                setSubLoading(false)
                dispatch(setScheduledMsgs(res.data.body))
            }
        })
    }
    useEffect(() => {
        if (scheduledMsg?.value?.length) {
            setData(scheduledMsg.value)
        }
    }, [scheduledMsg])
    useEffect(() => {
        socket.on('scheduledMsgSent', (data) => {
            dispatch(markScheduledSent(data.msg))
        })
    }, [socket])
    
    const handleInputChange = function (e) {
        let data = { ...scheduleData, [e.target.id]: e.target.value }
        if (e.target.id == 'username') {
            const options = {
                route: "checkContactByUsername",
                params: { username: e.target.value },
                headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` }
            }
            Axios(options).then(res => {
                const el = document.querySelector('#username')
                if (res.data.success) {
                    el.classList.remove('invalid')
                    setInvalid(false)
                } else {
                    setInvalid(true)
                    el.classList.add('invalid')
                }
            })
        } else if (e.target.id == 'time') {
            const time = new Date(`2000-01-01T${e.target.value}`);
            data = { ...scheduleData, [e.target.id]: { hours: time.getHours(), minutes: time.getMinutes() } }
        }
        setSchedule(data)
        const validation = Object.values(data).filter(el => {
            if (typeof el == 'string') {
                return el?.trim()
            }
            return el
        }).length
        if (validation == 4) {
            setValidated(true)
        } else {
            setValidated(false)
        }
    }
    const handleSubmit = function () {
        const validation = Object.values(scheduleData)?.filter((el) => {
            if (typeof el == 'string') {
                return el?.trim()
            }
            return el
        })?.length
        if (validation == 4) {
            setErr('')
            const options = {
                route: "scheduleMessage",
                method: "POST",
                payload: { data: scheduleData },
                headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` }
            }
            Axios(options).then(res => {
                if (res.data.success) {
                    getScheduledMsg()
                    toast.success(res.data.message)
                } else {
                    toast.error(res.data.message)
                }
                setOpen(false)
            })
        } else {
            setErr('Please fill everything')
        }
    }
    const dltAllScheduledMsgs = function(){
        dispatch(setScheduledMsgs([]))
        setData([])
        const options = {
            route:"clearScheduledMsgs",
            headers:{Authorization:`Bearer ${localStorage.getItem("SyncUp_Auth_Token")}`},
            method:"DELETE"
        }
        Axios(options).then(res=>{
            if(!res.data.success){
                toast.error(res.data.message)
            }
        })
    }

    const deleteSchedule = function(id){
        const options = {
            route:"deleteScheduledMsg",
            params:{id},
            headers:{Authorization:`Bearer ${localStorage.getItem("SyncUp_Auth_Token")}`},
            method:"DELETE"
        }
        Axios(options).then(res=>{
            if(res.data.success){
                getScheduledMsg()
            }
        })
    }

    const menuItems = [
        {
            label: "Delete all",
            danger: true,
            icon: <MDBIcon far icon="trash-alt" />,
            key:"clearMsgs"
        }
    ];
    const itemFunction = {
        clearMsgs:()=>setOpenDltConfirm(true)
    }
    return (
        <div className='scheduleMsgsPage'>
            <div className="scheduleOptions">
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

            <div className="scheduleMsgParent">
                <FloatButton onClick={() => setOpen(true)} icon={<MDBIcon fas icon="plus" />} badge={'status'} style={{ position: "absolute" }} />
                <Confirmation posFunc={dltAllScheduledMsgs} title='Are you sure ?' content="This action will delete every scheduled messages." value={openDltConfirm} func={setOpenDltConfirm} />
                {isSubLoading && <div className='subLoader'> <span className="subLoaderSpinner" ></span> </div>}
                {Boolean(!isSubLoading && data?.length) ? data.map(el => {
                    return (
                        <div className={`scheduleMsgItem`} >
                            <img src={el.recieverData.avatar_url} className='chatIcon' style={{ maxWidth: "60px" }} />
                            <div className='scheDuleDetails'>
                                <span className='ScheduleContactName' >Send to {el.recieverData.username}</span>
                                <span className='ScheduleMessage' >Message : {el.content}</span>
                                <span className='ScheduleTime' >Time : {new Date(el.scheduledConfig.date).toLocaleDateString('en-GB', { day: "2-digit", month: '2-digit', year: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true })}</span>
                            </div>
                            <div className={`scheduleMsgOptions`}>
                                {!el.isScheduleCompleted ? <MDBIcon className="scheduleDltIcon text-danger" far onClick={()=>deleteSchedule(el._id)} icon="trash-alt" />
                                    : <MDBIcon fas className='scheduleDltIcon text-success' icon="check" />}
                            </div>
                        </div>
                    )
                }) : (!isSubLoading) && <div className='notFoundSchdl'><h3>No messages scheduled</h3></div>}

                <Dailogue okBtnDisabled={!isValidated || isInvalid} okBtnText='Schedule' noBtnText='Cancell' posFunc={handleSubmit} value={isOpen} func={setOpen} title="Schedule message">
                    <div className='newScheduleMsg' >
                        <Input id='username' className={isInvalid && "invalid"} value={scheduleData.username} onChange={handleInputChange} placeholder="Enter recipient username" />
                        <Input id='content' value={scheduleData.content} onChange={handleInputChange} placeholder="Enter message" />
                        <Input id='date' onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} type='date' placeholder="Basic usage" />
                        <Input id='time' onChange={handleInputChange} type='time' placeholder="Basic usage" />
                        <span style={{ color: "red", fontSize: "10px" }} >{err}</span>
                    </div>
                </Dailogue>
            </div>
        </div>
    );
}

export default ScheduleMessages;
