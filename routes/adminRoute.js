import {Router} from 'express'


const router = new Router()

router.get('/', (req, res) => {
    res.render('layouts/admin', { 
      title: 'Admin Dashboard',
      layout: 'admin'  
    });
  });
  router.get('/quizzes', (req, res) => {
    res.render('quizzes', { 
      title: 'Admin Dashboard',
      layout: 'admin' ,
      activePage: 'quizzes'
       
    });
  });
  router.get('/setting', (req, res) => {
    res.render('adminSetting', {
      title: 'Admin Setting',
      layout: 'admin',        
      css: 'setting.css',
      activePage: 'setting'     
    });
  }); 
  router.get('/overview', (req, res) => {
    res.render('overview', {
      title: 'Admin Overview',
      layout: 'admin',        
      
      activePage: 'overview'     
    });
  }); 
export default router