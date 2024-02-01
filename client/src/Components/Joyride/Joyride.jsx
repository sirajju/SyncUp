import React, { useEffect, useState } from 'react'
import Joyride from 'react-joyride'
import { useSelector } from 'react-redux';
import Axios from '../../interceptors/axios';
import toast from 'react-hot-toast';


function JoyrideFunction() {
    const userData = useSelector(state=>state.user)
    const [isDislayed,setDisplay]=useState(true)
    useEffect(()=>{
        if(!userData.value?.joyRideFinished){
            setDisplay(false)
        }
    },[setDisplay])
    const steps = [
        {
            target: '.searchBar',
            tittle: "search bar",
            content: 'You can search users here (Email/Username).',
        },
        {
            target: '.notificationsIcon',
            content: 'You can see notifications by clicking here.',
        },
        {
            target: '.googleSync',
            content: 'Import google contacts by adding account.',
        },
        {
            target: '.menuIcon',
            content: 'Create new chat and more options',
        },
        {
            target: '.profileIcon',
            content: 'This icon takes you to your profile information page',
        },
        {
            target: '.inActiveTab',
            content: 'Clck here to view updates or to create notes',
        },
    ];
    const handleJoyrideCallback = (data) => {
        if (data.action === 'skip' || data.status === 'finished') {
            const options = {
                route:"joyrideFinished",
                headers:{Authorization:`Bearer ${localStorage.getItem('SyncUp_Auth_Token')}`},
                method:"PUT"
            }
            Axios(options).catch(err=>{
                toast.error(err.message)
            })
        }
    };
    return (
        <Joyride
            steps={steps}
            run={!isDislayed}
            continuous
            disableCloseOnEsc={true}
            showSkipButton
            styles={{
                options:{
                    arrowColor:'#ED80FD',
                    primaryColor:'#ED80FD',
                }
            }}
            floaterProps={{ autoOpen: true }}
            callback={handleJoyrideCallback}
            disableOverlayClose={true}
        />
    )
}

export default JoyrideFunction