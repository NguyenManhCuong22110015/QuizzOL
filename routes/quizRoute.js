import {Router} from 'express'
import quizService from '../services/quizService.js'

const router = new Router()

router.get('/quizzes', async (req, res) => {
    const data = await quizService.getAllQuizs() || 0;
    res.render('quiz/quiz_list', {list : data})

})

export default router