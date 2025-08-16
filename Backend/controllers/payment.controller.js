import { razorpay } from "../index.js";
import User from "../models/user.model.js";
import AppError from "../utils/error.utils.js";
import Payment from "../models/payment_schema.js";

export const getRazorpayApiKey = async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "Razorpay API",
        key: process.env.RAZORPAY_KEY_ID
    })
};

export const buySubscription = async (req, res, next) => {
    const { id } = req.user;

    const user = await User.findById(id);
    if (!user) {
        return next(new AppError("Unauthorized User.", 400))
    }

    if (user.role === 'ADMIN') {
        return next(new AppError("Admin Cannot Purchase a Subscription"))
    }


    const subscription = await razorpay.subscriptions.create({
        plan_id: process.env.RAZORPAY_PLAN_ID,
        customer_notify: 1
    })

    console.log("SUBSCRIPTION DETAILS > ", subscription.id);

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    await user.save();

    res.status(200).json({
        success: false,
        message: "Subscribed Successfully ",
        subscription_id: subscription.id,
    })


};

export const verifySubscription = async (req, res, next) => {

    const { id } = req.user;
    const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body

    const user = await User.findById(id)

    if (!user) {
        next(new AppError('Unauthorized, Please try again'))
    }

    const subscriptionId = user.subscription.id;

    const generateSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_SECRET)
        .update(`${razorpay_payment_id} | ${subscriptionId}`)
        .digest('hex');

    if (generateSignature !== razorpay_signature) {
        return next(new AppError("Payment not verified please try again ", 500))
    }

    await Payment.create({
        razorpay_payment_id,
        razorpay_subscription_id,
        razorpay_signature
    })

    user.subscription.status = 'Active';
    await user.save();

    res.status(200).json({
        success: true,
        message: "Payment Verified Successfylly "
    })

};

export const cancelSubscription = async (req, res, next) => {

    try {
        const { id } = req.user;

        const user = User.findById(id);
        if (!user) {
            return next(new AppError('Unauthorized, Please try again', 401))
        }

        if (user.role === 'ADMIN') {
            return next(new AppError('Admin Cannot Cancel Subscription', 401))
        }

        const subscriptionId = user.subscription.id;

        const subscription = await razorpay.subscriptions.cancel(subscriptionId)

        user.subscription.status = subscription.status;

        await user.save();
    }
    catch (err) {
        return next(new AppError(err.message, 500))
    }
};

export const allPayments = async (req, res, next) => {
    console.log("Hit");
    
    const { count } = req.query;

    const subscription = razorpay.subscriptions.all({
        count: count || 10
    })
    console.log("ALL PAYMENT > ", subscription);
    

    res.status(200).json({
        success:true,
        message:"All Payment",
        subscription
    })

};
