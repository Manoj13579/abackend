import express from 'express';
import { getUserData, purchaseCourse, userEnrolledCourses } from '../controllers/userController.ts';
import { authenticateToken } from '../middlewares/authMiddleware.ts';




const userRoutes = express.Router();


userRoutes.get('/get-user-data', authenticateToken,  getUserData);
userRoutes.get('/user-enrolled-courses', authenticateToken, userEnrolledCourses);
userRoutes.post('/purchase-course', authenticateToken, purchaseCourse);

export default userRoutes;