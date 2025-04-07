import {Router} from 'express'


const router = new Router()

router.get('/', (req, res) => {
    res.render('quizzes', { 
      title: 'Admin Dashboard',
      layout: 'admin'  
    });
  });
export default router