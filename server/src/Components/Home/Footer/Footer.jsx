import React from 'react'
import './Footer.css'

function Footer() {
    const s1 = ['Home', 'Pricing', 'News', 'Contact']
    const s2 = ['How to login ?', 'Can i get premium for free ?', 'How to invite relatives', 'Can anyone see your messages']
    const s3 = ['+918743873492', 'test@gmail.com', '673043,', 'Maharastra']
    return (
        <div className="footer">
            <Container type='Platform' options={s1} />
            <Container type='Help' options={s2} />
            <Container type='Contacts' options={s3} />
            <div className="rightContainer">
                <div className="socialMedia">
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.68182 0C3.44647 0 0 3.44647 0 7.68182V18.3182C0 22.5535 3.44647 26 7.68182 26H18.3182C22.5535 26 26 22.5535 26 18.3182V7.68182C26 3.44647 22.5535 0 18.3182 0H7.68182ZM7.68182 1.18182H18.3182C21.9147 1.18182 24.8182 4.08526 24.8182 7.68182V18.3182C24.8182 21.9147 21.9147 24.8182 18.3182 24.8182H7.68182C4.08526 24.8182 1.18182 21.9147 1.18182 18.3182V7.68182C1.18182 4.08526 4.08526 1.18182 7.68182 1.18182ZM20.0909 4.72727C19.7775 4.72727 19.4769 4.85179 19.2552 5.07342C19.0336 5.29505 18.9091 5.59565 18.9091 5.90909C18.9091 6.22253 19.0336 6.52313 19.2552 6.74476C19.4769 6.9664 19.7775 7.09091 20.0909 7.09091C20.4043 7.09091 20.7049 6.9664 20.9266 6.74476C21.1482 6.52313 21.2727 6.22253 21.2727 5.90909C21.2727 5.59565 21.1482 5.29505 20.9266 5.07342C20.7049 4.85179 20.4043 4.72727 20.0909 4.72727ZM13 6.5C9.41715 6.5 6.5 9.41715 6.5 13C6.5 16.5829 9.41715 19.5 13 19.5C16.5829 19.5 19.5 16.5829 19.5 13C19.5 9.41715 16.5829 6.5 13 6.5ZM13 7.68182C15.9441 7.68182 18.3182 10.0559 18.3182 13C18.3182 15.9441 15.9441 18.3182 13 18.3182C10.0559 18.3182 7.68182 15.9441 7.68182 13C7.68182 10.0559 10.0559 7.68182 13 7.68182Z" fill="#FFFDFD" />
                    </svg>
                    <svg width="34" height="32" viewBox="0 0 34 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.6909 3C9.18031 3 3.09091 8.7312 3.09091 15.8C3.09091 21.7979 7.47918 26.8165 13.3952 28.2053C13.3317 28.0325 13.2909 27.832 13.2909 27.5835V25.3957C12.739 25.3957 11.8142 25.3957 11.5818 25.3957C10.6514 25.3957 9.82405 25.0192 9.42284 24.3195C8.97745 23.5419 8.90038 22.3525 7.79651 21.6251C7.46898 21.3829 7.71831 21.1067 8.09571 21.144C8.79271 21.3296 9.37071 21.7797 9.91471 22.4475C10.4564 23.1163 10.7114 23.2677 11.7235 23.2677C12.2142 23.2677 12.9486 23.2411 13.64 23.1387C14.0117 22.2501 14.6543 21.432 15.4397 21.0459C10.9109 20.6075 8.74965 18.4869 8.74965 15.608C8.74965 14.3685 9.31065 13.1696 10.2638 12.1595C9.95098 11.1568 9.55771 9.112 10.3839 8.33333C12.4216 8.33333 13.6536 9.57707 13.9494 9.91307C14.9648 9.5856 16.08 9.4 17.2519 9.4C18.426 9.4 19.5458 9.5856 20.5635 9.9152C20.8559 9.58133 22.089 8.33333 24.1312 8.33333C24.9608 9.11307 24.563 11.1664 24.2468 12.1669C25.1943 13.1749 25.7519 14.3707 25.7519 15.608C25.7519 18.4848 23.594 20.6043 19.072 21.0448C20.3164 21.656 21.2242 23.3733 21.2242 24.6672V27.5835C21.2242 27.6944 21.1982 27.7744 21.1846 27.8693C26.484 26.1211 30.2909 21.3851 30.2909 15.8C30.2909 8.7312 24.2015 3 16.6909 3Z" fill="white" />
                    </svg>
                    <svg width="33" height="29" viewBox="0 0 33 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M27.06 2.32007H5.94C4.1184 2.32007 2.64 3.61927 2.64 5.22007V23.7801C2.64 25.3809 4.1184 26.6801 5.94 26.6801H27.06C28.8816 26.6801 30.36 25.3809 30.36 23.7801V5.22007C30.36 3.61927 28.8816 2.32007 27.06 2.32007ZM11.22 11.6001V22.6201H7.26V11.6001H11.22ZM7.26 8.39267C7.26 7.58067 8.052 6.96007 9.24 6.96007C10.428 6.96007 11.1738 7.58067 11.22 8.39267C11.22 9.20467 10.4808 9.86007 9.24 9.86007C8.052 9.86007 7.26 9.20467 7.26 8.39267ZM25.74 22.6201H21.78C21.78 22.6201 21.78 17.2493 21.78 16.8201C21.78 15.6601 21.12 14.5001 19.47 14.4769H19.4172C17.82 14.4769 17.16 15.6717 17.16 16.8201C17.16 17.3479 17.16 22.6201 17.16 22.6201H13.2V11.6001H17.16V13.0849C17.16 13.0849 18.4338 11.6001 20.9946 11.6001C23.6148 11.6001 25.74 13.1835 25.74 16.3909V22.6201Z" fill="white" />
                    </svg>
                    <br />
                    © Copyright SyncUp. <br /> All Rights Reserved
                </div>
                <a href="#"> <img src="https://i.imgur.com/RHPpJ24.png" alt="" className="goTop"/></a>
            </div>
        </div>
    )
}
const Container = function (props) {
    return (
        <div className="subContainer">
            <ul>
                <li><h5>{props.type}</h5></li>
                {props.options?.map(el => {
                    return (
                        <>
                            <li>{el}</li>
                        </>
                    )
                })}
            </ul>
            {props.children}
        </div>
    )
}
export default Footer