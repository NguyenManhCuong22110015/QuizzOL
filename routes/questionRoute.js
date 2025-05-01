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
    const { quizId } = req.params;
    const questionData = req.body;

    try {
        // Validation
        if (!questionData || !questionData.content || !questionData.type || questionData.points === undefined) {
            return res.status(400).json({ error: 'Thiếu thông tin câu hỏi cơ bản (content, type, points).' });
        }

        if ((questionData.type === 'SINGLE_ANSWER' || questionData.type === 'MULTIPLE_ANSWER') 
            && (!questionData.option || questionData.option.length < 2)) {
            return res.status(400).json({ error: 'Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn.' });
        }

        // Call service method to add question
        const newQuestion = await questionService.addQuestion(quizId, questionData);

        res.status(201).json({ 
            success: true,
            message: 'Question added successfully!', 
            questionId: newQuestion.id 
        });

    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to add question to database.',
            details: error.message 
        });
    }
});


export default router