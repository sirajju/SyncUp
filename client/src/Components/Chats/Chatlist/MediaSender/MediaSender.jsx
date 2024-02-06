
import { MDBSpinner } from 'mdb-react-ui-kit'
import sendIcon from '../../../../assets/Images/send.png'
import timerIcon from '../../../../assets/Images/timer.png'
import './MediaSender.css'
import { useEffect, useRef, useState } from 'react'
import ConfirmBox from '../../../Confirmation/Dailogue'

export default function ({ file, setMedia, fileInputRef, sendMedia, setCaption,isSending }) {
    const [isBig,setBig]=useState(false)
    const myRef= useRef()
    const [displayConfirm,setConfirm]=useState(false)
    useEffect(()=>{
        const sizeInMb = (file.size / (1024*1024)).toFixed(2);
        setBig(sizeInMb > 2)
        const handleOutSideClick = function(e){
            if(myRef.current && !myRef.current.contains(e.target) &&!fileInputRef.current.contains(e.target) && e.target.id !='imageAdd'  ){
                setConfirm(true)
            }
        }
        document.addEventListener('click',handleOutSideClick)
        return ()=>document.removeEventListener('click',handleOutSideClick)
    },[file])
    const discardChanges = function(){
        setMedia(null)
        setCaption(null)
    }
    return (
        <div className="mediaSenderContainer" onKeyUp={(e)=>{e.key=='Enter'&&sendMedia()}}  ref={myRef}>
            <ConfirmBox value={displayConfirm} title="Think again" content="Do you want to remove added image..?" func={setConfirm} posFunc={discardChanges} />
            <img className='imageToSend' onClick={() => fileInputRef.current.click()} src={file.data} />
            <div className="mediaSenderOptions">
                <p className='text-danger' >{isBig && `Please choose image with lessthan 2Mb size`}</p>
                <input onChange={(e) => setCaption(e.target.value)} type="text" placeholder='Write caption here...' className="captionInput" />
                {!isBig&&<button  onClick={sendMedia}className="btnSendMedia" >
                    <img src={isSending ? timerIcon :sendIcon}alt="" />
                </button>}
            </div>
        </div>
    )
}