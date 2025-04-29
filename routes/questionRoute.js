import {Router} from 'express'
import quizService from '../services/quizService.js'
import questionService from '../services/questionService.js'
import db from '../configs/db.js' // Import the Knex instance directly

const router = new Router()



router.get('/add-question', async (req, res) => {
   
   
    res.render('addQuestion', {
        layout: false,
    })
})

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