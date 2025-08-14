import Course from "../models/course.model.js"
import AppError from "../utils/error.utils.js"
import cloudinary from 'cloudinary';
import fs from 'fs/promises'

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

const createCourse = async (req, res, next) => {
    console.log(req.body);
    const { title, description, category, createdBy } = req.body;


    if (!title || !description || !category || !createdBy) {
        return next(new AppError('All Fields are required ', 400))
    }
    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail: {
            public_id: 'Dummy ID',
            secure_url: 'Dummy URL'
        },


    })

    if (!course) {
        return next(new AppError('Course not created yet. Try again', 500))
    }
    try {
        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
            });

            if (result) {
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;
            }
            fs.rm(`uploads/${req.file.filename}`);
        }
    } catch (error) {
        return next(new AppError(error.message, 500))

    }

    await course.save();

    res.status(200).json({
        success: true,
        message: "Course created successfully",
        course
    })


}


const updateCourse = async (req, res, next) => {

}

const removeCourse = async (req, res, next) => {

}

export {
    getAllCourses,
    getLecturesByCourseId,
    createCourse,
    updateCourse,
    removeCourse
}