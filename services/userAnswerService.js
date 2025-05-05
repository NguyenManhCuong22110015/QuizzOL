import db from '../configs/db.js';

export default {
async addUserAnswer(questionId, resultId, answerId) {
    try {
        // Check if answer already exists
        const existing = await db('useranswer')
            .where({
                question_id: questionId,
                result_id: resultId
            })
            .first();
            
        if (existing) {
            // Update existing answer
            return await this.updateUserAnswer(questionId, resultId, answerId);
        }
        
        // Create new answer
        await db('useranswer').insert({
            question_id: questionId,
            result_id: resultId,
            option_id: answerId,
        });
        
        return true;
    } catch (error) {
        console.error('Error adding user answer:', error);
        return false;
    }
},

async updateUserAnswer(questionId, resultId, answerId) {
    try {
        // Check if answer exists
        const existing = await db('useranswer')
            .where({
                question_id: questionId,
                result_id: resultId
            })
            .first();
            
        if (!existing) {
            // If not found, return an object with notFound flag
            return { notFound: true };
        }
        
        // Update the answer
        await db('useranswer')
            .where({
                question_id: questionId,
                result_id: resultId
            })
            .update({
                option_id: answerId,
            });
            
        return { success: true };
    } catch (error) {
        console.error('Error updating user answer:', error);
        return { error: error.message };
    }
},

// Add methods for text answers
async addTextAnswer(questionId, resultId, textAnswer) {
    try {
        // Check if answer already exists
        const existing = await db('useranswer')
            .where({
                question_id: questionId,
                result_id: resultId
            })
            .first();
            
        if (existing) {
            // Update existing answer
            return await this.updateTextAnswer(questionId, resultId, textAnswer);
        }
        
        // Create new answer
        await db('useranswer').insert({
            question_id: questionId,
            result_id: resultId,
            text_answer: textAnswer,
        });
        
        return true;
    } catch (error) {
        console.error('Error adding text answer:', error);
        return false;
    }
},

async updateTextAnswer(questionId, resultId, textAnswer) {
    try {
        // Check if answer exists
        const existing = await db('useranswer')
            .where({
                question_id: questionId,
                result_id: resultId
            })
            .first();
            
        if (!existing) {
            // If not found, return false
            return false;
        }
        
        // Update the answer
        await db('useranswer')
            .where({
                question_id: questionId,
                result_id: resultId
            })
            .update({
                text_answer: textAnswer,
            });
            
        return true;
    } catch (error) {
        console.error('Error updating text answer:', error);
        return false;
    }
}

}