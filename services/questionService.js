import db from '../configs/db.js';

export default {
    // Get all questions for a quiz using quiz_question mapping table
    async getQuestionsByQuizId(quizId) {
        try {
            // First get all question_ids from quiz_question mapping table
            const questionMappings = await db('quiz_question')
                .select('question_id')
                .where('quiz_id', quizId);
            
            // If no questions mapped to this quiz, return empty array
            if (!questionMappings || questionMappings.length === 0) {
                return [];
            }
            
            // Extract just the question_ids from the mapping results
            const questionIds = questionMappings.map(mapping => mapping.question_id);
            
            // Now get the actual questions using these IDs
            const questions = await db('question')
                .select('*')
                .whereIn('id', questionIds);
                
            // Get media URLs for questions that have them
            const mediaIds = questions
                .map(q => q.img_url)
                .filter(Boolean);
                
            if (mediaIds.length > 0) {
                const media = await db('media')
                    .select('id', 'url')
                    .whereIn('id', mediaIds);
                    
                const mediaMap = media.reduce((acc, m) => {
                    acc[m.id] = m.url;
                    return acc;
                }, {});
                
                // Attach media URLs to questions
                questions.forEach(question => {
                    if (question.img_url && mediaMap[question.img_url]) {
                        question.imageUrl = mediaMap[question.img_url];
                    }
                });
            }
                
            return questions;
        }
        catch(error){
            console.error('Error in getQuestionsByQuizId:', error);
            return [];
        }
    },

    // Create questions and map them to the quiz
    async addQuestions(quizId, questions) {
        return await db.transaction(async trx => {
            try {
                // Insert questions into the question table
                const questionIds = await trx('question')
                    .insert(questions)
                    .returning('id');
                
                // Prepare quiz_question mapping records
                const mappings = questionIds.map(questionId => ({
                    quiz_id: quizId,
                    question_id: questionId
                }));
                
                // Insert the mappings
                await trx('quiz_question').insert(mappings);
                
                return questionIds;
            } catch (error) {
                console.error('Error in addQuestions:', error);
                throw error;
            }
        });
    },

    // Delete all questions for a quiz
    async deleteQuestionsByQuizId(quizId) {
        return await db.transaction(async trx => {
            try {
                // First get all question IDs associated with this quiz
                const questionMappings = await trx('quiz_question')
                    .select('question_id')
                    .where('quiz_id', quizId);
                
                const questionIds = questionMappings.map(mapping => mapping.question_id);
                
                // Delete the mappings first
                await trx('quiz_question')
                    .where('quiz_id', quizId)
                    .del();
                
                // Then delete the actual questions
                if (questionIds.length > 0) {
                    await trx('question')
                        .whereIn('id', questionIds)
                        .del();
                }
                
                return true;
            } catch (error) {
                console.error('Error in deleteQuestionsByQuizId:', error);
                throw error;
            }
        });
    },

    // Delete a single question (and its mapping)
    async deleteQuestionById(questionId, quizId) {
        return await db.transaction(async trx => {
            try {
                // First delete the mapping
                await trx('quiz_question')
                    .where({
                        quiz_id: quizId,
                        question_id: questionId
                    })
                    .del();
                
                // Then delete the question itself
                await trx('question')
                    .where('id', questionId)
                    .del();
                
                return true;
            } catch (error) {
                console.error('Error in deleteQuestionById:', error);
                throw error;
            }
        });
    },
    
    // Add a new function to check if a question is used in multiple quizzes
    async isQuestionUsedInMultipleQuizzes(questionId) {
        try {
            const count = await db('quiz_question')
                .where('question_id', questionId)
                .count('* as count')
                .first();
                
            return count.count > 1;
        } catch (error) {
            console.error('Error in isQuestionUsedInMultipleQuizzes:', error);
            return false;
        }
    }
};