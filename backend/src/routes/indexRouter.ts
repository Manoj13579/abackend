import express from 'express';
import authRoutes from './authRoutes.ts';
import uploadRoutes from './uploadRoutes.ts';
import googleAuthRoutes from './googleAuthRoutes.ts';
import educatorRoutes from './educatorRoutes.ts';
import courseRoutes from './courseRoute.ts';
import userRoutes from './userRoutes.ts';
import stripeRoutes from './stripeRoutes.ts';


const indexRouter = express.Router();

indexRouter.use('/api/auth', authRoutes);
indexRouter.use('/api', googleAuthRoutes);
indexRouter.use('/api/upload', uploadRoutes);
indexRouter.use('/api/educator', educatorRoutes);
indexRouter.use('/api/course', courseRoutes);
indexRouter.use('/api/user', userRoutes);
indexRouter.use('/api', stripeRoutes);


export default indexRouter;