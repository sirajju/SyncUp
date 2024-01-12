import axios from 'axios';
import toast from 'react-hot-toast';

export default async function GetMessages(id) {
    const response = await axios.get(`http://${window.location.hostname}:5000/getConversation?recieverId=${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}`
        }
    }).catch(err => toast.error(err.message));
    if (response.data.success) {
        console.log(response.data)
        return response.data.body || []
    }
}

