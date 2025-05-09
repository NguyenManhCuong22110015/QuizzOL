import {Router} from 'express';
import userAnswerController from '../controllers/userAnswerController.js';

const router = new Router();

// Single choice answer routes
router.post('/add', userAnswerController.addUserAnswer);
router.put('/update', userAnswerController.updateUserAnswer);
router.delete('/delete', userAnswerController.deleteUserAnswer);

// Text answer routes
router.post('/add-text', userAnswerController.addTextAnswer);
router.put('/update-text', userAnswerController.updateTextAnswer);

// Multiple choice answer routes
router.post('/add-multiple', userAnswerController.addMultipleAnswers);
router.put('/update-multiple', userAnswerController.updateMultipleAnswers);
router.get('/get-multiple', userAnswerController.getMultipleAnswers);

export default router;