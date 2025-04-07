import {Router} from 'express'


const router = new Router()

router.get('/', (req, res) => {
    res.render('layouts/student', { 
      title: 'Student Dashboard',
      layout: 'student'  
    });
  });
router.get('/editquiz', (req, res) => {
    res.render('quiz/editquiz', { 
      title: 'Student Dashboard',
      layout: 'student'  
    });
  });
export default router