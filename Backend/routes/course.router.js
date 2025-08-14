import { Router } from 'express'
import { createCourse, getAllCourses, getLecturesByCourseId, removeCourse, updateCourse } from '../controllers/course.controller.js';
import upload from '../middleware/multer.middleware.js';

const router = Router()

router.post('/createCourse',upload.single("thumbnail"),createCourse)
router.get('/getAllCourses',getAllCourses)

router.route('/:id')
    .get(getLecturesByCourseId)
    .put(updateCourse)
    .delete(removeCourse)


export default router