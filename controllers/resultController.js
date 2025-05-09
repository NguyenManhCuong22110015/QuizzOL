import resultService from '../services/resultService.js';
import userService from '../services/userService.js';
import quizService from '../services/quizService.js';

export default {
  /**
   * Complete a quiz result
   */
  completeResult: async (req, res) => {
    try {
      const { currentResultId } = req.params;
      console.log('Received resultId:', currentResultId);

      if (!currentResultId) {
        return res.status(400).json({ error: 'Missing required field: currentResultId' });
      }

      // Complete the result
      const response = await resultService.completeResult(currentResultId);
      
      // Calculate score for completed result
      await resultService.calculateScore(currentResultId);

      if (response) {
        return res.status(200).json({ message: 'Result completed successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to complete result' });
      }
    } catch (error) {
      console.error('Error completing result:', error);
      res.status(500).json({ error: 'Failed to complete result' });
    }
  },

  /**
   * Get results for a specific quiz by quiz ID
   */
  getResultsByQuizId: async (req, res) => {
    try {
      const { quizId } = req.params;
      
      if (!quizId) {
        return res.status(400).json({ error: 'Missing required field: quizId' });
      }
      
      const results = await resultService.getResultsByQuizId(quizId);
      
      return res.status(200).json(results);
    } catch (error) {
      console.error('Error fetching results by quiz ID:', error);
      res.status(500).json({ error: 'Failed to fetch results' });
    }
  },

  /**
   * Get results for a specific user by user ID
   */
  getResultsByUserId: async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'Missing required field: userId' });
      }
      
      const results = await resultService.getResultsByUserId(userId);
      
      // Enhance result data with quiz info
      const enhancedResults = await Promise.all(results.map(async (result) => {
        const quiz = await quizService.getQuizById(result.quiz);
        return {
          ...result,
          quizTitle: quiz ? quiz.title : 'Unknown Quiz',
          quizDescription: quiz ? quiz.description : ''
        };
      }));
      
      return res.status(200).json(enhancedResults);
    } catch (error) {
      console.error('Error fetching results by user ID:', error);
      res.status(500).json({ error: 'Failed to fetch results' });
    }
  },

  /**
   * Save user answer for a question in a result
   */
  saveUserAnswer: async (req, res) => {
    try {
      const { resultId, questionId } = req.params;
      const { answerId, textAnswer, selectedOptions } = req.body;
      
      if (!resultId || !questionId) {
        return res.status(400).json({ error: 'Missing required fields: resultId or questionId' });
      }
      
      let response;
      
      // Handle different answer types based on what's provided
      if (selectedOptions && Array.isArray(selectedOptions)) {
        // Handle multi-choice answers
        response = await resultService.saveMultiChoiceAnswer(resultId, questionId, selectedOptions);
      } else if (textAnswer) {
        // Handle text answers
        response = await resultService.saveTextAnswer(resultId, questionId, textAnswer);
      } else if (answerId) {
        // Handle single choice answers
        response = await resultService.saveSingleChoiceAnswer(resultId, questionId, answerId);
      } else {
        return res.status(400).json({ error: 'Missing answer data' });
      }
      
      if (response) {
        return res.status(200).json({ message: 'Answer saved successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to save answer' });
      }
    } catch (error) {
      console.error('Error saving user answer:', error);
      res.status(500).json({ error: 'Failed to save answer' });
    }
  },

  /**
   * Get detailed result by result ID
   */
  getResultById: async (req, res) => {
    try {
      const { resultId } = req.params;
      
      if (!resultId) {
        return res.status(400).json({ error: 'Missing required field: resultId' });
      }
      
      const result = await resultService.getResultById(resultId);
      
      if (!result) {
        return res.status(404).json({ error: 'Result not found' });
      }
      
      // Get additional details
      const quiz = await quizService.getQuizById(result.quiz);
      const user = await userService.getUserById(result.user);
      const answers = await resultService.getUserAnswersByResultId(resultId);
      
      return res.status(200).json({
        result,
        quiz,
        user,
        answers
      });
    } catch (error) {
      console.error('Error fetching result details:', error);
      res.status(500).json({ error: 'Failed to fetch result details' });
    }
  }
};