import userAnswerService from '../services/userAnswerService.js';

export default {
  /**
   * Add a single choice user answer
   */
  addUserAnswer: async (req, res) => {
    try {
      const {resultId, questionId, answerId} = req.body;

      if (!resultId || !questionId || !answerId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const response = await userAnswerService.addUserAnswer(questionId, resultId, answerId); 
      if (response) {
        return res.status(200).json({ message: 'User answer added successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to add user answer' });
      }
    }
    catch (error) {
      console.error('Error adding user answer:', error);
      res.status(500).json({ error: 'Failed to add user answer' });
    }
  },

  /**
   * Update a single choice user answer
   */
  updateUserAnswer: async (req, res) => {
    try {
      const {resultId, questionId, answerId} = req.body;

      if (!resultId || !questionId || !answerId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const response = await userAnswerService.updateUserAnswer(questionId, resultId, answerId); 
      
      // Check if record was not found
      if (response.notFound) {
        return res.status(404).json({ error: 'Answer not found' });
      }
      
      // Check for other errors
      if (response.error) {
        return res.status(500).json({ error: response.error });
      }
      
      return res.status(200).json({ message: 'User answer updated successfully' });
    }
    catch (error) {
      console.error('Error updating user answer:', error);
      res.status(500).json({ error: 'Failed to update user answer' });
    }
  },

  /**
   * Delete a user answer
   */
  deleteUserAnswer: async (req, res) => {
    try {
      const {resultId, questionId} = req.body;
      // Check if the resultId and questionId are provided
      if (!resultId || !questionId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const response = await userAnswerService.deleteUserAnswer(questionId, resultId); 
      if (response) {
        return res.status(200).json({ message: 'User answer deleted successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to delete user answer' });
      }
    }
    catch (error) {
      console.error('Error deleting user answer:', error);
      res.status(500).json({ error: 'Failed to delete user answer' });
    }
  },

  /**
   * Add a text answer
   */
  addTextAnswer: async (req, res) => {
    try {
      const {resultId, questionId, textAnswer} = req.body;
      // Check if all required fields are provided
      if (!resultId || !questionId || !textAnswer) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const response = await userAnswerService.addTextAnswer(questionId, resultId, textAnswer);
      if (response) {
        return res.status(200).json({ message: 'Text answer added successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to add text answer' });
      }
    } catch (error) {
      console.error('Error adding text answer:', error);
      res.status(500).json({ error: 'Failed to add text answer' });
    }
  },

  /**
   * Update a text answer
   */
  updateTextAnswer: async (req, res) => {
    try {
      const {resultId, questionId, textAnswer} = req.body;
      if (!resultId || !questionId || !textAnswer) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const response = await userAnswerService.updateTextAnswer(questionId, resultId, textAnswer);
      if (response) {
        return res.status(200).json({ message: 'Text answer updated successfully' });
      } else {
        // If not found, return 404
        return res.status(404).json({ error: 'Answer not found' });
      }
    } catch (error) {
      console.error('Error updating text answer:', error);
      res.status(500).json({ error: 'Failed to update text answer' });
    }
  },

  /**
   * Add multiple choice answers
   */
  addMultipleAnswers: async (req, res) => {
    try {
      const {resultId, questionId, optionIds} = req.body;
      
      // Kiểm tra các trường bắt buộc
      if (!resultId || !questionId || !Array.isArray(optionIds) || optionIds.length === 0) {
        return res.status(400).json({ error: 'Missing required fields or invalid option IDs array' });
      }
      
      const response = await userAnswerService.addMultiChoiceAnswers(questionId, resultId, optionIds);
      
      if (response) {
        return res.status(200).json({ message: 'Multiple choice answers added successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to add multiple choice answers' });
      }
    } catch (error) {
      console.error('Error adding multiple choice answers:', error);
      res.status(500).json({ error: 'Failed to add multiple choice answers' });
    }
  },

  /**
   * Update multiple choice answers
   */
  updateMultipleAnswers: async (req, res) => {
    try {
      const {resultId, questionId, optionIds} = req.body;
      
      // Kiểm tra các trường bắt buộc
      if (!resultId || !questionId || !Array.isArray(optionIds)) {
        return res.status(400).json({ error: 'Missing required fields or invalid option IDs array' });
      }
      
      const response = await userAnswerService.updateMultiChoiceAnswers(questionId, resultId, optionIds);
      
      // Kiểm tra nếu không tìm thấy bản ghi
      if (response.notFound) {
        return res.status(404).json({ error: 'Answers not found' });
      }
      
      // Kiểm tra các lỗi khác
      if (response.error) {
        return res.status(500).json({ error: response.error });
      }
      
      return res.status(200).json({ message: 'Multiple choice answers updated successfully' });
    } catch (error) {
      console.error('Error updating multiple choice answers:', error);
      res.status(500).json({ error: 'Failed to update multiple choice answers' });
    }
  },

  /**
   * Get multiple choice answers
   */
  getMultipleAnswers: async (req, res) => {
    try {
      const {resultId, questionId} = req.query;
      
      // Kiểm tra các trường bắt buộc
      if (!resultId || !questionId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const optionIds = await userAnswerService.getMultiChoiceAnswers(questionId, resultId);
      
      return res.status(200).json({ optionIds });
    } catch (error) {
      console.error('Error fetching multiple choice answers:', error);
      res.status(500).json({ error: 'Failed to fetch multiple choice answers' });
    }
  }
};