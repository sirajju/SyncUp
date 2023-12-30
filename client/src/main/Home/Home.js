import React from 'react'
import './Home.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import Navbar from '../../Components/Home/Navbar/Navbar'
import Banner from '../../Components/Home/Banner/Banner'
import heartIcon from '../../assets/svgIcons/heart_icon.png'
import PremiumPage from '../../Components/Home/PremiumPage/Page'
import PremiumPlan from '../../Components/Home/PremiumPlan/PremiumPlan';
import Updates from '../../Components/Home/Updates/Updates';
import Contact from '../../Components/Home/Contact/Contact';
import Footer from '../../Components/Home/Footer/Footer';
function Home() {
  return (
    <React.Fragment> 
      <Navbar title={"SyncUp"} />
      <Banner isCurved={true} imgUrl={heartIcon} bigText={'Connect with your family and friends '} smallText={"The best platform to connect with your relatives"}/>
      <PremiumPage bigText='Explore premium features' smallText='We give you the best experience.' />
      <PremiumPlan/>
      <Updates/>
      <Contact/>
      <Footer/>
    </React.Fragment>
  );
}

export default Home;
