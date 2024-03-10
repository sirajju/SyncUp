import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'

const socketContext = createContext(null)

export const SocketProvider = (props) => {
    const socket = io(`https://syncup-fork.onrender.com`)

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