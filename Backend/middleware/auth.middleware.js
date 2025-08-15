import AppError from "../utils/error.utils.js";
import jwt from "jsonwebtoken";

const isLoggedIn = (req, res, next) => {
    try {

        const { token } = req.cookies;

        if (!token) {
            return next(new AppError("Unauthorized User, Please login again ", 400));
        }

        const userProfile = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('User Profile > ', userProfile);
        req.user = userProfile
        // console.log('Request.user value > ', req.user);
        next()

    }


    catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError("Session expired. Please log in again.", 401));
        }
        return next(new AppError("Invalid token. Please log in again.", 401));
    }
}

const authorizedRoles = (...roles) => {
    return async (req, res, next) => {
        const currentUserRole = req.user.role;

        if (!roles.includes(currentUserRole)) {
            return next(new AppError("You do not have permission to access this route", 403));
        }
        next();
    };
};

export {
    isLoggedIn,
    authorizedRoles,
}