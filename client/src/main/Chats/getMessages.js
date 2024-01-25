import axios from 'axios';
import toast from 'react-hot-toast';
import Axios from '../../interceptors/axios'

export default async function GetMessages(id) {
    console.log(`Getting messages of ${id}`);
    const options = {
        route:"getConversation",
        params:{recieverId:id},
        headers:{Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}`},
        crypto:true
    }
    const res =  await Axios(options)
    console.log(res);
    return res.data.body
    
}

