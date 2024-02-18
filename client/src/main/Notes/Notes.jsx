import { useDispatch, useSelector } from 'react-redux'
import './Notes.css'
import likeIcon from '../../assets/Images/like.png'
import likedIcon from '../../assets/Images/liked.png'
import deleteIcon from '../../assets/Images/delete.png'
import { MDBIcon } from 'mdb-react-ui-kit'
import { useEffect, useState } from 'react'
import CreateNote from './CreateNote/CreateNote'
import toast from 'react-hot-toast'
import { setArchived, setExpired, setMyNotes, setNotes } from '../../Context/userContext'
import Axios from '../../interceptors/axios'
import { useSocket } from '../../Context/socketContext'

export default function Notes({ activeTab }) {
    const socket = useSocket()
    const userData = useSelector(state => state.user)
    const notesData = useSelector(state => state.notes)
    const myNotes = useSelector(state => state.myNotes)
    const [isLiked, setLiked] = useState(false)
    const dispatch = useDispatch()
    const [notes, setLocalNotes] = useState([])
    const refreshNotes = function () {
        const options = {
            route: "getNotes",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
            crypto: true
        }
        Axios(options).then(res => {
            if (res.data.success) {
                dispatch(setNotes(res.data.body))
                setLocalNotes(res.data.body)
            } else {
                toast.error(res.data.message)
            }
        })
    }
    const refreshMyNotes = function () {
        const options = {
            route: "getMyNotes",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
            crypto: true
        }
        Axios(options).then(res => {
            if (res.data.success) {
                dispatch(setMyNotes(res.data.body))
                setLocalNotes(res.data.body)
            } else {
                toast.error(res.data.message)
            }
        })
    }
    useEffect(() => {
        if (activeTab == 'My Notes') {
            setLocalNotes(myNotes.value)
            // refreshMyNotes()
        } else {
            setLocalNotes(notesData.value)
            // refreshNotes()
        }
        console.log('Rendering');
    }, [activeTab, myNotes, notesData])
    socket.on('noteDeleted', () => {
        refreshNotes()
    })
    socket.on('newNote', () => {
        refreshNotes()
    })
    const deleteNote = function () {
        const options = {
            route: "deleteNote",
            headers: { Authorization: `Bearer ${localStorage.getItem('SyncUp_Auth_Token')}` },
            method: "DELETE"
        }
        Axios(options).then(res => {
            if (res.data.success) {
                dispatch(setMyNotes(myNotes.value.map(el => ({ ...el, isExpired: true }))))
                toast.success(res.data.message)
            } else {
                toast.error(res.data.message)
            }
        })
    }
    const likeNote = function(noteId){
        const options ={
            route:"likeNote",
            headers:{Authorization:`Bearer ${localStorage.getItem('SyncUp_Auth_Token')}`},
            payload:{noteId},
            method:"PUT"
        }
        Axios(options).then(res=>{
            refreshNotes()
            if(!res.data.success){
                toast.error(res.data.message)
            }
        })
    }
    const unLikeNote = function(noteId){
        const options ={
            route:"unLikeNote",
            headers:{Authorization:`Bearer ${localStorage.getItem('SyncUp_Auth_Token')}`},
            payload:{noteId},
            method:"PUT"
        }
        Axios(options).then(res=>{
            refreshNotes()
            if(!res.data.success){
                toast.error(res.data.message)
            }
        })
    }

    return (
        <div className="notesContainer" data-aos="fade-up" data-aos-duration="700">
            {activeTab == 'My Notes' && <p style={{ width: '100%', textAlign: 'center', color: 'rgb(184, 184, 184)' }} >Note : You cannot publish two notes at a time.</p>}
            {Boolean(activeTab == 'Notes' && notes.length) && notes.map(el => {
                return (
                    <div className="notesListItem" onDoubleClick={()=>el.notes.likes.includes(userData.value._id) ?unLikeNote(el.notes._id):likeNote(el.notes._id)} >
                        <img src={el.userData[0].avatar_url} alt="" className="notesAvatar" />
                        <div className="notesDetails">
                            <h4 className="username">{el.userData[0].username}</h4>
                            <p className='noteContent' >{el.notes.content}</p>
                        </div>
                        <span className='textReply'>Reply</span>
                        <div className="notesState">
                            <p className='time' >{new Date(el.notes.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                            {!el.notes.likes.includes(userData.value._id) ?
                                <MDBIcon onClick={()=>likeNote(el.notes._id)} far icon="heart text-dark" className='likeBtn' /> :
                                <MDBIcon onClick={()=>unLikeNote(el.notes._id)} fas icon="heart text-danger" className='likeBtn' />}
                        </div>
                    </div>
                )
            })}
            {Boolean(activeTab == 'My Notes' && notes.length) && notes.map(el => {
                return (
                    <div className="notesListItem">
                        <img src={userData.value.avatar_url} alt="" className="notesAvatar" />
                        <div className="notesDetails">
                            <h4 className="username">{userData.value.username}</h4>
                            <p className='noteContent' >{el.content}</p>
                        </div>
                        <div className="notesState">
                            <p className='time' >{new Date(el.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                            <p style={{ fontSize: '10px' }}>{el.isExpired ? "Expired" : <img className='btnDelete' onClick={deleteNote} src={deleteIcon} />}</p>
                        </div>
                    </div>
                )
            })}
            {Boolean(!notes.length && (!notesData.value?.length || !myNotes.value.length)) &&
            <div className="notesEmptyContainer">
                <h3>
                    Currenly there is no notes available
                </h3>
            </div>
            }
        </div>
    )
}