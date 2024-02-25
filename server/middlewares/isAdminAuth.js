const jwt = require("jsonwebtoken")
const User = require('../models/userSchema')

module.exports = async (req, res,next) => {
    try {
        const token = req.headers['authorization'].split('Bearer')[1].trim()
        if (token) {
            const { username, email } = jwt.verify(token, process.env.JWT_SECRET_ADMIN)
            const adminData = await User.findOne({ email, username })
            if (adminData) {
                if (adminData.isBlocked) {
                    res.json({ success: false, message: `Admin suspended from accessing controllpannel` })
                }
                else {
                    req.adminEmail=email,
                    req.userName=username
                    next()
                }
            } else {
                res.json({ success: false, message: "Session expired" })
            }
        }else{
            res.json({ success: false, message: "Session expired" })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Session expired" })
    }
}