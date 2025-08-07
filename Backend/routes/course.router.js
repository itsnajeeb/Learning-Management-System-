import { Router } from 'express'
import { getAllCourses, getLecturesByCourseId } from '../controllers/course.controller.js';

const router = Router()

router.get('/', getAllCourses)

router.route('/:id')
    .get(getLecturesByCourseId);

export default router