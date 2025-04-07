import db from '../configs/db.js';

export default {

    getAnswersByQuestionId(questionId) {
        // Changed from 'question_option' to 'option' to match your schema
        return db('option').select('*').where('question_id', questionId);
    },
   

    // Delete all answers for a question
    deleteAnswersByQuestionId(questionId) {
        return db('question_option').where('question_id', questionId).del();
    }
};