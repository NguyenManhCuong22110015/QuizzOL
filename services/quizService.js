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
    }
};
