
import { MDBSpinner } from 'mdb-react-ui-kit'
import sendIcon from '../../../../assets/Images/send.png'
import timerIcon from '../../../../assets/Images/timer.png'
import './MediaSender.css'

export default function ({ file, setMedia, fileInputRef, sendMedia, setCaption,isSending }) {
    return (
        <div className="mediaSenderContainer">
            <img className='imageToSend' onClick={() => fileInputRef.current.click()} src={file.data} />
            <div className="mediaSenderOptions">
                <input onChange={(e) => setCaption(e.target.value)} type="text" placeholder='Write caption here...' className="captionInput" />
                <button className="btnSendMedia" >
                    <img src={isSending ? timerIcon :sendIcon} onClick={sendMedia} alt="" />
                </button>
            </div>
        </div>
    )
}