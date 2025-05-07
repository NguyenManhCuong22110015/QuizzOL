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
    },
    async addMultiChoiceAnswers(questionId, resultId, optionIds) {
        try {
            // Kiểm tra đầu vào
            if (!Array.isArray(optionIds) || optionIds.length === 0) {
                return false;
            }

            // Kiểm tra xem đã có bản ghi chưa
            const existingAnswer = await db('useranswer')
                .where({
                    question_id: questionId,
                    result_id: resultId
                })
                .first();

            if (existingAnswer) {
                // Nếu đã có, cập nhật
                await db('useranswer')
                    .where({
                        question_id: questionId,
                        result_id: resultId
                    })
                    .update({
                        selected_options: JSON.stringify(optionIds),
                        option_id: optionIds[0], // Lưu option đầu tiên vào option_id cho tương thích ngược
       
                    });
            } else {
                // Nếu chưa có, tạo mới
                await db('useranswer').insert({
                    question_id: questionId,
                    result_id: resultId,
                    option_id: optionIds[0], // Lưu option đầu tiên vào option_id cho tương thích ngược
                    selected_options: JSON.stringify(optionIds),
             
                });
            }

            return true;
        } catch (error) {
            console.error('Error adding multi choice answers:', error);
            return false;
        }
    },

    async updateMultiChoiceAnswers(questionId, resultId, optionIds) {
        try {
            // Kiểm tra xem câu trả lời có tồn tại không
            const existingAnswer = await db('useranswer')
                .where({
                    question_id: questionId,
                    result_id: resultId
                })
                .first();

            if (!existingAnswer) {
                return { notFound: true };
            }

            // Cập nhật câu trả lời
            await db('useranswer')
                .where({
                    question_id: questionId,
                    result_id: resultId
                })
                .update({
                    selected_options: JSON.stringify(optionIds),
                    option_id: optionIds[0] || null, // Lưu option đầu tiên vào option_id cho tương thích ngược
                    
                });

            return { success: true };
        } catch (error) {
            console.error('Error updating multi choice answers:', error);
            return { error: error.message };
        }
    },

    async getMultiChoiceAnswers(questionId, resultId) {
        try {
            const answer = await db('useranswer')
                .where({
                    question_id: questionId,
                    result_id: resultId
                })
                .first();

            if (!answer || !answer.selected_options) {
                return [];
            }

            // Parse JSON string to array
            let selectedOptions;
            try {
                selectedOptions = JSON.parse(answer.selected_options);
            } catch (e) {
                selectedOptions = [];
            }

            return Array.isArray(selectedOptions) ? selectedOptions : [];
        } catch (error) {
            console.error('Error fetching multi choice answers:', error);
            return [];
        }
    }

}