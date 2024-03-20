import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Switch, Divider } from 'antd'
import './Settings.css'
import { setUserData } from '../../Context/userContext'
import toast from 'react-hot-toast'
import Axios from '../../interceptors/axios'
import Confirmation from '../Confirmation/Dailogue'
import PremiumDailogue from '../Premium/PremiumDailogue'
import List from '../Chats/Chatlist/ContactsList'
import trashedIcon from '../../assets/Images/trash.png'

function Settings({ setGo }) {
    const userData = useSelector(state => state.user)
    const [confirm, setConfirm] = useState(false)
    const [isPremiumOpen, setPremiumOpen] = useState(false)
    const [premiumData, setPremiumData] = useState(null)
    const [modalDetails, setModalDetails] = useState({})
    const dispatch = useDispatch()
    const [isListOpen, setListOpen] = useState(false)
    const toggleData = (data) => {
        dispatch(setUserData({ ...userData.value, settingsConfig: { ...userData.value.settingsConfig, ...data } }))
        const options = {
            route: "saveConfig",
            payload: { ...data },
            method: "PUT",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` }
        }
        Axios(options).then(res => {
            if (!res.data.success) {
                toast.error(res.data.message)
            }
        })
        if (confirm) {
            setConfirm(false)
        }
    }

    const unBlockUser = function () {
        toast("unblcok")
    }

    useEffect(() => {
        if (userData.value.isPremium) {
            const options = {
                route: "getPremiumDetails",
                headers: { Authorization: `Bearer ${localStorage.getItem("SyncUp_Auth_Token")}` },
                crypto: true
            }
            Axios(options).then(res => {
                if (res.data.success) {
                    setPremiumData(res.data.body)
                } else {
                    toast.error(res.data.message)
                }
            })
        }
    }, [])

    return (
        <div className='settingsParent'>
            {isListOpen && <List contactsModal={isListOpen} icon={modalDetails.icon} onClick={modalDetails.onClick} openContactsModal={setListOpen} modalTitle={modalDetails.title} route={modalDetails.route} />}
            <PremiumDailogue isModalOpen={isPremiumOpen} setIsModalOpen={setPremiumOpen} />
            <Confirmation value={confirm} title={modalDetails.title} content={modalDetails.content} posFunc={modalDetails.posFunc} func={setConfirm} />
            <button className="closeBtn" onClick={() => { setGo(false) }}> <span>&times;</span> </button>
            <div className='settingsItem mt-5' onClick={
                () => {
                    userData.value.settingsConfig.allow_msg_from_everyone
                    ? toggleData({ allow_msg_from_everyone: !userData.value.settingsConfig.allow_msg_from_everyone })
                    :
                    setModalDetails({ title: "Are you sure ?", posFunc: () => toggleData({ allow_msg_from_everyone: !userData.value.settingsConfig.allow_msg_from_everyone }), content: "This action will allow unknown users to call or text you... " });
                    setConfirm(true)
                }} >
                <span>Allow messages from unknown users : </span>
                <Switch
                    checkedChildren={'YES'}
                    unCheckedChildren={'No'}
                    value={userData.value.settingsConfig.allow_msg_from_everyone}
                // onClick={toggleAfk}
                />
            </div>
            <div className='settingsItem' onClick={userData.value.blockedContacts.length ? () => { setModalDetails({ title: "Blocked users", icon: trashedIcon, onClick: unBlockUser, route: "getBlockedUsers" }); setListOpen(true) } : () => toast("No blocked users")} >
                <span>Blocked users ({userData.value.blockedContacts.length})  </span>
            </div>
            <div className='settingsItem disabled' title='Coming soon..' >
                <span>Notifications</span>
            </div>
            <Divider plain={true} style={{ width: "300px" }} orientation='left'>Calls</Divider>
            <div className='settingsItem' onClick={() => toggleData({ save_call_logs: !userData.value.settingsConfig.save_call_logs })} >
                <span>Automatically save call logs : </span>
                <Switch
                    checkedChildren={'YES'}
                    unCheckedChildren={'NO'}
                    value={userData.value.settingsConfig.save_call_logs}
                // onClick={toggleAfk}
                />
            </div>
            <div className='settingsItem profilePremiumBadge' onClick={() => { userData.value.isPremium ? toggleData({ blur_video_bg: !userData.value.settingsConfig.blur_video_bg }) : setPremiumOpen(true) }} >
                <span>Blur videocall background : </span>
                <Switch
                    checkedChildren={'YES'}
                    unCheckedChildren={'NO'}
                    value={userData.value.settingsConfig.blur_video_bg}
                // onClick={toggleAfk}
                />
            </div>
            <Divider plain={true} style={{ width: "300px" }} orientation='left'>Appearence</Divider>
            <div  className={`settingsItem  ${userData.value.googleSynced && "disabled"}`} onClick={() => !userData.value.googleSynced&&toggleData({ hide_sync_icon: !userData.value.settingsConfig.hide_sync_icon })} >
                <span>Hide contact sync icon : </span>
                <Switch
                    checkedChildren={'YES'}
                    unCheckedChildren={'NO'}
                    value={userData.value.settingsConfig.hide_sync_icon}
                    disabled={userData.value.googleSynced}
                />
            </div>
            {userData.value.isPremium&&<div className='settingsItem profilePremiumBadge' onClick={() => toggleData({ replace_premium_text: !userData.value.settingsConfig.replace_premium_text })}>
                <span>Replace premium text with name : </span>
                <Switch
                    checkedChildren={'YES'}
                    unCheckedChildren={'NO'}
                    value={userData.value.settingsConfig.replace_premium_text}
                // onClick={toggleAfk}
                />
            </div>}
            {userData.value.isPremium && <> <Divider plain={true} style={{ width: "300px" }} orientation='left'>Payment</Divider>
                <div className='settingsItem' onClick={premiumData?.type ? ()=>{setModalDetails({title:"Your premium plan",content:<PremiumPlan premiumData={premiumData} />,posFunc:toggleData});setConfirm(true)} : ()=>toast('Loading..')} >
                    <span>Premium plan</span>
                    {
                        !premiumData && <span className='text-success small'>Active</span>
                    }
                    {
                        (premiumData && premiumData.expiresAt == 0) && <span className='text-success small'>Lifetime</span>
                    }
                    {
                        (premiumData && premiumData.expiresAt != 0) && <span className='text-success small'>Expires at {premiumData.expiresAtString ? premiumData.expiresAtString : new Date(premiumData.expiresAt).toLocaleDateString('en-GB', { day: "2-digit", month: "short", year: "numeric" })}</span>
                    }
                </div> </>}
        </div>
    )
}

const PremiumPlan = ({premiumData})=>{

    const copyToClipboard = (text)=>{
        navigator.clipboard.writeText(premiumData.paymentSessionId).then(()=>{
            toast.success('Copied to clipboard')
        })
    }

    return (
        <div className="premiumPlanContainer">
            <p><span>Type :</span> {premiumData.type.toUpperCase()}</p>
            <p><span>Price :</span> {premiumData.paymentType=='chatpoints' ? premiumData.price+'pts' : "₹"+premiumData.price}</p>
            <p><span>Purchased at :</span> {new Date(premiumData.createdAt).toLocaleDateString('en-GB', { day: "2-digit", month: "short", year: "numeric" })}</p>
            <p><span>Expires at :</span> {premiumData.expiresAtString ? premiumData.expiresAtString : new Date(premiumData.expiresAt).toLocaleDateString('en-GB', { day: "2-digit", month: "short", year: "numeric" })}</p>
            <p><span>Payment type :</span> {premiumData.paymentType}</p>
            <p><span>Payment id :</span> <code onClick={copyToClipboard} style={{cursor:"pointer"}} >Copy</code></p>
        </div>
    )
}

export default Settings