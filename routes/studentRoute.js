import {Router} from 'express';
import studentController from '../controllers/studentController.js';
import check from '../middlewares/auth.mdw.js';

const router = new Router();

// Dashboard route
router.get('/', check, studentController.getDashboard);

// Quiz edit routes
router.get('/editquiz', check, studentController.getEditQuizPage);
router.get('/editquiz/:id/addquestion', check, studentController.getAddQuestionPage);

// Profile route
router.get('/profile', check, studentController.getProfilePage);

// Quiz history route
router.get('/history', check, studentController.getQuizHistoryPage);

// Create quiz route
router.get('/create-quiz', check, studentController.getCreateQuizPage);

export default router;