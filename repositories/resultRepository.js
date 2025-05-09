import db from '../configs/db.js';

export default {
    // Get a result by ID
    getResultById(resultId) {
        return db('result').select('*').where('id', resultId).first();
    },
    
    // Find existing in-progress result
    async findExistingResult(quizId, userId) {
        return db('result')
            .select('*')
            .where({ quiz: quizId, user: userId, status: "IN_PROGRESS" })
            .first();
    },
    
    // Get user answers for a result
    async getUserAnswersByResultId(resultId) {
        return db('useranswer')
            .select('*')
            .where({ result_id: resultId });
    },
    
    // Check if user exists
    async checkUserExists(userId) {
        return db('user').where('id', userId).first();
    },
    
    // Insert a new result
    async insertResult(resultData) {
        const [insertId] = await db('result').insert(resultData);
        return insertId;
    },
    
    // Update a result
    async updateResult(resultId, data) {
        return db('result').where('id', resultId).update(data);
    },
    
    // Get the question for the user answer
    async getQuestionById(questionId) {
        return db('question').where('id', questionId).first();
    },
    
    // Get the correct option for a question
    async getCorrectOptionForQuestion(questionId) {
        return db('option')
            .where({ question_id: questionId, isCorrect: true })
            .first();
    },
    
    // Get all user answers for a result
    async getUserAnswers(resultId) {
        return db('useranswer').where('result_id', resultId);
    },
    
    // Get count of questions for a quiz
    async getQuizQuestionCount(quizId) {
        const result = await db('quiz_question')
            .where('quiz_id', quizId)
            .count('quiz_id as count')
            .first();
        return result ? result.count : 0;
    },
    
    // Get quiz by ID
    async getQuizById(quizId) {
        return db('quiz').where('id', quizId).first();
    },
    
    // Get paginated results for a user
    async getPaginatedResultsByUserId(userId, limit, offset) {
        return db('result')
            .where('user', userId)
            .orderBy('end_time', 'desc')
            .limit(limit)
            .offset(offset);
    },
    
    // Count total results for a user
    async countResultsByUserId(userId) {
        const [{ count }] = await db('result')
            .where('user', userId)
            .count('id as count');
        return parseInt(count);
    },
    
    // Get top players by score
    async getTopPlayersByScore(startDate, endDate, limit) {
        return db('result')
            .where('status', 'COMPLETED')
            .whereBetween('end_time', [startDate, endDate])
            .join('user', 'result.user', '=', 'user.id')
            .leftJoin('media', 'user.avatar', '=', 'media.id')
            .select('user.id as userId', 'user.username', 'user.email', 'user.avatar', 'media.url as avatarUrl')
            .sum('result.score as totalScore')
            .groupBy('user.id', 'user.username', 'user.email', 'user.avatar', 'media.url')
            .orderBy('totalScore', 'desc')
            .limit(limit);
    },
    
    // Get top players by attendance
    async getTopPlayersByAttendance(startDate, endDate, limit) {
        return db('result')
            .where('status', 'COMPLETED')
            .whereBetween('end_time', [startDate, endDate])
            .join('user', 'result.user', '=', 'user.id')
            .leftJoin('media', 'user.avatar', '=', 'media.id')
            .select('user.id as userId', 'user.username', 'user.email', 'user.avatar', 'media.url as avatarUrl')
            .countDistinct('result.quiz as completedQuizzes')
            .groupBy('user.id', 'user.username', 'user.email', 'user.avatar', 'media.url')
            .orderBy('completedQuizzes', 'desc')
            .limit(limit);
    },
    
    // Get user scores for average calculation
    async getUserScoresInTimeRange(startDate, endDate) {
        return db('result')
            .where('status', 'COMPLETED')
            .whereBetween('end_time', [startDate, endDate])
            .join('user', 'result.user', '=', 'user.id')
            .leftJoin('media', 'user.avatar', '=', 'media.id')
            .select(
                'user.id as userId', 
                'user.username', 
                'user.email', 
                'user.avatar',
                'media.url as avatarUrl',
                db.raw('SUM(result.score) as totalEarned'),
                db.raw('COUNT(DISTINCT result.id) as quizCount')
            )
            .groupBy('user.id', 'user.username', 'user.email', 'user.avatar', 'media.url');
    },
    
    // Get all results for a user in a time range
    async getUserResultsInTimeRange(userId, startDate, endDate) {
        return db('result')
            .where('user', userId)
            .where('status', 'COMPLETED')
            .whereBetween('end_time', [startDate, endDate]);
    }
};