import { Router } from 'express'
import { createCourse, getAllCourses, getLecturesByCourseId, removeCourse, updateCourse } from '../controllers/course.controller.js';
import upload from '../middleware/multer.middleware.js';
import  { isLoggedIn, authorizedRoles } from '../middleware/auth.middleware.js';

const router = Router()

router.post('/createCourse', isLoggedIn, authorizedRoles("ADMIN"),  upload.single("thumbnail"), createCourse)
router.get('/getAllCourses',  getAllCourses)

// router.delete(':id/')
router.route('/:id')
    .get( getLecturesByCourseId)
    .put(isLoggedIn, authorizedRoles('ADMIN'), updateCourse)
    .delete(isLoggedIn, authorizedRoles('ADMIN'), removeCourse)


export default router