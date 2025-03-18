import {Router} from 'express'
import quizService from '../services/quizService.js'

const router = new Router()

router.get('/quizzes', async (req, res) => {
    const data = await quizService.getAllQuizs() || 0;
    res.json(data);
    //res.render('quiz/quiz_list', {list : data})
})

router.get('/do-test', async (req, res) => {
  //  const data = await quizService.getAllQuizs() || 0;
   
    res.render('quiz/doTest')
})


router.get('/check-result', async (req, res) => {
    //  const data = await quizService.getAllQuizs() || 0;
     
      res.render('quiz/checkResult')
  })
  




export default router