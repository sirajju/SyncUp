// import React, { useEffect, useState } from 'react'
// import { Carousel, initMDB } from "mdb-ui-kit";
// import './Ads.css'
// import { Link } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// initMDB({ Carousel });

// function Ads() {
//     const ads = useSelector(state=>state.ads)
//     return (
//         <>
//             <div className="adsContainer">
//                 <div id="carouselExampleSlidesOnly" className="carousel slide" data-ride="carousel">
//                     <div className="carousel-inner">
//                         {ads.value.length && ads.value.map((el, ind) => {
//                             return (
//                                 <div key={ind} className={ind == 0 ? "carousel-item active" : "carousel-item"}>
//                                     <Link to={el.redirect_url} target='_blank'>
//                                         <img className="d-block w-100" src={el.image_url} alt="First slide" />
//                                     </Link>
//                                     <div className="carousel-caption bg-light d-none d-md-block">
//                                         <h3>{el.title}</h3>
//                                     </div>
//                                 </div>
//                             )
//                         }) }
//                     </div>
//                 </div>
//             </div>
//             <div className="belowAds cursor-pointer">
//                 <Link to={'/plans'}>
//                     <p style={{ color: 'white' }} >To remove ads continue with <b>Premium 👑</b></p>
//                 </Link>
//             </div>
//         </>
//     )
// }

// export default Ads

import React, { useEffect, useState } from 'react';
import { Carousel } from 'antd';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Ads.css'


const App = ({ chat }) => {
    const ads = useSelector(state => state.ads)
    const [data, setData] = useState([])

    useEffect(() => {
        if (ads.value?.length) {
            setData(ads.value)
        }
    }, [ads, chat])
    return (
        <>
            <Carousel className='adsContainer' autoplaySpeed={3000} dots={false} effect="fade" autoplay>
                {data.length && data.map((el, ind) => {
                    return (
                        <div key={ind}>
                            <Link to={el.redirect_url} target='_blank'>
                                <img className="d-block w-100" src={el.image_url} alt="First slide" />
                            </Link>
                            <div className="carousel-caption bg-light d-none d-md-block">
                                <h3>{el.title}</h3>
                            </div>
                        </div>
                    )
                })}
            </Carousel>
            <div className="belowAds cursor-pointer">
                <Link to={'/plans'}>
                    <p style={{ color: 'white' }} >To remove ads continue with <b>Premium 👑</b></p>
                </Link>
            </div>
        </>
    )
}
export default App;