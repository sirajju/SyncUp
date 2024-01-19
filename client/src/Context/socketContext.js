import React, { createContext, useContext, useMemo } from 'react'
import {io} from 'socket.io-client'

const socketContext = createContext(null)

export const SocketProvider = (props)=>{
    const socket = useMemo(()=>io(`http://${window.location.hostname}:5000`))

    return (
        <socketContext.Provider value={socket} >
            {props.children}
        </socketContext.Provider>
    )
}

export const useSocket = ()=>{
    const socket = useContext(socketContext)
    return socket
}