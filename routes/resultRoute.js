import { Router } from 'express';
import resultController from '../controllers/resultController.js';

const router = new Router();

// Complete result route
router.put('/complete/:currentResultId', resultController.completeResult);

// Get results by quiz ID
router.get('/quiz/:quizId', resultController.getResultsByQuizId);

// Get results by user ID
router.get('/user/:userId', resultController.getResultsByUserId);

// Save user answer
router.post('/:resultId/questions/:questionId/answer', resultController.saveUserAnswer);

// Get detailed result
router.get('/:resultId', resultController.getResultById);

export default router;