import {Router} from 'express';
import quizController from '../controllers/quizController.js';
import check from '../middlewares/auth.mdw.js';

const router = new Router();

// Search route
router.get('/search', quizController.searchQuizzes);

// Quiz publish toggle route
router.post('/toggle-publish/:id', quizController.togglePublishQuiz);

// Quiz listing routes
router.get('/quizzes', check, quizController.getDashboardQuizzes);

// Question management routes
router.get('/question/:id', quizController.getQuestionsByQuizId);

// Quiz media update route
router.put('/quizzes/:id/update-media', quizController.updateQuizMedia);

// Quiz CRUD routes
router.post('/quizzes', quizController.createQuiz);
router.get('/quizzes/:id', quizController.getQuizById);
router.put('/quizzes/:id', quizController.updateQuiz);
router.delete('/quizzes/:id', quizController.deleteQuiz);

// Quiz take test route
router.get('/do-test/:id', check, quizController.doTestQuiz);

// Quiz result check route
router.get('/check-result/:id', quizController.checkResult);

// Quiz categories route
router.get('/all-quiz-by-category', quizController.getQuizzesByCategory);

// Test routes
router.get('/test', quizController.getTestPage);
router.get('/1/question', quizController.getQuestionPage);

// Add question to quiz route
router.get('/:id/add-question', quizController.getAddQuestionPage);

export default router;