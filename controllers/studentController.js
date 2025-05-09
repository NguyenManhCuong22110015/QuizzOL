import quizService from '../services/quizService.js';

export default {
  /**
   * Render student dashboard
   */
  getDashboard: (req, res) => {
    res.render('student', { 
      title: 'Student Dashboard',
      layout: 'student'  
    });
  },

  /**
   * Render quiz edit page
   */
  getEditQuizPage: (req, res) => {
    res.render('quiz/editquiz', { 
      title: 'Student Dashboard',
      layout: 'student',
      css: 'editquiz.css'
    });
  },

  /**
   * Render add question page
   */
  getAddQuestionPage: (req, res) => {
    const quizId = req.params.id;
    res.render('addQuestionStudent', {
      title: 'Thêm câu hỏi',
      layout: 'student',
      quizId
    });
  },

  /**
   * Render student profile page
   */
  getProfilePage: async (req, res) => {
    try {
      // Get user ID from session
      const userId = req.session.authUser?.user;
      
      if (!userId) {
        return res.status(401).redirect('/auth/login');
      }
      
      // Get user data from service
      const userData = await userService.getUserById(userId);
      const userStats = await userService.getUserStats(userId);
      
      res.render('profile', {
        title: 'User Profile',
        layout: 'student',
        user: userData,
        stats: userStats
      });
    } catch (error) {
      console.error('Error loading profile page:', error);
      res.status(500).render('error', { message: 'Failed to load profile page' });
    }
  },
  
  /**
   * Render student quiz history page
   */
  getQuizHistoryPage: async (req, res) => {
    try {
      // Get user ID from session
      const userId = req.session.authUser?.user;
      
      if (!userId) {
        return res.status(401).redirect('/auth/login');
      }
      
      // Get quiz history data
      const quizHistory = await resultService.getResultsByUserId(userId);
      
      res.render('quizHistory', {
        title: 'Quiz History',
        layout: 'student',
        history: quizHistory
      });
    } catch (error) {
      console.error('Error loading quiz history:', error);
      res.status(500).render('error', { message: 'Failed to load quiz history' });
    }
  },
  
  /**
   * Render student quiz creation page
   */
  getCreateQuizPage: async (req, res) => {
    try {
      // Get categories for dropdown
      const categories = await categoryService.getAllCategories();
      
      res.render('createQuiz', {
        title: 'Create Quiz',
        layout: 'student',
        categories
      });
    } catch (error) {
      console.error('Error loading create quiz page:', error);
      res.status(500).render('error', { message: 'Failed to load create quiz page' });
    }
  }
};