import axios from 'axios';

export default async function GetChatList() {
    const response = await axios.get(`http://${window.location.hostname}:5000/getCurrentConversations`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}`
        }
    })
    if(response.data.success){
        return response.data.body
    }
    return []
}
