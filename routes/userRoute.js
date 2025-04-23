import {Router} from 'express'
import check from "../middlewares/auth.mdw.js"
import userService from '../services/userService.js'
import moment from 'moment-timezone';


const router = new Router()
router.get('/profile',check, async (req, res) => {
     
    const user = await userService.getUserByAccountId(req.session.authUser.id)
    

      res.render('profilePage', {
        user: user,
        account: req.session.authUser,
        layout:false
      })
  })
 
router.get("/overview", check, async (req, res) => {
    const user = await userService.getUserByAccountId(req.session.authUser.id)
    res.render('userOverviewPage', {
        user: user,
        account: req.session.authUser,
        layout:false
      })
}
)

router.post('/update-field', check, async (req, res) => {
    try {
        const { field, value } = req.body;
        
        const ret = await userService.updateFields(req.session.authUser.id, field, value);
        if (ret) {
            req.session.authUser[field] = value;
            res.status(200).json({ success: true, message: 'Field updated successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to update field' });
        }
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
})

router.post('/update-birthday', check, async (req, res) => {
  try {
      const { birthday } = req.body;
      console.log('Received birthday:', birthday);
      
      // Parse the birthday using moment
      const parsedDate = moment(birthday, 'DD/MM/YYYY');
      
      // Check if the date is valid
      if (!parsedDate.isValid()) {
          console.error('Invalid date format:', birthday);
          return res.status(400).json({ success: false, message: 'Invalid date format. Please use MM/DD/YYYY' });
      }
      
      // Format for MySQL (YYYY-MM-DD)
      const formattedDate = parsedDate.format('YYYY-MM-DD');
      
      console.log('Formatted date for database:', formattedDate);
      
      

      const ret = await userService.updateBirthday(req.session.authUser.id, formattedDate);
      
      if (ret) {
          // Update the session with a friendly format
          req.session.authUser.birthday = parsedDate.format('MM/DD/YYYY');
          res.status(200).json({ 
              success: true, 
              message: 'Birthday updated successfully',
              formattedDate: parsedDate.format('MMMM D, YYYY') // Return a nicely formatted date
          });
      } else {
          res.status(400).json({ success: false, message: 'Failed to update birthday' });
      }
  } catch (error) {
      console.error('Error updating birthday:', error);
      res.status(500).json({ success: false, message: error.message });
  }
});


router.post("/update-avatar", check, async (req, res) => {
    try {
        const { avatar } = req.body;
        console.log('Received avatar:', avatar);
        
        const ret = await userService.updateAvatar(req.session.authUser.id, avatar);
        if (ret) {
            req.session.authUser.avatar = avatar;
            res.status(200).json({ success: true, message: 'Avatar updated successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to update avatar' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
})



export default router