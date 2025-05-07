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
    },
    async getCorrectOptionsByQuestionId(questionId) {
        try {
            const options = await db('option').where({
                question_id: questionId,
                isCorrect: true  
            });
            return options;
        } catch (error) {
            console.error('Error fetching correct options:', error);
            return [];
        }
    },
    async getCorrectAnswerByQuestionId(questionId) {
        try {
            
            const answer = await db('option')
                .where('question_id', questionId)
                .where('isCorrect', true)
                .first();
                
            // Trả về nội dung của đáp án
            return answer ? answer.content : '';
        } catch (error) {
            console.error('Error fetching correct answer for fill in the blank:', error);
            return '';
        }
    },
async getMultiChoiceAnswers(resultId, questionId) {
    console.log('Fetching multiple choice answers for resultId:', resultId, 'and questionId:', questionId);
    try {
        const selectedOptions = await db('useranswer') 
            .where({
                result_id: resultId,
                question_id: questionId
            })
            .select('option_id');
        
        // Trả về mảng các option_id
        return selectedOptions;
    } catch (error) {
        console.error('Error fetching multiple choice answers:', error);
        return [];
    }
}


}