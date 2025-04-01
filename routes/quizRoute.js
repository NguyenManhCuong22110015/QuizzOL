import {Router} from 'express'
import quizService from '../services/quizService.js'
import questionService from '../services/questionService.js'
import answerService from '../services/answerService.js'

const router = new Router()

router.get('/quizzes', async (req, res) => {
    const data = await quizService.getAllQuizzes() || 0;
    res.json(data);
    //res.render('quiz/quiz_list', { list: data })
})


router.post('/quizzes', async (req, res) => {
    const quiz = req.body
    const data = await quizService.addQuiz(quiz) || 0
    res.json(data)
})

router.get('/quizzes/:id', async (req, res) => {
    const quizId = req.params.id;

    try {
        // Fetch the quiz details
        const quiz = await quizService.getQuizById(quizId) || 0;

        // Fetch all questions for the quiz
        const questionList = await questionService.getQuestionsByQuizId(quizId) || 0;

        // Fetch answers for each question
        const questionsWithAnswers = await Promise.all(
            questionList.map(async (question) => {
                const answers = await answerService.getAnswersByQuestionId(question.id);
                return { ...question, answers };
            })
        );

        // Combine the data
        const data = {
            quiz: quiz,
            questions: questionsWithAnswers
        };

        res.json(data);
    } catch (error) {
        console.error('Error fetching quiz details:', error);
        res.status(500).json({ error: 'Failed to fetch quiz details' });
    }
});



router.post('/quizzes/:id', async (req, res) => {
    const quizId = req.params.id
    const quiz = req.body
    const data = await quizService.updateQuiz(quizId, quiz) || 0
    res.json(data)
})


router.get('/quizzes/delete/:id', async (req, res) => {
    const quizId = req.params.id
    const data = await quizService.deleteQuiz(quizId) || 0
    res.json(data)
})



// quizz-test routes
router.get('/do-test', async (req, res) => {
  //  const data = await quizService.getAllQuizs() || 0;
   
    res.render('quiz/doTest')
})


router.get('/check-result', async (req, res) => {
    //  const data = await quizService.getAllQuizs() || 0;
     
      res.render('quiz/checkResult')
})


export default router