import userService from '../services/userService.js';
import resultService from '../services/resultService.js';
import moment from 'moment-timezone';

export default {
  /**
   * Render user profile page
   */
  getProfilePage: async (req, res) => {
    try {
      const user = await userService.getUserByAccountId(req.session.authUser.id);
      
      res.render('profilePage', {
        user: user,
        account: req.session.authUser,
        layout: false
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).render('error', { message: 'Failed to load profile page' });
    }
  },

  /**
   * Render user overview page with quiz history
   */
  getOverviewPage: async (req, res) => {
    try {
      const user = await userService.getUserByAccountId(req.session.authUser.id);
      const userId = user.id; // Get the user ID from the user object
      
      // Get page from query params, default to page 1
      const page = parseInt(req.query.page) || 1;
      const limit = 5; // 5 items per page
      
      // Get paginated quiz history
      const historyData = await resultService.getResultsByUserId(userId, page, limit);
      
      const avatar = await userService.getAvatarByUserId(user.id);

      res.render('userOverviewPage', {
        user: user,
        account: req.session.authUser,
        avatar: avatar ? avatar : null,
        quizHistory: historyData.results,
        pagination: historyData.pagination
        // layout: false
      });
    } catch (error) {
      console.error('Error fetching user overview:', error);
      res.status(500).render('error', { message: 'Failed to load user overview' });
    }
  },

  /**
   * Update a specific user field
   */
  updateField: async (req, res) => {
    try {
      const { field, value } = req.body;
      
      const ret = await userService.updateFields(req.session.authUser.id, field, value);
      if (ret) {
        req.session.authUser[field] = value;
        res.status(200).json({ success: true, message: 'Field updated successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Failed to update field' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Update user's birthday
   */
  updateBirthday: async (req, res) => {
    try {
      const { birthday } = req.body;
      console.log('Received birthday:', birthday);
      
      // Parse the birthday using moment
      const parsedDate = moment(birthday, 'DD/MM/YYYY');
      
      // Check if the date is valid
      if (!parsedDate.isValid()) {
        console.error('Invalid date format:', birthday);
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid date format. Please use MM/DD/YYYY' 
        });
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
  },

  /**
   * Update user's avatar
   */
  updateAvatar: async (req, res) => {
    try {
      const { avatar, public_id } = req.body;
      console.log('Received avatar:', avatar);
      
      const ret = await userService.updateAvatar(req.session.authUser.id, avatar, public_id);
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
  }
};