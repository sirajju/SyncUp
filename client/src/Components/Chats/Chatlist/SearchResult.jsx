import React from 'react'
import { useSelector } from 'react-redux';
import follow from '../../../assets/Images/follow.png'
import message from '../../../assets/Images/message.png'
import pending from '../../../assets/Images/pending.png'
import businessBadge from '../../../assets/Images/verified.png'

function SearchResult({searchResult,addToContact,checkCondact,cancellRequest,copyLink,setChat,setSearchData}) {
    const userData = useSelector(state=>state.user)
    return (
        searchResult.map(el => {
            return (
                <div className="chatlistItem">

                    <img src={el.avatar_url} className='chatIcon' alt="" />
                    <div className="chatDetails">
                        <div className="userContent">
                            <h5 className='userName' style={{ textTransform: 'capitalize' }}>
                                {userData.value._id == el._id ? `${el.username} (You)` : el.username} {el?.isPremium && <sup title='Premium member' className="badge rounded-pill d-inline premiumBadge">Premium</sup>} {el.isBusiness && <img src={businessBadge} className='businessBadge'></img>}
                            </h5>
                            <p className="lastMessage">
                                {(() => {
                                    const rs = checkCondact(el._id);
                                    if (rs == 'Pending') {
                                        return "Request is not accepted yet"
                                    } else if (rs == 'Accepted') {
                                        if (el._id == userData.value._id) {
                                            return "Message yourself"
                                        }
                                        return "Message to your contacts"
                                    } else if (rs == 404) {
                                        return "Not found , Invite to get chat points"
                                    }
                                    else {
                                        return "Send friend request to message"
                                    }
                                })()}
                            </p>
                        </div>
                        <div className="followRqstDiv">
                            {(() => {
                                const rs = checkCondact(el._id);
                                if (rs == 'Pending') {
                                    return (
                                        <button onClick={() => cancellRequest(el._id)} className="sendFrndRqst">
                                            <img style={{ 'width': '20px' }} src={pending} alt="" />
                                        </button>
                                    );
                                } else if (rs == 'Accepted') {
                                    return (
                                        <button onClick={() =>{ setChat({ type: 'chat', data: el._id });setSearchData([])}} className="sendFrndRqst">
                                            <img style={{ 'width': '20px' }} src={message} alt="" />
                                        </button>
                                    );
                                }
                                else if (rs == 404) {
                                    return <button className='btnStart' onClick={() => copyLink(el.username)} style={{ width: '80px', margin: '7px', height: '35px' }} >Invite</button>

                                }
                                else {
                                    return (
                                        <button onClick={() => addToContact(el._id)} className="sendFrndRqst">
                                            <img style={{ 'width': '20px' }} src={follow} alt="" />
                                        </button>
                                    );
                                }
                            })()}
                        </div>
                    </div>
                </div>
            );

        })
    )
}

export default SearchResult