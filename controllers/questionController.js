import quizService from '../services/quizService.js';
import questionService from '../services/questionService.js';
import { createMedia } from '../services/mediaService.js';
export default {
  /**
   * Render the add question page
   */
  renderAddQuestionPage: async (req, res) => {
    const { quizId } = req.params;

    try {
      // Fetch quiz details to display on the page
      const quiz = await quizService.getQuizById(quizId);
      if (!quiz) {
        return res.status(404).render('error', { message: 'Quiz not found.' });
      }

      // Render the view for adding questions
      res.render('addQuestionStudent_dataFilled', {
        layout: 'student',
        quizId: quizId,
        quizTitle: quiz.title
      });
    } catch (error) {
      console.error(`Error rendering add question page for quiz ${quizId}:`, error);
      res.status(500).render('error', {
        layout: 'adminLayout',
        message: 'Failed to load add question page.'
      });
    }
  },

  /**
   * Handle adding a new question
   */
  addQuestion: async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId, 10);

      if (isNaN(quizId)) {
        return res.status(400).json({ error: 'Invalid quiz ID format' });
      }

      const quiz = await quizService.getQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      const { type, points, explanation, content, options, media_url, public_id, mediaType } = req.body;

      console.log('Request body:', req.body);

      let mediaId = null;
      if (mediaType && public_id && media_url) {
        const media = {
          media_url: media_url || null,
          public_id: public_id || null,
          mediaType: mediaType || null
        }
        mediaId = await createMedia(media);
      }

      console.log('mediaId:', mediaId);

      const questionData = {
        type: type,
        points: points || 1,
        explanation: explanation || null,
        content: content,
        media: mediaId || null,
        options: options.map((option) => ({
          content: option.content,
          isCorrect: option.isCorrect || false
        }))
      };

      console.log('Question data:', questionData);

      const [questionId] = await questionService.addQuestion(questionData);

      if (!questionId) {
        return res.status(500).json({ error: 'Failed to create question' });
      }

      await quizService.addQuestionToQuiz(quizId, questionId);

      res.status(201).json({
        success: true,
        message: 'Question added successfully',
        questionId: questionId
      });
    } catch (error) {
      console.error('Error in addQuestion:', error);
      res.status(500).json({
        error: 'Failed to add question',
        message: error.message
      });
    }
  },

  /**
   * Get question details by ID
   */
  getQuestionById: async (req, res) => {
    try {
      const questionId = parseInt(req.params.questionId, 10);

      if (isNaN(questionId)) {
        return res.status(400).json({ error: 'Invalid question ID format' });
      }

      const question = await questionService.getQuestionWithOptions(questionId);

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      res.status(200).json(question);
    } catch (error) {
      console.error('Error fetching question:', error);
      res.status(500).json({
        error: 'Failed to fetch question',
        message: error.message
      });
    }
  },

  /**
   * Update an existing question
   */
  updateQuestion: async (req, res) => {
    try {
      const questionId = parseInt(req.params.questionId, 10);

      if (isNaN(questionId)) {
        return res.status(400).json({ error: 'Invalid question ID format' });
      }

      const questionData = req.body;
      const updated = await questionService.updateQuestion(questionId, questionData);

      if (!updated) {
        return res.status(404).json({ error: 'Question not found or not updated' });
      }

      res.status(200).json({
        success: true,
        message: 'Question updated successfully'
      });
    } catch (error) {
      console.error('Error updating question:', error);
      res.status(500).json({
        error: 'Failed to update question',
        message: error.message
      });
    }
  },

  /**
   * Delete a question
   */
  deleteQuestion: async (req, res) => {
    try {
      const questionId = parseInt(req.params.questionId, 10);
      const quizId = parseInt(req.params.quizId, 10);

      if (isNaN(questionId) || isNaN(quizId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      // Remove from quiz first
      await quizService.removeQuestionFromQuiz(quizId, questionId);

      // Then delete the question
      const deleted = await questionService.deleteQuestion(questionId);

      if (!deleted) {
        return res.status(404).json({ error: 'Question not found or not deleted' });
      }

      res.status(200).json({
        success: true,
        message: 'Question deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      res.status(500).json({
        error: 'Failed to delete question',
        message: error.message
      });
    }
  }
};