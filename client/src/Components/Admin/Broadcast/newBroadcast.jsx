import { useNavigate } from "react-router-dom"
import NewPage from "../NewPage/NewPage"
import { useRef, useState } from "react"
import { Select, Space, Input, Checkbox } from 'antd';
import axios from 'axios'
import toast from 'react-hot-toast'
import Axios from "../../../interceptors/axios";

export default function () {
    const myRef = useRef()
    const navigate = useNavigate()
    const [data, setData] = useState({isPartyEnabled:false})
    const [isSending, setSending] = useState(false)
    const [err, setErr] = useState(null)
    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setData({ ...data, media: e.target.result })
                document.getElementById('adImg').src = e.target.result;
            };
            reader.readAsDataURL(file);

        }
    }
    const handleSubmit = async function (e) {
        let temp=data
        if (temp.media) {
            const formData = new FormData();
            formData.append('file', temp.media);
            formData.append('quality', 'auto:low');
            formData.append('upload_preset', 'syncup_preset');
            // const res = await axios.post('https://api.cloudinary.com/v1_1/drjubxrbt/image/upload', formData).catch(err => toast(err.message))
            const secure_url = 'https://res.cloudinary.com/drjubxrbt/image/upload/v1707419069/p7nrrjarxwpbwk10fq0z.jpg'
            if (secure_url) {
                temp = {...temp,media:secure_url}
            }
        }
        const options = {
            route:"admin/publishBroadcast",
            payload:{data:temp},
            headers:{Authorization:`Bearer ${localStorage.getItem('SyncUp_AdminToken')}`},
            method:"POST"
        }
        Axios(options).then(res=>{
            if(res.data.success){
                toast.success(res.data.message)
            }
        })
    }
    const handleInput = function (e) {
        if (data.contentType) {
            let temp = e.target.value
            if (temp.includes(',')) {
                temp = temp.split(',')
            }else{
                temp = [temp]
            }
            setData({ ...data, [data.type == 'personal' ? "persons" : "exclude"]: temp })
        }
    }
    return (
        <NewPage active={'Announcement'}>
            <div className="createAdContainer">
                <h3 className='m-4'>Create Broadcast</h3>
                <img src="" id='adImg' onClick={() => myRef.current.click()} className="adImageInput m-2" />
                <input onInput={handleImage} ref={myRef} type='file' hidden accept='image/*' />
                <Space className="mt-2" wrap>
                    <Select
                        defaultValue="Content type : "
                        onChange={(e) => setData({ ...data, contentType: e })}
                        style={{
                            width: '63vh',
                        }}
                        options={[
                            {
                                value: 'banned',
                                label: 'Banned',
                            },
                            {
                                value: 'custom',
                                label: 'Custom',
                            },
                        ]}
                    />
                </Space>
                <div className="inputAd">
                    {data.contentType == 'custom' && <Input id='ad_name' onChange={(e) => setData({ ...data, caption: e.target.value })} type="text" placeholder='Enter caption or content' />}
                    <Space className="m-2" wrap>
                        <Select
                            disabled={Boolean(!data.contentType)}
                            defaultValue="Message type : "
                            onChange={(e) => setData({ ...data, type: e })}
                            style={{
                                width: '63vh',
                            }}
                            options={[
                                {
                                    value: 'broadcast',
                                    label: 'Broadcast',
                                    disabled: data.contentType == 'banned'
                                },
                                {
                                    value: 'personal',
                                    label: 'Personal',
                                },
                                {
                                    value: 'excluded',
                                    label: 'Excluded broadcast',
                                    disabled: data.contentType == 'banned'
                                },
                            ]}
                        />
                    </Space>
                    {data.type && data.type != 'broadcast' && <Input onChange={handleInput} type="text" placeholder={`Enter ${data.type == 'personal' ? 'username or email' : "excluded user username or email "} (add multiple using coma) `} />}
                    <div>
                        <label htmlFor="#greetingCheckBox">Enable party popper : </label>
                        <Checkbox onChange={(e) => setData({ ...data, isPartyEnabled: e.target.checked })} id="greetingCheckbox" className="m-2" />
                    </div>
                    <button onClick={handleSubmit} className="submitAd m-2">Send broadcast</button>
                    {err && <p className='text-danger mt-3'>{err}</p>}
                </div>
            </div>
        </NewPage>
    )
}