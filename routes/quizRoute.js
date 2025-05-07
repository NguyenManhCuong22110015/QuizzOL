import {Router} from 'express'
import quizService from '../services/quizService.js'
import questionService from '../services/questionService.js'
import answerService from '../services/answerService.js'
import categoryService from '../services/categoryService.js'
import quizController from '../controllers/quizController.js'
import pkg from 'passport';
import check from '../middlewares/auth.mdw.js'
import resultService from '../services/resultService.js'
import tagService from '../services/tagService.js';

const { session } = pkg;
const router = new Router()

router.get('/search', (req, res) => {
    if (typeof quizController.searchQuizzes === 'function') {
        return quizController.searchQuizzes(req, res);
    } else {
        console.error('quizController.searchQuizzes is not a function');
        return res.status(500).json({ error: 'Search functionality unavailable' });
    }
});
router.post('/toggle-publish/:id', async (req, res) => {
    try {
        const quizId = req.params.id;
        // Add fallback in case req.body is undefined
        const published = req.body && req.body.published !== undefined ? req.body.published : false;
        
        // Update the quiz in the database
        await quizService.updateQuiz(quizId, { published });
        
        res.json({ 
            success: true, 
            message: published ? 'Quiz published successfully' : 'Quiz unpublished successfully' 
        });
    } catch (error) {
        console.error('Error toggling quiz publish status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update quiz status'
        });
    }
});
router.get('/quizzes',check, async (req, res) => {
    try {
        const userId = req.session.authUser?.user || req.user?.id || 1;
        const quizzes = await quizService.getQuizzesWithDetails();
        
        res.render('quizzes_dataFilled', {
            layout: 'student',
            quizzes: quizzes
        });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).render('error', { message: 'Failed to load quizzes.' });
    }
});

router.get('/question/:id', async (req, res) => {
    try {
        const quizId = req.params.id;
        const questions = await questionService.getQuestionsByQuizId(quizId) || [];
    
        res.render('question_dataFilled', {
            quizId: quizId,
            layout: "student",
            questions: questions
        });
    } catch (error) {
        console.error('Error loading quiz page:', error);
        res.status(500).render('error', { message: 'Failed to load quiz page' });
    }
   
});



