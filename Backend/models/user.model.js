import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
const userSchema = new Schema({
    fullname: {
        type: String,
        required: [true, 'Name is required'],
        minLength: [5, "Name Must be atleast 5 character"],
        maxLength: [50, "Name should be less then 50 character"],
        trim: true,
    },
    email: {
        type: String,
        minLength: [5, 'Email must be atleast 5 character'],
        requird: [true, 'Email is required'],
        trim: true,
        unique: true,
        lowercase: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please fill in a valid email address']
    },
    password: {
        minLength: [8, 'Password must be atleast 8 character'],
        type: String,
        trim: true,
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
        },
        secure_url: {
            type: String,
        }
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    forgotPasswordToken: String,
    fortgotPasswordExpiry: Date,

    subscription:{
        id:String,
        status:String,
    }
}, {
    timestamps: true,
}
);

userSchema.pre('save', async function (next) {
    if (!this.isModified()) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
});

userSchema.methods = {


    //Generate a jwt token when user login/register
    jwtGenerateToken: function () {
        return jwt.sign({ id: this._id, role: this.role, subscription: this.subscription },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY }
        )
    },

    comparePassword: async function (planeTextPassword) {
        return await bcrypt.compare(planeTextPassword, this.password)
    },

    generatePasswordRestToken: async function () {
        const resetToken = crypto.randomBytes(20).toString('hex')
        this.forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        this.fortgotPasswordExpiry = Date.now() + 15 * 60 * 1000
        return resetToken;

    }


}

const User = model('User', userSchema);

export default User;