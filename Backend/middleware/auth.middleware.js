import AppError from "../utils/error.utils.js";
import jwt from "jsonwebtoken";

const isLoggedIn = (req, res, next) => {

    try {
        const { token } = req.cookies;

        if (!token) {
            return next(new AppError("Unauthorized User, Please login again ", 400));
        }

        const userProfile = jwt.verify(token, process.env.JWT_SECRET);
        console.log(userProfile);
        req.user = userProfile
    }

    catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError("Session expired. Please log in again.", 401));
        }
        return next(new AppError("Invalid token. Please log in again.", 401));
    } next()

}
export default isLoggedIn