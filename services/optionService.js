import db from '../configs/db.js';

export default {

    async getOptionById(optionId) {
        try {
            const option = await db('option').where('id', optionId).first();
            return option;
        } catch (error) {
            console.error('Error fetching option:', error);
            return null;
        }
    },

    async getOptionsByQuestionId(questionId) {
        try {
            const options = await db('option').where('question_id', questionId);
            return options;
        } catch (error) {
            console.error('Error fetching options:', error);
            return null;
        }
    },
    async getCorrectOptionByQuestionId(questionId) {
        try {
            const option = await db('option').where({
                question_id: questionId,
                isCorrect: true
            }).first();
            return option;
        } catch (error) {
            console.error('Error fetching correct option:', error);
            return null;
        }
    }


}