import React from 'react'
import './PremiumPlan.css'
import Box from '../BoxStyle/box'
import { useNavigate } from 'react-router-dom'

function PremiumPlan() {
    const navigate = useNavigate()
    return (
        <div className="planParentDiv cursor-pointer" onClick={()=>navigate('/plans')}>
            <div className="pinkBox">
                <h2>Here are our all plans</h2>
                <p style={{ textAlign: "center" }}>Premium helps you to drive into enormous features</p>
                <div className="plans">
                    <Bigbox planTitle="Monthly" price='399' features={['Ads disabled', 'More privacy', 'More features']} isMonth={true} planDescription="Try our premium with monthly subscription" />
                    <Bigbox planTitle="Lifetime" price='1899' features={['Ads disabled', 'More privacy', 'More features', 'Lifetime']} planDescription="Enjoy premium features for lifetime" />
                </div>
            </div>
        </div>
    )
}
const Bigbox = function (props) {
    const boxStyle = {
        width: "40%",
        textAlign: "center",
        padding: "30px",
        margin: "30px",
        background: "white",
        minHeight: "400px"
    }
    return (
        <Box style={boxStyle}>
            <h3 className="planTitle">{props.planTitle}</h3>
            <p className="planDescription">{props.planDescription}</p>
            <div className="price">
                <h2 style={{ color: "#ED80FD" }}>₹{props.price}<span style={{ color: "black", fontSize: "18px" }}>{props.isMonth ? '/month' : "only"}</span> </h2>
            </div>
            <div className="features mt-4">
                {props.features.map((feature) => {
                    return <h6><RoundedIcon />{feature}</h6>
                })}
            </div>
            <button className="btnBuy">
                Continue
            </button>
        </Box>
    )
}
const RoundedIcon = function () {
    return <span style={{ margin: '5px' }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="6" cy="6" r="6" fill="#39DC98" />
            <g clip-path="url(#clip0_35_7)">
                <path d="M9.99832 3.60011C9.91172 3.60243 9.82952 3.635 9.76915 3.69093L4.6715 8.27882L2.57384 6.39093C2.54312 6.36213 2.50634 6.33915 2.46563 6.32331C2.42492 6.30748 2.38111 6.29911 2.33676 6.2987C2.29241 6.2983 2.24842 6.30586 2.20736 6.32095C2.1663 6.33603 2.129 6.35834 2.09764 6.38657C2.06628 6.41479 2.04149 6.44836 2.02473 6.48531C2.00797 6.52227 1.99957 6.56186 2.00002 6.60177C2.00047 6.64168 2.00976 6.68111 2.02736 6.71775C2.04495 6.75439 2.07049 6.7875 2.10249 6.81515L4.43582 8.91515C4.49833 8.97139 4.58311 9.00298 4.6715 9.00298C4.75989 9.00298 4.84466 8.97139 4.90717 8.91515L10.2405 4.11515C10.2887 4.07301 10.3216 4.01875 10.3349 3.9595C10.3482 3.90024 10.3413 3.83875 10.3152 3.78307C10.289 3.7274 10.2447 3.68014 10.1882 3.64749C10.1316 3.61484 10.0655 3.59832 9.99832 3.60011Z" fill="white" />
            </g>
            <defs>
                <clipPath id="clip0_35_7">
                    <rect width="10" height="9" fill="white" />
                </clipPath>
            </defs>
        </svg>
    </span>
}
export default PremiumPlan