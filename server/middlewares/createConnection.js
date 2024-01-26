const User = require('../models/userSchema')
const Connection = require('../models/connectionModel')

module.exports = async function (req, res, next) {
    try {
        const userData = await User.findOne({ email: req.userEmail })
        if (userData) {
            const connectData = await Connection.findOne({ userId: userData._id })
            if (!connectData) {
                const conData = new Connection({
                    userId: userData._id
                })
                await conData.save()
            }
            next()
        }else{
            throw new Error("No data")
        }
    } catch (error) {
        res.json({ message: err.message })
    }
}