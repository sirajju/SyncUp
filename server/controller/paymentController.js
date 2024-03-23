const Premium = require('../models/premiumModel')
const User = require('../models/userSchema')
const { generateRandom } = require('./userController')

const stripe = require('stripe')('sk_test_51OVGPESDYWbkQV1JgSfloLEN9ZygRSByIdVCPF8lfAp3mruveoL6ecqzue9FVJlDjNlM3055snhmPvQu7wz0BaKF006p33kPEY')
const createPaymentSession = async (req, res) => {
    try {
        const { plan } = req.body
        if (plan) {
            const token = generateRandom(50, false)
            const em = `https://syncup.savetech.online/plans?token=${token}&&u=${btoa(req.userEmail)}`
            console.log(em);

            await stripe.customers.create({
                name: 'Hello world',
                description: "Premium payment",
                address: {
                    line1: 'Kozhikode',
                    postal_code: '673580',
                    city: 'Calicut',
                    state: 'KERALA',
                    country: 'INDIA',
                },
            })
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        quantity: 1,
                        price: plan == 'Monthly' ? 'price_1OVGyHSDYWbkQV1JTZXU2JPO' : 'price_1OVH2vSDYWbkQV1JsT2PMeE4'
                    },
                ],
                mode: plan == 'Monthly' ? "subscription" : "payment",
                success_url: em,
                cancel_url: `https://syncup.savetech.online/plans?isCancelled=true`,
                customer_email: req.userEmail,
                currency: "inr",

            })
            if (session) {
                const userData = await User.findOne({ email: req.userEmail })
                const existsData = await Premium.findOneAndDelete({ userId: userData._id })
                const today = new Date();
                const futureDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
                const premiumData = await new Premium({
                    userId: userData._id,
                    type: plan,
                    price: (session.amount_total) / 100,
                    authToken: token,
                    expiresAt: plan == 'Monthly' ? futureDate.getTime() : futureDate.getTime() * futureDate.getTime(),
                    expiresAtString:plan == 'Monthly' ? futureDate.toLocaleDateString('en-GB',{day:"2-digit",month:"short",year:"numeric"}) : "never",
                    paymentType: 'card',
                    paymentStatus: 'pending',
                    paymentSessionId: session.id,
                    createdAt:Date.now()

                }).save()
                if (premiumData) {
                    return res.json({ id: session.id })
                }
                res.json({ message: "Error while creating session" })
            }
        } else {
            res.json({ message: "Something went wrong" })
        }
    } catch (error) {
        console.log(error);
        res.json({ message: error.message })
    }
}
const verifyPremium = async (req, res) => {
    try {
        const { token } = req.query
        if (token) {
            const userData = await User.findOne({ email: req.userEmail })
            const premiumData = await Premium.findOne({ userId: userData._id })
            console.log(premiumData, token);
            if (premiumData.authToken == token) {
                const updateData = await User.findOneAndUpdate({ email: req.userEmail }, { $set: { isPremium: true } })
                const premiumUpdate = await Premium.findOneAndUpdate({ userId: userData._id }, { $set: { paymentStatus: "success", authToken: '' } })
                if (premiumUpdate && updateData) {
                    res.json({ success: true })
                } else {
                    res.json({ message: "Error while updating state" })
                }
            } else {
                res.json({ message: 'Signature verification failed' })
            }
        } else {
            res.json({ message: 'Something went wrong' })
        }
    } catch (error) {
        console.log(error);
        res.json({ message: error.message })
    }
}

const paymentCancelled = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.userEmail })
        if (userData) {
            const premiumData = await Premium.findOneAndDelete({ userId: userData._id })
            if (premiumData) {
                res.json({ message: `Payment is not completed yet`, success: true })
            }
        }
    } catch (error) {
        console.log(error);
        res.json({ message: error.message })
    }
}

module.exports = {
    createPaymentSession,
    verifyPremium,
    paymentCancelled
}