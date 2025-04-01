import db from '../configs/db.js';

export default {
    // Get all answers for a question
    getAnswersByQuestionId(questionId) {
        return db('optionanswer').select('*').where('question_id', questionId);
    },

   

    // Delete all answers for a question
    deleteAnswersByQuestionId(questionId) {
        return db('optionanswer').where('question_id', questionId).del();
    }
};