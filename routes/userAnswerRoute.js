import {Router} from 'express'
import userAnswerService from '../services/userAnswerService.js'
import logActivity from '../services/logActivity.js';  // Import decorator
const router = new Router()

router.post('/add', logActivity(async (req, res) => {
    try {
        const { resultId, questionId, answerId } = req.body;

        if (!resultId || !questionId || !answerId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const response = await userAnswerService.addUserAnswer(questionId, resultId, answerId);
        if (response) {
            return res.status(200).json({ message: 'User answer added successfully' });
        } else {
            return res.status(500).json({ error: 'Failed to add user answer' });
        }

    } catch (error) {
        console.error('Error adding user answer:', error);
        res.status(500).json({ error: 'Failed to add user answer' });
    }
}));

router.post('/add', async (req, res) => {
    try {
        const {resultId, questionId, answerId} = req.body;

       

        if (!resultId || !questionId || !answerId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const response = await userAnswerService.addUserAnswer(questionId, resultId, answerId); 
        if (response) {
            return res.status(200).json({ message: 'User answer added successfully' });
        } else {
            return res.status(500).json({ error: 'Failed to add user answer' });
        }

    }
    catch (error) {
        console.error('Error adding user answer:', error);
        res.status(500).json({ error: 'Failed to add user answer' });
    }
})


router.put('/update', async (req, res) => {
    try {
        const {resultId, questionId, answerId} = req.body;

        

        if (!resultId || !questionId || !answerId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const response = await userAnswerService.updateUserAnswer(questionId, resultId, answerId); 
        
        // Check if record was not found
        if (response.notFound) {
            return res.status(404).json({ error: 'Answer not found' });
        }
        
        // Check for other errors
        if (response.error) {
            return res.status(500).json({ error: response.error });
        }
        
        return res.status(200).json({ message: 'User answer updated successfully' });
    }
    catch (error) {
        console.error('Error updating user answer:', error);
        res.status(500).json({ error: 'Failed to update user answer' });
    }
});
router.delete('/delete', async (req, res) => {
    try {
        const {resultId, questionId} = req.body;
        // Check if the resultId and questionId are provided
        if (!resultId || !questionId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const response = await userAnswerService.deleteUserAnswer(questionId, resultId); 
        if (response) {
            return res.status(200).json({ message: 'User answer deleted successfully' });
        } else {
            return res.status(500).json({ error: 'Failed to delete user answer' });
        }

    }
    catch (error) {
        console.error('Error deleting user answer:', error);
        res.status(500).json({ error: 'Failed to delete user answer' });
    }
}
)

router.post('/add-text', async (req, res) => {
    try {
        const {resultId, questionId, textAnswer} = req.body;
        // Check if all required fields are provided
        if (!resultId || !questionId || !textAnswer) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const response = await userAnswerService.addTextAnswer(questionId, resultId, textAnswer);
        if (response) {
            return res.status(200).json({ message: 'Text answer added successfully' });
        } else {
            return res.status(500).json({ error: 'Failed to add text answer' });
        }
    } catch (error) {
        console.error('Error adding text answer:', error);
        res.status(500).json({ error: 'Failed to add text answer' });
    }
});

router.put('/update-text', async (req, res) => {
    try {
        const {resultId, questionId, textAnswer} = req.body;
        if (!resultId || !questionId || !textAnswer) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const response = await userAnswerService.updateTextAnswer(questionId, resultId, textAnswer);
        if (response) {
            return res.status(200).json({ message: 'Text answer updated successfully' });
        } else {
            // If not found, return 404
            return res.status(404).json({ error: 'Answer not found' });
        }
    } catch (error) {
        console.error('Error updating text answer:', error);
        res.status(500).json({ error: 'Failed to update text answer' });
    }
});


export default router