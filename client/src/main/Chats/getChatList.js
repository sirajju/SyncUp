import { useState } from "react"
import Axios from "../../interceptors/axios"

export default async function GetChatList(from) {
    console.log(`from ${from}`)
    const options = {
        route:"getCurrentConversations",
        crypto:true,
        headers:{Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}`}
    }
    let res = await Axios(options)
    return res.data.body
}
