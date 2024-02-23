import { useNavigate } from "react-router-dom"
import NewPage from "../NewPage/NewPage"
import { useRef, useState } from "react"

export default function () {
    const myRef = useRef()
    const navigate = useNavigate()
    const [adData, setAdData] = useState({})
    const [err, setErr] = useState(null)
    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAdData({ ...adData, img: e.target.result })
                document.getElementById('adImg').src = e.target.result;
            };
            reader.readAsDataURL(file);

        }
    }
    return (
        <NewPage>
            <div className="createAdContainer">
                <h3 className='m-4'>Create Broadcast</h3>
                <img src="" id='adImg' onClick={() => myRef.current.click()} className="adImageInput" />
                <input onInput={handleImage} ref={myRef} type='file' hidden accept='image/*' />
                <div className="inputAd mt-3">
                    <input id='ad_name' type="text" placeholder='Enter caption or content' />
                    <input id='ad_title' type="text" placeholder='Enter title' />
                    <input id='ad_redirect_url' type="text" placeholder='Enter redirect url' />
                    <button className="submitAd">Send broadcast</button>
                    {err && <p className='text-danger mt-3'>{err}</p>}
                </div>
            </div>
        </NewPage>
    )
}