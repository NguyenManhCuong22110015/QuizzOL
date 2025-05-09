import db from '../configs/db.js';

export default {
    /**
     * Get a single option by its ID
     * @param {number} optionId - The ID of the option to fetch
     * @returns {Promise<object|null>} The option object or null
     */
    async findById(optionId) {
        return db('option').where('id', optionId).first();
    },
    
    /**
     * Get all options for a specific question
     * @param {number} questionId - The question ID to get options for
     * @returns {Promise<Array>} Array of option objects
     */
    async findByQuestionId(questionId) {
        return db('option').where('question_id', questionId);
    },
    
    /**
     * Get the first correct option for a question
     * @param {number} questionId - The question ID
     * @returns {Promise<object|undefined>} The correct option or undefined
     */
    async findFirstCorrectByQuestionId(questionId) {
        return db('option').where({
            question_id: questionId,
            isCorrect: true
        }).first();
    },
    
    /**
     * Get all correct options for a question
     * @param {number} questionId - The question ID
     * @returns {Promise<Array>} Array of correct option objects
     */
    async findAllCorrectByQuestionId(questionId) {
        return db('option').where({
            question_id: questionId,
            isCorrect: true  
        });
    },
    
    /**
     * Get selected options from user answer for a specific result and question
     * @param {number} resultId - The result ID
     * @param {number} questionId - The question ID
     * @returns {Promise<Array>} Array of selected option IDs
     */
    async findUserAnswerOptions(resultId, questionId) {
        return db('useranswer') 
            .where({
                result_id: resultId,
                question_id: questionId
            })
            .select('option_id');
    }
}