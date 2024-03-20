import React from 'react'
import ax from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import cryptojs from 'crypto-js'

async function Axios(options) {
    // const navigate = useNavigate()
    const { url, method, route, payload, headers, params, crypto } = options
    const requestUrl = url && (url.endsWith('/') ? url.slice(0, -1) : false);
    const requestRoute = route && route.startsWith('/') ? route.slice(1) : route;
    // const host = requestUrl || ||`https://syncup-5jun.onrender.com`
    const host = requestUrl || `http://${window.location.hostname}:5000/api`
    const requestMethod = getMethod(method)
    if (!route) {
        toast.error('Route is missing')
    } else {
        try {
            if (method && method != "GET" && method !='DELETE') {
                const res = await requestMethod(`${host}/${requestRoute}`, payload, { headers,params } || {})
                if (res) {
                    if (res.data.body && crypto) {
                        const decrypted = cryptojs.AES.decrypt(res.data.body, 'syncupservercryptokey').toString(cryptojs.enc.Utf8);
                        return {...res,data:{...res.data,body:JSON.parse(decrypted)}}
                    }
                    else {
                        return  res
                    }
                }
            } else {
                const res = await requestMethod(`${host}/${requestRoute}`, { headers,params } || {})
                if (res) {
                    if (res.data.body && crypto) {
                        const decrypted = cryptojs.AES.decrypt(res.data.body, 'syncupservercryptokey').toString(cryptojs.enc.Utf8);
                        return {...res,data:{...res.data,body:JSON.parse(decrypted)}}
                    }
                    else{
                        return res
                    }
                }
            }
        } catch (error) {
            toast.error(error.message)
            localStorage.removeItem('SyncUp_Auth_Token')
            return error
        }
    }
}
function getMethod(method) {
    switch (method) {
        case "POST":
            return ax.post
        case "PUT":
            return ax.put
        case "PATCH":
            return ax.patch
        case "DELETE":
            return ax.delete
        default:
            return ax.get
    }
}

export default Axios