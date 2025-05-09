import { Router } from 'express';
import adminController from '../controllers/adminController.js';

const router = new Router();

// Dashboard route
router.get('/', adminController.getDashboard);

// Quizzes management route
router.get('/quizzes', adminController.getQuizzes);

// Admin settings route
router.get('/setting', adminController.getSettings);

// Overview route
router.get('/overview', adminController.getOverview);

// Add question route
router.get('/quizzes/:id/addquestion', adminController.getAddQuestionPage);

export default router;