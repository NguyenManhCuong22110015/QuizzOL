import db from '../configs/db.js';

export default {
    // Get all quizzes
    getAllQuizzes() {
        return db('quiz').select('*');
    },

    // Get a quiz by ID
    getQuizById(quizId) {
        return db('quiz').select('*').where('id', quizId).first();
    },

    // Add a new quiz
    addQuiz(quiz) {
        return db('quiz').insert(quiz);
    },

    // Update a quiz by ID
    updateQuiz(quizId, quizData) {
        return db('quiz').where('id', quizId).update(quizData);
    },

    // Delete a quiz by ID
    deleteQuiz(quizId) {
        return db('quiz').where('id', quizId).del();
    },

    async getQuizzesByCategoryId(categoryId) {
        try {
            const quizzes = await db('quiz')
                .select('quiz.*')
                .where('quiz.category', categoryId);
                
            if (!quizzes || quizzes.length === 0) {
                return [];
            }
            
            const quizIds = quizzes.map(quiz => quiz.id);
            
            const mediaResults = await db('media')
                .select('id', 'url')
                .whereIn('id', quizzes.map(quiz => quiz.media).filter(Boolean));
                
            const mediaMap = mediaResults.reduce((map, item) => {
                map[item.id] = item.url;
                return map;
            }, {});
            
            const questionCounts = await db('quiz_question')
                .select('quiz_id')
                .count('question_id as count')
                .whereIn('quiz_id', quizIds)
                .groupBy('quiz_id');
                
            const questionCountMap = questionCounts.reduce((map, item) => {
                map[item.quiz_id] = item.count;
                return map;
            }, {});
            
            return quizzes.map(quiz => ({
                ...quiz,
                imageUrl: quiz.media && mediaMap[quiz.media] 
                    ? mediaMap[quiz.media] 
                    : 'https://placehold.co/600x400?text=Quiz&bg=f0f4f8',
                numberOfQuestions: questionCountMap[quiz.id] || 0
            }));
        } catch (error) {
            console.error('Error in getQuizzesByCategoryId:', error);
            return [];
        }
    },

    async getFullQuizDetails(quizId) {
        try {
            // Get basic quiz info
            const quiz = await db('quiz')
                .select('id', 'title')
                .where('quiz.id', quizId)
                .first();
                
            if (!quiz) {
                return null;
            }
            
            if (quiz.media) {
                const media = await db('media')
                    .select('url')
                    .where('id', quiz.media)
                    .first();
                    
                quiz.imageUrl = media ? media.url : null;
            }
            
            const questionIds = await db('quiz_question')
                .select('question_id')
                .where('quiz_id', quizId);
                
            const questions = await db('question')
                .select('*')
                .whereIn('id', questionIds.map(q => q.question_id));
                
            const questionMediaIds = questions
                .map(q => q.img_url)
                .filter(Boolean);
                
            const mediaResults = await db('media')
                .select('id', 'url')
                .whereIn('id', questionMediaIds);
               
            const mediaMap = mediaResults.reduce((map, item) => {
                map[item.id] = item.url;
                return map;
            }, {});
            for (const question of questions) {
                if (question.img_url && mediaMap[question.img_url]) {
                    question.imageUrl = mediaMap[question.img_url];
                } else {
                    question.imageUrl = null;
                }
                
                const options = await db('option')
                    .select('*')
                    .where('question_id', question.id);
                    
                question.options = options;
            }
            
            quiz.questions = questions;
            quiz.questionCount = questions.length;
            
            return quiz;
        } catch (error) {
            console.error('Error in getFullQuizDetails:', error);
            return null;
        }
    }
};