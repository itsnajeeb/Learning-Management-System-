import Course from "../models/course.model.js"
import AppError from "../utils/error.utils.js"

const getAllCourses = async function (req, res, next) {

    try {
        const course = await Course.find({}).select('-lectures')
        res.status(200).json({
            success: true,
            message: "Successs",
            course,
        })
    }
    catch (err) {
        return next(new AppError(err.message, 400))
    }
}

const getLecturesByCourseId = async function (req, res, next) {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);
        if (!course) {
            return next(new AppError("Course not found", 400))
        }

        res.status(200).json({
            success: false,
            message: "Course Lecture fetch successfully",
            lectures: course.lectures
        })
    }
    catch (err) {
        return next(new AppError(err.message, 500))
    }
}

export {
    getAllCourses,
    getLecturesByCourseId
}