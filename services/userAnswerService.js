import userAnswerRepository from '../repositories/userAnswerRepository.js';

export default {
    /**
     * Add a user answer for a single-choice question
     * @param {number} questionId - Question ID
     * @param {number} resultId - Result ID
     * @param {number} answerId - Option ID for the answer
     * @returns {Promise<boolean|object>} - Success status or error object
     */
    async addUserAnswer(questionId, resultId, answerId) {
        try {
            // Check if answer already exists
            const existing = await userAnswerRepository.findUserAnswer(questionId, resultId);

            if (existing) {
                // Update existing answer
                return await this.updateUserAnswer(questionId, resultId, answerId);
            }

            // Create new answer
            await userAnswerRepository.insertUserAnswer({
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

    /**
     * Update a user answer for a single-choice question
     * @param {number} questionId - Question ID
     * @param {number} resultId - Result ID
     * @param {number} answerId - Option ID for the answer
     * @returns {Promise<object>} - Success status object
     */
    async updateUserAnswer(questionId, resultId, answerId) {
        try {
            // Check if answer exists
            const existing = await userAnswerRepository.findUserAnswer(questionId, resultId);

            if (!existing) {
                // If not found, return an object with notFound flag
                return { notFound: true };
            }

            // Update the answer
            await userAnswerRepository.updateUserAnswer(questionId, resultId, {
                option_id: answerId,
            });

            return { success: true };
        } catch (error) {
            console.error('Error updating user answer:', error);
            return { error: error.message };
        }
    },

    /**
     * Add a user answer for a text input question
     * @param {number} questionId - Question ID
     * @param {number} resultId - Result ID
     * @param {string} textAnswer - Text answer
     * @returns {Promise<boolean>} - Success status
     */
    async addTextAnswer(questionId, resultId, textAnswer) {
        try {
            // Check if answer already exists
            const existing = await userAnswerRepository.findUserAnswer(questionId, resultId);

            if (existing) {
                // Update existing answer
                return await this.updateTextAnswer(questionId, resultId, textAnswer);
            }

            // Create new answer
            await userAnswerRepository.insertUserAnswer({
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

    /**
     * Update a user answer for a text input question
     * @param {number} questionId - Question ID
     * @param {number} resultId - Result ID
     * @param {string} textAnswer - Text answer
     * @returns {Promise<boolean>} - Success status
     */
    async updateTextAnswer(questionId, resultId, textAnswer) {
        try {
            // Check if answer exists
            const existing = await userAnswerRepository.findUserAnswer(questionId, resultId);

            if (!existing) {
                // If not found, return false
                return false;
            }

            // Update the answer
            await userAnswerRepository.updateUserAnswer(questionId, resultId, {
                text_answer: textAnswer,
            });

            return true;
        } catch (error) {
            console.error('Error updating text answer:', error);
            return false;
        }
    },
    
    /**
     * Add a user answer for a multi-choice question
     * @param {number} questionId - Question ID
     * @param {number} resultId - Result ID
     * @param {Array<number>} optionIds - Array of selected option IDs
     * @returns {Promise<boolean>} - Success status
     */
    async addMultiChoiceAnswers(questionId, resultId, optionIds) {
        try {
            // Validate input
            if (!Array.isArray(optionIds) || optionIds.length === 0) {
                return false;
            }

            // Check if answer already exists
            const existingAnswer = await userAnswerRepository.findUserAnswer(questionId, resultId);

            if (existingAnswer) {
                // If exists, update
                await userAnswerRepository.updateUserAnswer(questionId, resultId, {
                    selected_options: JSON.stringify(optionIds),
                    option_id: optionIds[0], // Store first option in option_id for backward compatibility
                });
            } else {
                // If not exists, create new
                await userAnswerRepository.insertUserAnswer({
                    question_id: questionId,
                    result_id: resultId,
                    option_id: optionIds[0], // Store first option in option_id for backward compatibility
                    selected_options: JSON.stringify(optionIds),
                });
            }

            return true;
        } catch (error) {
            console.error('Error adding multi choice answers:', error);
            return false;
        }
    },

    /**
     * Update a user answer for a multi-choice question
     * @param {number} questionId - Question ID
     * @param {number} resultId - Result ID
     * @param {Array<number>} optionIds - Array of selected option IDs
     * @returns {Promise<object>} - Success status object
     */
    async updateMultiChoiceAnswers(questionId, resultId, optionIds) {
        try {
            // Check if answer exists
            const existingAnswer = await userAnswerRepository.findUserAnswer(questionId, resultId);

            if (!existingAnswer) {
                return { notFound: true };
            }

            // Update the answer
            await userAnswerRepository.updateUserAnswer(questionId, resultId, {
                selected_options: JSON.stringify(optionIds),
                option_id: optionIds[0] || null, // Store first option in option_id for backward compatibility
            });

            return { success: true };
        } catch (error) {
            console.error('Error updating multi choice answers:', error);
            return { error: error.message };
        }
    },

    /**
     * Get user answers for a multi-choice question
     * @param {number} questionId - Question ID
     * @param {number} resultId - Result ID
     * @returns {Promise<Array>} - Array of selected option IDs
     */
    async getMultiChoiceAnswers(questionId, resultId) {
        try {
            const answer = await userAnswerRepository.findUserAnswer(questionId, resultId);

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
    },
    
    /**
     * Check if an answer is correct
     * @param {number} questionId - Question ID
     * @param {number} optionId - Selected option ID
     * @returns {Promise<boolean>} - Whether answer is correct
     */
    async isAnswerCorrect(questionId, optionId) {
        try {
            const correctOptions = await userAnswerRepository.getCorrectOptionsForQuestion(questionId);
            return correctOptions.some(option => option.id === optionId);
        } catch (error) {
            console.error('Error checking if answer is correct:', error);
            return false;
        }
    },
    
    /**
     * Calculate score for a result
     * @param {number} resultId - Result ID
     * @returns {Promise<number>} - Total score
     */
    async calculateScore(resultId) {
        try {
            const answers = await userAnswerRepository.findAnswersByResultId(resultId);
            let totalScore = 0;
            
            for (const answer of answers) {
                // For single choice answers
                if (answer.option_id) {
                    const isCorrect = await this.isAnswerCorrect(answer.question_id, answer.option_id);
                    if (isCorrect) {
                        totalScore += 1;
                    }
                }
                
                // For multi-choice answers
                if (answer.selected_options) {
                    try {
                        const selectedOptions = JSON.parse(answer.selected_options);
                        const correctOptions = await userAnswerRepository.getCorrectOptionsForQuestion(answer.question_id);
                        const correctOptionIds = correctOptions.map(opt => opt.id);
                        
                        // All selected options must be correct and all correct options must be selected
                        if (selectedOptions.length === correctOptionIds.length && 
                            selectedOptions.every(opt => correctOptionIds.includes(opt))) {
                            totalScore += 1;
                        }
                    } catch (e) {
                        console.error('Error parsing selected options:', e);
                    }
                }
            }
            
            return totalScore;
        } catch (error) {
            console.error('Error calculating score:', error);
            return 0;
        }
    }
}