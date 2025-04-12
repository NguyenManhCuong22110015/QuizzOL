import e, {Router} from 'express'
import quizService from '../services/quizService.js'

const router = new Router()

router.get('/', async (req, res) => {
    
      res.render('home/homePage')
  })
  


export default router