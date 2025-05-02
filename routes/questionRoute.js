import {Router} from 'express'
import quizService from '../services/quizService.js'
import questionService from '../services/questionService.js'
import db from '../configs/db.js' // Import the Knex instance directly

const router = new Router()

router.get('/:quizId/add-question', async (req, res) => { // Add auth check
    const { quizId } = req.params;
    // Optional: Add authorization check (e.g., is the user an admin or the quiz owner?)
    try {
        // You might want to fetch quiz details to display on the page
        const quiz = await quizService.getQuizById(quizId);
        if (!quiz) {
             return res.status(404).render('error', { message: 'Quiz not found.' }); // Use admin layout
        }

        // Render the view for adding questions, passing the quizId and potentially quiz title
        res.render('addQuestionStudent_dataFilled', { // Assuming this is your view name and location
            layout: 'student', // Use your admin layout
            quizId: quizId,
            quizTitle: quiz.title // Pass title for context
            // Add any other data needed for the view
        });

    } catch (error) {
        console.error(`Error rendering add question page for quiz ${quizId}:`, error);
        res.status(500).render('error', { layout: 'adminLayout', message: 'Failed to load add question page.' });
    }
});

router.post('/:quizId/add-question', async (req, res) => {
    try {
        const quizId = parseInt(req.params.quizId, 10);
        
        if (isNaN(quizId)) {
            return res.status(400).json({ error: 'Invalid quiz ID format' });
        }

        const quiz = await quizService.getQuizById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        const questionData = req.body;
        const [questionId] = await questionService.addQuestion(questionData);

        if (!questionId) {
            return res.status(500).json({ error: 'Failed to create question' });
        }

        await quizService.addQuestionToQuiz(quizId, questionId);

        res.status(201).json({
            success: true,
            message: 'Question added successfully',
            questionId: questionId
        });

    } catch (error) {
        console.error('Error in addQuestion:', error);
        res.status(500).json({
            error: 'Failed to add question',
            message: error.message
        });
    }
});

export default router