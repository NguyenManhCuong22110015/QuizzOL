import db from '../configs/db.js';

export default {

    getAnswersByQuestionId(questionId) {
        // Changed from 'question_option' to 'option' to match your schema
        return db('option').select('*').where('question_id', questionId);
    },
    
    // Insert options for a single question.
    async addOptionsForQuestion(questionId, options) {
        const preparedOptions = options.map(opt => ({
            question_id: questionId,
            content: opt.content,
            isCorrect: opt.isCorrect
        }));
        // Bulk insert options. (Note: .returning() is optional based on your DB.)
        await db('option').insert(preparedOptions);
    },

    /* 
       Insert options for all questions.
       Parameters:
         originalQuestions - the array from req.body (each question has an "option" property)
         insertedQuestions - the array returned from inserting the questions (each contains a generated id)
       This function robustly matches questions by comparing key fields.
    */
    async addOptionsForAllQuestions(originalQuestions, insertedQuestions) {
        // Make a shallow copy of insertedQuestions for matching and removal
        const unmatchedInserted = [...insertedQuestions];
        for (const original of originalQuestions) {
            // Find a matching inserted question by comparing key properties.
            // You can adjust the criteria as needed.
            const index = unmatchedInserted.findIndex((inserted) => {
                return inserted.content === original.content &&
                       inserted.type === original.type &&
                       (inserted.img_url || null) === (original.img_url || null) &&
                       inserted.points === original.points;
            });
            if (index !== -1) {
                const matched = unmatchedInserted[index];
                // Remove the matched question to avoid duplicate matching.
                unmatchedInserted.splice(index, 1);
                if (original.option && original.option.length > 0) {
                    await this.addOptionsForQuestion(matched.id, original.option);
                }
            } else {
                console.error("No matching inserted question found for:", original);
            }
        }
    },


    // Delete all answers for a question
    deleteAnswersByQuestionId(questionId) {
        return db('question_option').where('question_id', questionId).del();
    }
};