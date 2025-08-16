import { model, Mongoose, Schema } from 'mongoose'

const paymentShema = new Schema({
    razorpay_payment_id: {
        type: String,
        required: true,
    },
    razorpay_subscription_id: {
        type: String,
        required: true,
    },
    razorpay_signature: {
        type: String,
        required: true,
    },

},
    { timestamps: true }
)

const Payment = model('payment', paymentShema)

export default Payment;