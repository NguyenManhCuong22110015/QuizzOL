import db from '../configs/db.js';

export default {
    // Get all quizzes
    async getAllQuizzes() {
        return db('quiz').select('*');
    },

    // Get a quiz by ID
    async getQuizById(quizId) {
        return db('quiz').select('*').where('id', quizId).first();
    },

    // Add a new quiz
    async insertQuiz(quiz) {
        const [id] = await db('quiz').insert(quiz);
        return id;
    },

    // Insert media and update quiz with media id
    async insertMediaForQuiz(imageUrl, public_id) {
        const [mediaId] = await db('media').insert({ 
            url: imageUrl, 
            resource_type: 'IMAGE', 
            public_id: public_id 
        });
        return mediaId;
    },

    // Update quiz media
    async updateQuizMedia(quizId, mediaId) {
        return db('quiz').where('id', quizId).update({ media: mediaId });
    },

    // Update a quiz by ID
    async updateQuiz(quizId, quizData) {
        return db('quiz').where('id', quizId).update(quizData);
    },
    
    // Get question IDs for a quiz
    async getQuestionIdsForQuiz(quizId, trx = null) {
        const dbToUse = trx || db;
        return dbToUse('quiz_question')
            .where('quiz_id', quizId)
            .pluck('question_id');
    },
    
    // Get result IDs for a quiz
    async getResultIdsForQuiz(quizId, trx = null) {
        const dbToUse = trx || db;
        return dbToUse('result')
            .where('quiz', quizId)
            .pluck('id');
    },
    
    // Get room IDs for a quiz
    async getRoomIdsForQuiz(quizId, trx = null) {
        const dbToUse = trx || db;
        return dbToUse('room')
            .where('quiz', quizId)
            .pluck('id');
    },
    
    // Delete ranks by result IDs
    async deleteRanksByResultIds(resultIds, trx = null) {
        if (!resultIds.length) return 0;
        const dbToUse = trx || db;
        return dbToUse('rank')
            .whereIn('result', resultIds)
            .del();
    },
    
    // Delete user answers by question IDs
    async deleteUserAnswersByQuestionIds(questionIds, trx = null) {
        if (!questionIds.length) return 0;
        const dbToUse = trx || db;
        return dbToUse('useranswer')
            .whereIn('question_id', questionIds)
            .del();
    },
    
    // Delete quiz question mappings
    async deleteQuizQuestionMappings(quizId, trx = null) {
        const dbToUse = trx || db;
        return dbToUse('quiz_question')
            .where('quiz_id', quizId)
            .del();
    },
    
    // Count usage of a question
    async countQuestionUsage(questionId, trx = null) {
        const dbToUse = trx || db;
        const result = await dbToUse('quiz_question')
            .where('question_id', questionId)
            .count('* as count')
            .first();
        return result.count;
    },
    
    // Delete options for a question
    async deleteOptionsByQuestionId(questionId, trx = null) {
        const dbToUse = trx || db;
        return dbToUse('option')
            .where('question_id', questionId)
            .del();
    },
    
    // Delete a question
    async deleteQuestionById(questionId, trx = null) {
        const dbToUse = trx || db;
        return dbToUse('question')
            .where('id', questionId)
            .del();
    },
    
    // Delete quiz tags
    async deleteQuizTags(quizId, trx = null) {
        const dbToUse = trx || db;
        return dbToUse('quiz_tag')
            .where('quiz_id', quizId)
            .del();
    },
    
    // Delete quiz results
    async deleteQuizResults(quizId, trx = null) {
        const dbToUse = trx || db;
        return dbToUse('result')
            .where('quiz', quizId)
            .del();
    },
    
    // Delete quiz ratings
    async deleteQuizRatings(quizId, trx = null) {
        const dbToUse = trx || db;
        return dbToUse('rate')
            .where('quiz', quizId)
            .del();
    },
    
    // Delete quiz reports
    async deleteQuizReports(quizId, trx = null) {
        const dbToUse = trx || db;
        return dbToUse('report')
            .where('quiz', quizId)
            .del();
    },
    
    // Delete room users
    async deleteRoomUsers(roomIds, trx = null) {
        if (!roomIds.length) return 0;
        const dbToUse = trx || db;
        return dbToUse('room_user')
            .whereIn('room_id', roomIds)
            .del();
    },
    
    // Delete rooms
    async deleteRooms(quizId, trx = null) {
        const dbToUse = trx || db;
        return dbToUse('room')
            .where('quiz', quizId)
            .del();
    },
    
    // Delete quiz comments
    async deleteQuizComments(quizId, trx = null) {
        const dbToUse = trx || db;
        return dbToUse('comment')
            .where('quiz', quizId)
            .del();
    },
    
    // Delete the quiz itself
    async deleteQuizById(quizId, trx = null) {
        const dbToUse = trx || db;
        return dbToUse('quiz')
            .where('id', quizId)
            .del();
    },

    // Get quizzes by category
    async getQuizzesByCategory(categoryId) {
        return db('quiz')
            .select('quiz.*')
            .where('quiz.category', categoryId);
    },
    
    // Get media by IDs
    async getMediaByIds(mediaIds) {
        if (!mediaIds.length) return [];
        return db('media')
            .select('id', 'url')
            .whereIn('id', mediaIds);
    },
    
    // Get question counts by quiz IDs
    async getQuestionCountsByQuizIds(quizIds) {
        if (!quizIds.length) return [];
        return db('quiz_question')
            .select('quiz_id')
            .count('question_id as count')
            .whereIn('quiz_id', quizIds)
            .groupBy('quiz_id');
    },

    // Get full quiz details
    async getQuizDetails(quizId) {
        return db('quiz')
            .select('id', 'title')
            .where('quiz.id', quizId)
            .first();
    },
    
    // Get media for a quiz
    async getMediaForQuiz(mediaId) {
        return db('media')
            .select('url')
            .where('id', mediaId)
            .first();
    },
    
    // Get questions for a quiz
    async getQuestionsForQuiz(questionIds) {
        if (!questionIds.length) return [];
        return db('question')
            .select('*')
            .whereIn('id', questionIds);
    },
    
    // Get options for a question
    async getOptionsForQuestion(questionId) {
        return db('option')
            .select('*')
            .where('question_id', questionId);
    },

    // Add question to quiz
    async addQuestionToQuiz(quizId, questionId) {
        return db('quiz_question').insert({
            quiz_id: quizId,
            question_id: questionId
        });
    },

    // Search quizzes
    async searchQuizzes(searchTerm) {
        return db('quiz')
            .select('quiz.*')
            .where('quiz.title', 'like', `%${searchTerm}%`)
            .orWhere('quiz.description', 'like', `%${searchTerm}%`);
    },

    // Get quiz page details
    async getQuizPageBasicInfo(quizId) {
        return db('quiz')
            .leftJoin('media', 'quiz.media', 'media.id')
            .leftJoin('user', 'quiz.createdBy', 'user.id')
            .leftJoin('category', 'quiz.category', 'category.id')
            .select(
                'quiz.id',
                'quiz.title',
                'quiz.description',
                'quiz.time as quizTimeField',
                'quiz.createdBy',
                'user.username as creatorUsername',
                'category.name as categoryName',
                'media.url as coverImageUrl'
            )
            .where('quiz.id', quizId)
            .first();
    },
    
    // Get quiz questions
    async getQuizQuestions(quizId) {
        return db('quiz_question')
            .join('question', 'quiz_question.question_id', 'question.id')
            .where('quiz_question.quiz_id', quizId)
            .select('question.id', 'question.content', 'question.points');
    },
    
    // Get quiz tags
    async getQuizTags(quizId) {
        return db('quiz_tag')
            .join('tag', 'quiz_tag.tag_id', 'tag.id')
            .where('quiz_tag.quiz_id', quizId)
            .select('tag.id', 'tag.name');
    },
    
    // Get results stats
    async getQuizResultsStats(quizId) {
        return db('result')
            .where('quiz', quizId)
            .andWhere('status', 'COMPLETED')
            .countDistinct('user as playerCount')
            .first();
    },
    
    // Get rating stats
    async getQuizRatingStats(quizId) {
        return db('rate')
            .where('quiz', quizId)
            .select(
                db.raw('COALESCE(AVG(score), 0) as averageRating'),
                db.raw('COUNT(score) as ratingCount')
            )
            .first();
    },
    
    // Get quiz comments
    async getQuizComments(quizId) {
        return db('comment')
            .join('user', 'comment.user', 'user.id')
            .leftJoin('media', 'user.avatar', 'media.id')
            .where('comment.quiz', quizId)
            .select(
                'comment.id',
                'comment.message',
                'user.username as authorUsername',
                'media.url as authorAvatarUrl'
            )
            .orderBy('comment.id', 'desc');
    },
    
    // Get leaderboard
    async getQuizLeaderboard(quizId, limit = 5) {
        return db('result')
            .join('user', 'result.user', 'user.id')
            .where('result.quiz', quizId)
            .andWhere('result.status', 'COMPLETED')
            .select(
                'user.username',
                'result.score',
                'result.start_time',
                'result.end_time'
            )
            .orderBy('result.score', 'desc')
            .orderByRaw('TIMESTAMPDIFF(SECOND, result.start_time, result.end_time) asc')
            .limit(limit);
    },

    // Get quizzes with details
    async getQuizzesWithDetails(userId = null) {
        const query = db('quiz')
            .select(
                'quiz.id',
                'quiz.title',
                'quiz.description',
                'quiz.time as created_at',
                'quiz.media',
                'media.url as mediaUrl',
                'category.name as categoryName',
                db.raw('GROUP_CONCAT(DISTINCT tag.name) as tagsString')
            )
            .leftJoin('category', 'quiz.category', 'category.id')
            .leftJoin('media', 'quiz.media', 'media.id')
            .leftJoin('quiz_tag', 'quiz.id', 'quiz_tag.quiz_id')
            .leftJoin('tag', 'quiz_tag.tag_id', 'tag.id')
            .groupBy('quiz.id');

        if (userId) {
            query.where('quiz.createdBy', userId);
        }

        return query;
    },
    
    // Begin a transaction
    async beginTransaction() {
        return db.transaction();
    }
};