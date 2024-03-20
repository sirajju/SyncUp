import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'

const socketContext = createContext(null)

export const SocketProvider = (props) => {
    let socket = io(`http://${window.location.hostname}:5000`)

    // const socket = io(`https://syncup-5jun.onrender.com`)
    socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
      });

    return (
        <socketContext.Provider value={socket} >
            {props.children}
        </socketContext.Provider>
    )
}

export const useSocket = () => {
    const socket = useContext(socketContext)

    return socket
}