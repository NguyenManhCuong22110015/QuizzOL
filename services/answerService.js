import db from '../configs/db.js';

export default {
    // Get all answers for a question
    getAnswersByQuestionId(questionId) {
        return db('question_option').select('*').where('question_id', questionId);
    },

   

    // Delete all answers for a question
    deleteAnswersByQuestionId(questionId) {
        return db('question_option').where('question_id', questionId).del();
    }
};