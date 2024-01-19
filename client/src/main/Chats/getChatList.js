import { useState } from "react"
import Axios from "../../interceptors/axios"

export default async function GetChatList() {
    const options = {
        route:"getCurrentConversations",
        crypto:true,
        headers:{Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}`}
    }
    let a = await Axios(options)
    return a
}
