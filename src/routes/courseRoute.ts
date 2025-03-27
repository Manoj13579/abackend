import express from 'express';
import { getAllCourses, getCourseById } from '../controllers/courseController.ts';



const courseRoutes = express.Router();


courseRoutes.get('/get-all-courses',  getAllCourses);
courseRoutes.get('/get-course-by-id',  getCourseById);

export default courseRoutes;