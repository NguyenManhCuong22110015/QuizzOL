import db from '../configs/db.js';

export default {
    // Get all questions for a quiz
    getQuestionsByQuizId(quizId) {
        return db('question').select('*').where('quiz_id', quizId);
    },

    // Create questions for a quiz
    addQuestions(quizId, questions) {
        // Insert the questions directly
        return db('question').insert(questions);
    },

   
    // Delete all questions for a quiz
    deleteQuestionsByQuizId(quizId) {
        return db('question').where('quiz_id', quizId).del();
    },

    // Delete a single question by ID (within a quiz)
    deleteQuestionById(questionId, quizId) {
        return db('question')
            .select('*')
            .where('id', questionId)
            .andWhere('quiz_id', quizId)
            .first().del();
    }
};