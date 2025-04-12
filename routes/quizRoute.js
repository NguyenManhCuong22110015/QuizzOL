import {Router} from 'express'
import quizService from '../services/quizService.js'
import questionService from '../services/questionService.js'
import answerService from '../services/answerService.js'
import categoryService from '../services/categoryService.js'
import quizController from '../controllers/quizController.js'
import pkg from 'passport';
const { session } = pkg;
const router = new Router()


router.get('/quizzes', async (req, res) => {
    const data = await quizService.getAllQuizzes() || 0;
    res.json(data);
    //res.render('quiz/quiz_list', { list: data })
})


router.post('/quizzes', async (req, res) => {
    try {
        const data = req.body;
        const quiz = {
            title: data.quizTitle,
            description: data.quizDescription,
            createdBy: session.userID || 1,
            category: data.categoryId,
            tag: data.tag,
            time: new Date().toISOString().slice(0, 19).replace('T', ' '),
            media: data.quizMedia
        };

        // Add the quiz to the database and get the inserted quiz ID
        const quizId = await quizService.addQuiz(quiz) || 0;

        // Get question from request body and add them to the quiz
        const questions = data.questionList || [];

        // Add quizId to each question object and add new question to the database
        // This returns an array of inserted questions
        const insertedQuestions = await questionService.addQuestions(quizId, questions) || 0;

        // Now add options for each inserted question using their "option" property
        await answerService.addOptionsForAllQuestions(questions, insertedQuestions) || 0;

        res.json({
            message: "Quiz created successfully",
            quizId,
            insertedQuestions
        });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
});

router.get('/quizzes/:id', async (req, res) => {
    const quizId = req.params.id;

    try {
        // Fetch the quiz details
        const quiz = await quizService.getQuizById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        

        // Fetch all questions for the quiz
        const questionList = await questionService.getQuestionsByQuizId(quizId);

        // Fetch options for each question
        const questionsWithOptions = await Promise.all(
            questionList.map(async (question) => {
                const options = await answerService.getAnswersByQuestionId(question.id);
                return { ...question, options };
            })
        );

        // Combine the data
        const data = {
            quiz: quiz,
            questions: questionsWithOptions
        };

        res.json(data);
    } catch (error) {
        console.error('Error fetching quiz details:', error);
        res.status(500).json({ error: 'Failed to fetch quiz details' });
    }
});



router.put('/quizzes/:id', async (req, res) => {
    const quizId = req.params.id
    const quiz = req.body
    const data = await quizService.updateQuiz(quizId, quiz) || 0
    res.json(data)
})


router.delete('/quizzes/:id', async (req, res) => {
    const quizId = req.params.id
    const data = await quizService.deleteQuiz(quizId) || 0
    res.json(data)
})



// quizz-test routes
router.get('/do-test/:id', async (req, res) => {
    try {
        const quizId = req.params.id;
        const test = await quizService.getFullQuizDetails(quizId);

        if (!test) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        if (!test.questions || !Array.isArray(test.questions)) {
            test.questions = [];
        }

        test.questions.forEach((question, index) => {
            question.question_number = index + 1;
        });

        res.render('quiz/doTest', {
            quiz: test,
            numberOfQuestions: test.questions.length,
        });
    }
    catch (error) {
        console.error('Error fetching quiz details:', error);
        res.status(500).json({ error: 'Failed to fetch quiz details' });
    }
});


router.get('/check-result/:id', quizController.checkResult)

router.get('/all', async (req, res) => {

    try {
        const categories = await categoryService.getAllCategories() || []

        const quizzesOfCategory = await Promise.all(categories.map(async (category) => {
            try {
                const quizzes = await quizService.getQuizzesByCategoryId(category.id) || []
                return {
                    ...category,
                    quizzes: quizzes.map(quiz => ({
                        id: quiz.id,
                        name: quiz.name,
                        title: quiz.title,
                        description: quiz.description,
                        image: quiz.imageUrl,
                        time: quiz.time,
                        numberOfQuestions:quiz.numberOfQuestions,
                    }))
                }
            }
            catch(error){
                console.error('Error fetching quizzes for category:', error);
                return null;
            }
        
        })).then(results => results.filter(result => result !== null && result.quizzes.length > 0)); 
        res.render('home/homePage', {
            quizzesOfCategory
        })

        // res.json(quizzesOfCategory)
    }
    catch (error) {
        console.error('Error fetching quizzes by category:', error);
        res.status(500).json({ error: 'Failed to fetch quizzes by category' });
    }

})



export default router