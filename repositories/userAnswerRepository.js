import db from '../configs/db.js';

export default {
    /**
     * Find existing user answer
     * @param {number} questionId - Question ID
     * @param {number} resultId - Result ID
     * @returns {Promise<object|null>} - User answer or null if not found
     */
    async findUserAnswer(questionId, resultId) {
        return db('useranswer')
            .where({
                question_id: questionId,
                result_id: resultId
            })
            .first();
    },
    
    /**
     * Insert a new user answer
     * @param {object} answerData - Answer data to insert
     * @returns {Promise<number>} - ID of inserted answer
     */
    async insertUserAnswer(answerData) {
        const [id] = await db('useranswer').insert(answerData);
        return id;
    },
    
    /**
     * Update an existing user answer
     * @param {number} questionId - Question ID
     * @param {number} resultId - Result ID
     * @param {object} updateData - Data to update
     * @returns {Promise<number>} - Number of rows affected
     */
    async updateUserAnswer(questionId, resultId, updateData) {
        return db('useranswer')
            .where({
                question_id: questionId,
                result_id: resultId
            })
            .update(updateData);
    },
    
    /**
     * Delete user answer
     * @param {number} questionId - Question ID
     * @param {number} resultId - Result ID
     * @returns {Promise<number>} - Number of rows affected
     */
    async deleteUserAnswer(questionId, resultId) {
        return db('useranswer')
            .where({
                question_id: questionId,
                result_id: resultId
            })
            .del();
    },
    
    /**
     * Get all user answers for a result
     * @param {number} resultId - Result ID
     * @returns {Promise<Array>} - Array of user answers
     */
    async findAnswersByResultId(resultId) {
        return db('useranswer').where('result_id', resultId);
    },
    
    /**
     * Get all user answers for a question
     * @param {number} questionId - Question ID
     * @returns {Promise<Array>} - Array of user answers
     */
    async findAnswersByQuestionId(questionId) {
        return db('useranswer').where('question_id', questionId);
    },
    
    /**
     * Get correct answers for a question
     * @param {number} questionId - Question ID
     * @returns {Promise<Array>} - Array of correct options
     */
    async getCorrectOptionsForQuestion(questionId) {
        return db('option')
            .where({
                question_id: questionId,
                isCorrect: true
            });
    }
};