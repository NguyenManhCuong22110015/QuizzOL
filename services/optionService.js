import optionRepository from '../repositories/optionRepository.js';

export default {
    /**
     * Get a single option by its ID
     * @param {number} optionId - The option ID to fetch
     * @returns {Promise<object|null>} The option object or null
     */
    async getOptionById(optionId) {
        try {
            const option = await optionRepository.findById(optionId);
            return option;
        } catch (error) {
            console.error('Error fetching option:', error);
            return null;
        }
    },

    /**
     * Get all options for a specific question
     * @param {number} questionId - The question ID
     * @returns {Promise<Array|null>} Array of options or null on error
     */
    async getOptionsByQuestionId(questionId) {
        try {
            const options = await optionRepository.findByQuestionId(questionId);
            return options;
        } catch (error) {
            console.error('Error fetching options:', error);
            return null;
        }
    },
    
    /**
     * Get the first correct option for a question
     * @param {number} questionId - The question ID
     * @returns {Promise<object|null>} The correct option or null on error
     */
    async getCorrectOptionByQuestionId(questionId) {
        try {
            const option = await optionRepository.findFirstCorrectByQuestionId(questionId);
            return option;
        } catch (error) {
            console.error('Error fetching correct option:', error);
            return null;
        }
    },
    
    /**
     * Get all correct options for a question
     * @param {number} questionId - The question ID
     * @returns {Promise<Array>} Array of correct options (empty array on error)
     */
    async getCorrectOptionsByQuestionId(questionId) {
        try {
            const options = await optionRepository.findAllCorrectByQuestionId(questionId);
            return options;
        } catch (error) {
            console.error('Error fetching correct options:', error);
            return [];
        }
    },
    
    /**
     * Get the content of the correct answer for a question (useful for fill-in-the-blank)
     * @param {number} questionId - The question ID
     * @returns {Promise<string>} The correct answer text or empty string
     */
    async getCorrectAnswerByQuestionId(questionId) {
        try {
            const answer = await optionRepository.findFirstCorrectByQuestionId(questionId);
            return answer ? answer.content : '';
        } catch (error) {
            console.error('Error fetching correct answer for fill in the blank:', error);
            return '';
        }
    },
    
    /**
     * Get selected options from user answer for a specific result and question
     * @param {number} resultId - The result ID
     * @param {number} questionId - The question ID
     * @returns {Promise<Array>} Array of selected option IDs
     */
    async getMultiChoiceAnswers(resultId, questionId) {
        console.log('Fetching multiple choice answers for resultId:', resultId, 'and questionId:', questionId);
        try {
            const selectedOptions = await optionRepository.findUserAnswerOptions(resultId, questionId);
            return selectedOptions;
        } catch (error) {
            console.error('Error fetching multiple choice answers:', error);
            return [];
        }
    }
}