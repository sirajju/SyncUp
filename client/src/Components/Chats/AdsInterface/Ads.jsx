import React, { useEffect, useState } from 'react'
import { Carousel, initMDB } from "mdb-ui-kit";
import './Ads.css'
import axios from 'axios';
import crypto from 'crypto-js'
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
initMDB({ Carousel });

function Ads() {
    const [ads, setAds] = useState([])
    useEffect(() => {
        const token = localStorage.getItem('SyncUp_Auth_Token')
        if (token) {
            axios.get(`http://${window.location.hostname}:5000/getAds`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(res => {
                if (res.data.success) {
                    const decrypted = crypto.AES.decrypt(res.data.body, 'syncupservercryptokey').toString(crypto.enc.Utf8)
                    setAds(JSON.parse(decrypted))
                } else {
                    toast.error(res.data.message)
                }
            })
        }
    }, [])
    return (
        <>
            <div className="adsContainer">
                <div id="carouselExampleSlidesOnly" className="carousel slide" data-ride="carousel">
                    <div className="carousel-inner">
                        {ads && ads.map((el, ind) => {
                            return (
                                <div key={ind} className={ind == 0 ? "carousel-item active" : "carousel-item"}>
                                    <Link to={el.redirect_url} target='_blank'>
                                        <img className="d-block w-100" src={el.image_url} alt="First slide" />
                                    </Link>
                                    <div className="carousel-caption bg-light d-none d-md-block">
                                        <h3>{el.title}</h3>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <div className="belowAds">
                <p>To remove ads continue with <b>Premium 👑</b></p>
            </div>
        </>
    )
}

export default Ads