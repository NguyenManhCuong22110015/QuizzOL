import answerRepository from "../repositories/answerRepository.js";
export default {
    getAnswersByQuestionId(questionId) {
        return answerRepository.findByQuestionId(questionId);
    },
    
    // Insert options for a single question.
    async addOptionsForQuestion(questionId, options) {
        const preparedOptions = options.map(opt => ({
            question_id: questionId,
            content: opt.content,
            isCorrect: opt.isCorrect
        }));
        
        await answerRepository.insertOptions(preparedOptions);
    },


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
        // Updated to use repository instead of direct DB access
        return answerRepository.deleteByQuestionId(questionId);
    }
};