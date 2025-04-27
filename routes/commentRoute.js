import {Router} from 'express'
import commentService from '../services/commentService.js'
import userService from '../services/userService.js';
const router = new Router()

router.post('/add-comment', async (req, res) => {
        try {
            const { quizId, userId, content } = req.body;
            const idUser = await userService.getUserIdByAccountId(userId)
            // Validate input
            if (!quizId || !idUser || !content) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const result = await commentService.addComment(quizId, idUser, content);
            res.status(201).json({ message: 'Comment added successfully', result });
        }
        catch (error) {
            console.error('Error adding comment:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
  });

export default router