import { useSelector } from 'react-redux'
import './Notes.css'
import likeIcon from '../../assets/Images/like.png'
import likedIcon from '../../assets/Images/liked.png'
import { MDBIcon } from 'mdb-react-ui-kit'
import { useState } from 'react'

export default function Notes() {
    const userData = useSelector(state => state.user)
    const [isLiked, setLiked] = useState(false)
    const changeLike = function (e) {
        setLiked(!isLiked)
    }
    return (
        <div className="notesContainer" data-aos="fade-up" data-aos-duration="700" onDoubleClick={changeLike} >
            <div className="notesListItem">
                <img src={userData.value.avatar_url} alt="" className="notesAvatar" />
                <div className="notesDetails">
                    <h4 className="username">{userData.value.username}</h4>
                    <p className='noteContent' >Hai guyz please help me with this.</p>
                </div>
                <span className='textReply'>Reply</span>
                <div className="notesState">
                    <p className='time' >5:34pm</p>
                    {isLiked ?
                        <MDBIcon onClick={changeLike} far icon="heart text-dark" className='likeBtn' /> :
                        <MDBIcon onClick={changeLike} fas icon="heart text-danger" className='likeBtn' />}
                </div>
            </div>
            <div className="notesListItem">
                <img src={userData.value.avatar_url} alt="" className="notesAvatar" />
                <div className="notesDetails">
                    <h4 className="username">{userData.value.username}</h4>
                    <p className='noteContent' >Hai guyz please help me with this.</p>
                </div>
                <span className='textReply'>Reply</span>
                <div className="notesState">
                    <p className='time' >5:34pm</p>
                    {isLiked ?
                        <MDBIcon onClick={changeLike} far icon="heart text-dark" className='likeBtn' /> :
                        <MDBIcon onClick={changeLike} fas icon="heart text-danger" className='likeBtn' />}
                </div>
            </div>
            <div className="notesListItem">
                <img src={userData.value.avatar_url} alt="" className="notesAvatar" />
                <div className="notesDetails">
                    <h4 className="username">{userData.value.username}</h4>
                    <p className='noteContent' >Hai guyz please help me with this.</p>
                </div>
                <span className='textReply'>Reply</span>
                <div className="notesState">
                    <p className='time' >5:34pm</p>
                    {isLiked ?
                        <MDBIcon onClick={changeLike} far icon="heart text-dark" className='likeBtn' /> :
                        <MDBIcon onClick={changeLike} fas icon="heart text-danger" className='likeBtn' />}
                </div>
            </div>
            <div className="notesListItem">
                <img src={userData.value.avatar_url} alt="" className="notesAvatar" />
                <div className="notesDetails">
                    <h4 className="username">{userData.value.username}</h4>
                    <p className='noteContent' >Hai guyz please help me with this.</p>
                </div>
                <span className='textReply'>Reply</span>
                <div className="notesState">
                    <p className='time' >5:34pm</p>
                    {isLiked ?
                        <MDBIcon onClick={changeLike} far icon="heart text-dark" className='likeBtn' /> :
                        <MDBIcon onClick={changeLike} fas icon="heart text-danger" className='likeBtn' />}
                </div>
            </div>
            <div className="notesListItem">
                <img src={userData.value.avatar_url} alt="" className="notesAvatar" />
                <div className="notesDetails">
                    <h4 className="username">{userData.value.username}</h4>
                    <p className='noteContent' >Hai guyz please help me with this.</p>
                </div>
                <span className='textReply'>Reply</span>
                <div className="notesState">
                    <p className='time' >5:34pm</p>
                    {isLiked ?
                        <MDBIcon onClick={changeLike} far icon="heart text-dark" className='likeBtn' /> :
                        <MDBIcon onClick={changeLike} fas icon="heart text-danger" className='likeBtn' />}
                </div>
            </div>
            <div className="notesListItem">
                <img src={userData.value.avatar_url} alt="" className="notesAvatar" />
                <div className="notesDetails">
                    <h4 className="username">{userData.value.username}</h4>
                    <p className='noteContent' >Hai guyz please help me with this.</p>
                </div>
                <span className='textReply'>Reply</span>
                <div className="notesState">
                    <p className='time' >5:34pm</p>
                    {isLiked ?
                        <MDBIcon onClick={changeLike} far icon="heart text-dark" className='likeBtn' /> :
                        <MDBIcon onClick={changeLike} fas icon="heart text-danger" className='likeBtn' />}
                </div>
            </div>
            <div className="notesListItem">
                <img src={userData.value.avatar_url} alt="" className="notesAvatar" />
                <div className="notesDetails">
                    <h4 className="username">{userData.value.username}</h4>
                    <p className='noteContent' >Hai guyz please help me with this.</p>
                </div>
                <span className='textReply'>Reply</span>
                <div className="notesState">
                    <p className='time' >5:34pm</p>
                    {isLiked ?
                        <MDBIcon onClick={changeLike} far icon="heart text-dark" className='likeBtn' /> :
                        <MDBIcon onClick={changeLike} fas icon="heart text-danger" className='likeBtn' />}
                </div>
            </div>
        </div>
    )
}