router.put('/quizzes/:id/update-media', async (req, res) => {
    try {
        const quizId = req.params.id;
        const { image, public_id } = req.body;
       
        if (!image) {
            return res.status(400).json({ error: 'No media ID provided' });
        }
        
        await quizService.updateImageQuiz(quizId, image, public_id);
        
        res.json({ 
            success: true, 
            message: 'Quiz media updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating quiz media:', error);
        res.status(500).json({ error: 'Failed to update quiz media' });
    }
});




router.post('/quizzes', async (req, res) => {
    try {
        const data = req.body;
        const userId = req.session.authUser?.user || req.user?.id || 1;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Basic validation
        if (!data.quizTitle || !data.quizDescription || !data.categoryId) {
            return res.status(400).json({ error: 'Missing required quiz fields' });
        }

        // Handle tags
        let tagIds = [];
        if (data.tags) {
            tagIds = await tagService.findOrCreateTags(data.tags);
        }

        const quiz = {
            title: data.quizTitle,
            description: data.quizDescription,
            createdBy: userId,
            category: parseInt(data.categoryId, 10),
            tag: tagIds.length > 0 ? tagIds.join(',') : null,
            time: new Date(),
            media: data.quizMedia || null
        };

        const [newQuizId] = await quizService.addQuiz(quiz);
        
        if (!newQuizId) {
            return res.status(500).json({ error: 'Failed to create quiz' });
        }

        res.json({
            success: true,
            message: 'Quiz created successfully',
            redirectUrl: `/question/${newQuizId}/add-question`
        });

    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({
            error: 'Failed to create quiz',
            message: error.message
        });
    }
});


//old GET quiz by id router
router.get('/quizzes/:id', async (req, res) => {
    const quizId = req.params.id;

    try {
        // Fetch quiz details using the getQuizPageDetails function
        const quizPageDetails = await quizService.getQuizPageDetails(quizId);

        if (!quizPageDetails) {
            return res.status(404).render('quiz/quizDetail', { message: 'Quiz not found' });
        }
        req.session.authorizedQuizAccess = quizId;

        // Render the quizDetail view with the fetched data
        res.render('quiz/quizDetail_dataFilled', {
            layout: false,
            quiz: quizPageDetails.quiz,
            stats: quizPageDetails.stats,
            rating : quizPageDetails.rating,
            comments: quizPageDetails.comments,
            leaderboard: quizPageDetails.leaderboard
        });
    } catch (error) {
        console.error('Error rendering quiz details:', error);
        res.status(500).render('error', { message: 'Failed to render quiz details' });
    }
});

router.put('/quizzes/:id', async (req, res) => {
    try {
        const quizId = parseInt(req.params.id);
        if (!quizId) {
            return res.status(400).json({ error: 'Invalid quiz ID' });
        }

        // Log the incoming request body for debugging
        console.log('Received quiz data:', req.body);

        const { quizTitle, quizDescription, categoryId, tag } = req.body;

        // Validate required fields
        if (!quizTitle || !categoryId) {
            return res.status(400).json({ error: 'Quiz title and category are required' });
        }

        // Handle tags
        let tagIds = [];
        if (tag) {
            tagIds = await tagService.findOrCreateTags(tag);
        }

        const dataToUpdate = {
            title: quizTitle,
            description: quizDescription,
            category: parseInt(categoryId),
            tag: tagIds.length > 0 ? tagIds.join(',') : null
        };

        const updatedQuiz = await quizService.updateQuiz(quizId, dataToUpdate);

        res.json({
            success: true,
            message: 'Quiz updated successfully',
            data: updatedQuiz
        });
    } catch (error) {
        console.error('Error updating quiz:', error);
        res.status(500).json({ 
            error: 'Failed to update quiz',
            message: error.message 
        });
    }
});


router.delete('/quizzes/:id', async (req, res) => {
    try {
        const quizId = req.params.id;
        const result = await quizService.deleteQuiz(quizId);
        res.json({
            success: true,
            message: result.message || 'Quiz deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete quiz',
            message: error.message
        });
    }
});



// quizz-test routes
router.get('/do-test/:id',check, async (req, res) => {
    try {
        const quizId = req.params.id;


        
        const test = await quizService.getFullQuizDetails(quizId);
        const userId = req.session.authUser.user || 1;
         
        let startTime = new Date();
        let endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour
        if (!test) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        if (!test.questions || !Array.isArray(test.questions)) {
            test.questions = [];
        }

        test.questions.forEach((question, index) => {
            question.question_number = index + 1;
        });
        let answer = [] ;
        let resultId = null;
        let newResultId = 0;
        const checkExistResult =  await resultService.checkExistResult(test.id, userId) || 0

        if (checkExistResult) {
            resultId = checkExistResult.result.id;
            answer = checkExistResult.userAnswers || [];
            
            // Use the existing timestamps
            if (checkExistResult.result.start_time) {
                startTime = new Date(checkExistResult.result.start_time);
            }
            
            if (checkExistResult.result.end_time) {
                endTime = new Date(checkExistResult.result.end_time);
            }
        }
        else {
            const newResult =  await resultService.createResult(test.id, userId) || []
            
            if (newResult) {
                resultId = newResult.id;
                
                // Use the new timestamps
                if (newResult.start_time) {
                    startTime = new Date(newResult.start_time);
                }
                
                if (newResult.end_time) {
                    endTime = new Date(newResult.end_time);
                }
                
                console.log('Created new result:', resultId);
            } else {
                console.error('Failed to create a new result');
                return res.status(500).json({ error: 'Failed to create quiz result' });
            }
        }
        
        

        res.render('quiz/doTest', {
            layout: false,
            quiz: test,
            resultId: resultId,
            startTime: startTime.toISOString(), 
            endTime: endTime.toISOString(),
            numberOfQuestions: test.questions.length,
            existingAnswers : answer.length > 0 ? answer : []
        });
    }
    catch (error) {
        console.error('Error fetching quiz details:', error);
        res.status(500).json({ error: 'Failed to fetch quiz details' });
    }
});


router.get('/check-result/:id', (req, res) => {
  if (typeof quizController.checkResult === 'function') {
    return quizController.checkResult(req, res);
  } else {
    console.error('quizController.checkResult is not a function');
    return res.status(500).json({ error: 'Check result functionality unavailable' });
  }
});

router.get('/all-quiz-by-category', async (req, res) => {

    try {
        const categories = await categoryService.getAllCategories() || []

        const quizzesOfCategory = await Promise.all(categories.map(async (category) => {
            try {
                const quizzes = await quizService.getQuizzesByCategoryId(category.id) || []
                return {
                    ...category,
                    quizzes: quizzes.map(quiz => ({
                        triggerLoading: true,
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
        res.render('home/categoryPage', {
            layout: 'main',
            quizzesOfCategory
        })

        // res.json(quizzesOfCategory)
    }
    catch (error) {
        console.error('Error fetching quizzes by category:', error);
        res.status(500).json({ error: 'Failed to fetch quizzes by category' });
    }

})


router.get("/test", async (req, res) => {
    try {
       
        res.render('quizzes', {
            layout: "student"
        })
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
})


router.get("/1/question", async (req, res) => {
    try {
        // const quizId = req.params.id;
        // const quiz = await quizService.getQuizById(quizId) || 0;
        res.render('questionOfQuiz', {
            layout: "student",
           
        })
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
})


router.get('/:id/add-question', async (req, res) => {
    try {
        const quizId = parseInt(req.params.id);
        const quiz = await quizService.getQuizById(quizId);
        
        if (!quiz) {
            return res.status(404).render('error', { message: 'Quiz not found' });
        }

        res.render('addQuestion', {
            layout:false
        });
    } catch (error) {
        console.error('Error loading add question page:', error);
        res.status(500).render('error', { message: 'Failed to load question page' });
    }
})





export default router