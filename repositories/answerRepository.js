import db from '../configs/db.js';

export default {
    async findByQuestionId(questionId) {
        return db('option').select('*').where('question_id', questionId);
    },
    
    async insertOptions(options) {
        return db('option').insert(options);
    },
    
    async deleteByQuestionId(questionId) {
        // Note: Fixed inconsistent table name (was using question_option in service)
        return db('option').where('question_id', questionId).del();
    }
}