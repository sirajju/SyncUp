import React, { useEffect } from 'react';
import LinearProgress from '@mui/joy/LinearProgress';
import './Loader.css'
import { useDispatch } from 'react-redux';
import { hideLoading } from '../../../Context/userContext';


export default function LinearIndeterminate() {
  const dispatch = useDispatch()
  useEffect(()=>{
    dispatch(hideLoading())
  },[])
  return (
    <div className="loaderParent">
      <div className="loaderChild">
        <h1>Loading...</h1>
        <p>Getting latest mesages..</p>
        <LinearProgress />
      </div>
    </div>
  );
}