import { useEffect, useState } from "react";
import ListBox from "../ListBox/ListBox";
import Axios from "../../../interceptors/axios";
import iconView from '../../../assets/Images/view.png'
import { MDBIcon } from "mdb-react-ui-kit";
import ConfirmBox from '../../Confirmation/Dailogue'
import toast from "react-hot-toast";


export default function () {
    const th = ['Type', 'Participants', 'Persons', 'StartedAt', 'Messages', 'Banned', 'Actions']
    const sortList = ['Username', 'Email', 'Started']
    const [chats, setChats] = useState([])
    const [prog, setProg] = useState(false)
    const [isConfirmed,displayConfirm]=useState(false)
    const [currentConversation,setCurrentConversation]=useState()
    useEffect(() => {
        getChats()
    }, [])
    async function getChats() {
        const options = {
            route: "admin/getChats",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_AdminToken')}` },
            crypto: true
        }
        Axios(options).then(res => {
            if (res.data.success) {
                setChats(res.data.body)
            }
        })
    }
    const changeBan = async (id) => {
        const options = {
            route: "admin/changeConversationBan",
            payload: { chatId: id },
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_AdminToken')}` },
            method: "PUT"
        }
        Axios(options).then(res => {
            if (res.data.success) {
                getChats()
            }
        })
    }
    const resetMessages = function (){
        if(currentConversation){
            const options = {
                route:"admin/resetMessages",
                params:{chatId:currentConversation},
                headers:{Authorization:`Bearer ${localStorage.getItem('SyncUp_AdminToken')}`},
                method:"DELETE"
            }
            Axios(options).then(res=>{
                if(res.data.success){
                    toast.success(res.data.message)
                }
                displayConfirm(false)
            })
        }
    }
    return (
        <ListBox prog={prog} active='Chats' sortList={sortList} th={th}>
            <ConfirmBox func={displayConfirm} value={isConfirmed} posFunc={resetMessages} title="Warning ⚠️ "  content="This action cannot be undone.Do you want to reset Messages of this conversation..?" />
            {chats && chats.map((el, ind) => (
                <tr className="text-center">
                    <td>{ind + 1}</td>
                    <td>{el.type}</td>
                    <td>
                        <button className="btnSearch">
                            View <img src={iconView} style={{ width: "15px" }} alt="" />
                        </button>
                    </td>
                    <td>
                        <div>
                            {el.participantsData[0].email}
                            <br />
                            {el.participantsData[1].email}
                        </div>
                    </td>
                    <td>
                        {el.startedAtString ? el.startedAtString : new Date(el.startedAt).toLocaleDateString('en', { day: '2-digit', month: '2-digit', year: "numeric" })}
                    </td>
                    <td>
                        <button className="btnSearch">
                            <img src={iconView} style={{ width: "15px" }} alt="" /> ({el.messages})
                        </button>
                    </td>
                    <td>{el.isBanned ? "Yes" : "No"}</td>
                    <td>
                        <div style={{ display: "flex" }} >
                            <button title="Change ban state" onClick={() => changeBan(el._id)} style={{ width: "50px" }} className="btnSearch btnNew">
                                {el.isBanned ? <MDBIcon far icon="circle" /> : <MDBIcon fas icon="ban" />}
                            </button>
                            <button style={{ width: "50px" }} onClick={()=>{displayConfirm(true);setCurrentConversation(el._id)}} className="btnSearch">
                                <MDBIcon far icon="trash-alt" />
                            </button>
                        </div>
                    </td>
                </tr>
            ))}
        </ListBox>
    )
}