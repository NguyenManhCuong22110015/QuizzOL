import {Router} from 'express'

const router = new Router()

router.get('/add-question', async (req, res) => {
   
   
    res.render('addQuestion', {
        layout: false,
    })
})



export default router