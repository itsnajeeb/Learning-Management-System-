import User from "../models/user.model.js";
import AppError from "../utils/error.utils.js";
import cloudinary from 'cloudinary';
import fs from 'fs';
import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto';


const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
    httpOnly: true,
    sucure: true,
}
const register = async (req, res, next) => {
    try {
        const { fullname, email, password } = req.body;

        if (!fullname || !email || !password) {
            return next(new AppError('All fields are required', 400))
        }
        const userExist = await User.findOne({ email });

        if (userExist) {
            return next(new AppError("Email already exist ", 400))
        }

        const user = await User.create({
            fullname,
            email,
            password,
            avatar: {
                public_id: email,
                secure_url: 'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg'
            },
        })

        if (!user) {
            return next(new AppError("User registration failed, Please try again", 400))
        };

        //TODO: File Upload

        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: "lms",
                    width: 250,
                    height: 250,
                    gravity: 'faces',
                    crop: 'fill'
                });


                if (result) {
                    // if (!user.avatar) user.avatar = {};

                    user.avatar.public_id = result.public_id;
                    user.avatar.secure_url = result.secure_url;

                    //Remove file from server/ local folder
                    fs.rm(`uploads/${req.file.filename}`, (err) => {
                        if (err) {
                            console.error("Error deleting local file:", err);
                        } else {
                            console.log("Local file deleted successfully");
                        }
                    });
                }

            } catch (error) {
                return next(new AppError(`${error} File not uploaded please try again `, 500))

            }
        }

        await user.save();

        const token = user.jwtGenerateToken();

        res.cookie('token', token, cookieOptions)

        user.password = undefined;
        return res.status(200).json({
            success: true,
            message: "User registered successfully ",
            user
        });

    }
    catch (err) {
        return next(new AppError(err.message, 400))
    }

}
const login = async (req, res, next) => {
    const { email, password } = req.body;
    try {

        if (!email || !password) {
            return next(new AppError("All fields are required ", 400))
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return next(new AppError("User not found", 400))
        }

        if (!user || !user.comparePassword(password)) {
            return next(new AppError("User not found", 400))
        }

        user.password = undefined;
        const token = await user.jwtGenerateToken();

        res.cookie('token', token, cookieOptions)

        res.status(200).json({
            success: true,
            message: "User loogedin successfully",
            user
        })
    } catch (err) {
        return next(new AppError(err.message, 400))
    }
}

const logout = (req, res) => {
    res.cookie('token', null, {
        secure: true,
        httpOnly: true,
        maxAge: 0
    });

    res.status(200).json({
        success: true,
        message: "User Logout Successfully"
    })
}

const getProfile = async (req, res, next) => {

    try {
        const userId = req.user.id;
        console.log("user Id ", userId);


        const user = await User.findById(userId);

        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        return next(new AppError("Failed to fetch user profile ", 400))
    }
}

const forgotPassword = async (req, res, next) => {
    const { email } = req.body

    if (!email) {
        return next(new AppError("Email is Required", 400))
    };

    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError("Email Not Found", 400))
    };

    const resetToken = user.generatePasswordRestToken()

    await user.save();

    const resetPasswordURL = `${process.env.FRONT_END_URL}/password-reset/${resetToken}`;

    const subject = "Reset Your Password";

    const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank" > Reset Your Password \n If the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}\n I fyou have not requested this, Kindly ignore.`

    try {
        await sendEmail(email, subject, message);

        res.status(200).json({
            success: true,
            message: `Reset Password token has been sent to  ${email} Successfully`
        })

    }
    catch (e) {
        user.fortgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;

        return next(new AppError("Email Not Found", 400))

    }

}

const resetPassword = async (req, res, next) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    if (!password) {
        return next(new AppError("All fields are required ", 400))
    }

    const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
        forgotPasswordToken,
        fortgotPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
        return next(new AppError("Your Token has been expired. Please try again letter", 400))
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.fortgotPasswordExpiry = undefined;

    user.save();

    res.status(200).json({
        success: true,
        message: "Your Password Updated Successfylly"
    })

}
const changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user;

    if (!oldPassword, !newPassword) {
        return next(new AppError("Your Token has been expired. Please try again letter", 400))
    }

    const user = await User.findById(id).select('+password');

    if (!user) {
        return next(new AppError("User Not Found ", 400))
    }

    const isValidPassword = user.comparePassword(oldPassword);

    if (!isValidPassword) {
        return next(new AppError(" Old Password does not match"))
    }
    user.password = newPassword
    await user.save();

    user.password = undefined;

    res.status(200).json({
        success: true,
        message: "Password Change Successfully "
    });

}

const updateUser = async (req, res, next) => {
    const { fullname } = req.body;
    const { id } = req.user.id;

    const user = await User.findById(id);

    if (!user) {
        return next(new AppError("User not Found ", 400))
    };
    if (req.fullname) {
        user.fullname = fullname
    };

    if (req.file) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    };

    if (req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: "lms",
                width: 250,
                height: 250,
                gravity: 'faces',
                crop: 'fill'
            });


            if (result) {
                // if (!user.avatar) user.avatar = {};

                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                //Remove file from server/ local folder
                fs.rm(`uploads/${req.file.filename}`, (err) => {
                    if (err) {
                        console.error("Error deleting local file:", err);
                    } else {
                        console.log("Local file deleted successfully");
                    }
                });
            }

        } catch (error) {
            return next(new AppError(`${error} File not uploaded please try again `, 500))

        }
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "User Details Updated Successfully "
    })

}
export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser
}