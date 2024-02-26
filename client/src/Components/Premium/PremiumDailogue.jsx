import React, { useState } from 'react';
import { Button, ConfigProvider, Modal, Space } from 'antd';
import './PremiumDailogue.css'
import { useNavigate } from 'react-router-dom';
const App = ({isModalOpen,setIsModalOpen}) => {
    const navigate = useNavigate()
    return (
        <>
            <Modal
                title="Premium required 🗿"
                open={isModalOpen}
                centered={true}
                width={'60vh'}
                onOk={() => {setIsModalOpen(false);navigate('/plans')}}
                onCancel={() => setIsModalOpen(false)}
                className='premiumModal'
                okText="Buy"
                mask={true}
                maskStyle={{background: 'linear-gradient(160deg, #ee9ae5ff 0%, #5961f9ff 100%)'}}
                okButtonProps={{style:{background: 'linear-gradient(160deg, #ee9ae5ff 0%, #5961f9ff 100%)'}}}
                cancelButtonProps={{style:{border:'1px solid #ee9ae5ff',color:"#ee9ae5ff"}}}
            >
            <p>This feature requires premium.Continue with premium to get advanced features</p>
            </Modal>
        </>
    );
};
export default App;