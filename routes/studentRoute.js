import {Router} from 'express'


const router = new Router()

router.get('/', (req, res) => {
    res.render('student', { 
      title: 'Student Dashboard',
      layout: 'student'  
    });
  });
router.get('/editquiz', (req, res) => {
    res.render('quiz/editquiz', { 
      title: 'Student Dashboard',
      layout: 'student',
      css:'editquiz.css'
    });
  });
  router.get('/editquiz/:id/addquestion', (req, res) => {
    const quizId = req.params.id;
    res.render('addQuestionStudent', {
      title: 'Thêm câu hỏi',
      layout: 'student',
      quizId
    });
  });
export default router