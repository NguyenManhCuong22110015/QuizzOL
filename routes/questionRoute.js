import { Router } from 'express';
import questionController from '../controllers/questionController.js';

const router = new Router();

// Route to render the add question page
router.get('/:quizId/add-question', questionController.renderAddQuestionPage);

// Route to handle adding a new question
router.post('/:quizId/add-question', questionController.addQuestion);

// Route to get question details
router.get('/:questionId', questionController.getQuestionById);

// Route to update a question
router.put('/:questionId', questionController.updateQuestion);

// Route to delete a question
router.delete('/:quizId/:questionId', questionController.deleteQuestion);

export default router;