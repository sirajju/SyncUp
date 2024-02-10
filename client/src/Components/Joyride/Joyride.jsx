import React, { useEffect, useState } from 'react'
import Joyride from 'react-joyride'
import { useDispatch, useSelector } from 'react-redux';
import Axios from '../../interceptors/axios';
import toast from 'react-hot-toast';
import { setUserData } from '../../Context/userContext';


function JoyrideFunction() {
    const userData = useSelector(state => state.user)
    const dispatch=useDispatch()
    const [isDislayed, setDisplay] = useState(true)
    useEffect(() => {
        if (!userData.value?.joyRideFinished) {
            setDisplay(false)
        }
    }, [userData])
    const steps = [
        {
            target: '.searchBar',
            content: 'You can search users here (Email/Username).',
            disableBeacon: true,
            disableOverlayClose: true,
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
        {
            target: '.callLogIcon',
            content: 'This icon let you know about previos calls',
        },
    ];
    const handleJoyrideCallback = (data) => {
        if (data.action === 'skip' || data.status === 'finished') {
            dispatch(setUserData({...userData.value,joyRideFinished:true}))
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
                options: {
                    arrowColor: '#ED80FD',
                    primaryColor: '#ED80FD',
                }
            }}
            floaterProps={{ autoOpen: true }}
            callback={handleJoyrideCallback}
            disableOverlayClose={true}
        />
    )
}

export default JoyrideFunction