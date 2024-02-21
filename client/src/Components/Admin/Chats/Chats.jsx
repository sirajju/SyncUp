import { useEffect, useState } from "react";
import ListBox from "../ListBox/ListBox";
import Axios from "../../../interceptors/axios";
import iconView from '../../../assets/Images/view.png'


export default function () {
    const th = ['Type', 'Participants', 'Persons', 'StartedAt', 'Messages', 'Banned', 'Actions']
    const sortList = ['Username', 'Email', 'Started']
    const [chats, setChats] = useState([])
    const [prog, setProg] = useState(false)
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
            method:"PUT"
        }
        Axios(options).then(res => {
            if (res.data.success) {
                getChats()
            }
        })
    }
    return (
        <ListBox prog={prog} active='Chats' sortList={sortList} th={th}>
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
                            <button onClick={()=>changeBan(el._id)} style={{ width: "fit-content" }} className="btnSearch btnNew">
                                {el.isBanned ? "UnBan" : "Ban"}
                            </button>
                            <button style={{ width: "50px" }} className="btnSearch">
                                <img src={iconView} style={{ width: "15px" }} alt="" />
                            </button>
                        </div>
                    </td>
                </tr>
            ))}
        </ListBox>
    )
}