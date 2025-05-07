import db from '../configs/db.js';

import dayjs from 'dayjs';
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
    async deleteQuiz(quizId) {
        return await db.transaction(async (trx) => {
            try {
                // Get all question IDs associated with this quiz
                const questionIds = await trx('quiz_question')
                    .where('quiz_id', quizId)
                    .pluck('question_id');

                // Get all result IDs for this quiz
                const resultIds = await trx('result')
                    .where('quiz', quizId)
                    .pluck('id');

                // Get all room IDs using this quiz
                const roomIds = await trx('room')
                    .where('quiz', quizId)
                    .pluck('id');

                // 1. First delete rank entries that reference results
                if (resultIds.length > 0) {
                    await trx('rank')
                        .whereIn('result', resultIds)
                        .del();
                }

                // 2. Delete user answers for these questions
                if (questionIds.length > 0) {
                    await trx('useranswer')
                        .whereIn('question_id', questionIds)
                        .del();
                }

                // 3. Delete quiz-question mappings
                await trx('quiz_question')
                    .where('quiz_id', quizId)
                    .del();

                // 4. Delete questions that are only used by this quiz
                for (const questionId of questionIds) {
                    const usageCount = await trx('quiz_question')
                        .where('question_id', questionId)
                        .count('* as count')
                        .first();
                    
                    if (usageCount.count === 0) {
                        // Delete options for this question
                        await trx('option')
                            .where('question_id', questionId)
                            .del();
                        
                        // Delete the question itself
                        await trx('question')
                            .where('id', questionId)
                            .del();
                    }
                }

                // 5. Delete quiz tags
                await trx('quiz_tag')
                    .where('quiz_id', quizId)
                    .del();

                // 6. Delete results (now safe since ranks are deleted)
                await trx('result')
                    .where('quiz', quizId)
                    .del();

                // 7. Delete ratings
                await trx('rate')
                    .where('quiz', quizId)
                    .del();

                // 8. Delete reports
                await trx('report')
                    .where('quiz', quizId)
                    .del();

                // 9. Delete room_user entries first
                if (roomIds.length > 0) {
                    await trx('room_user')
                        .whereIn('room_id', roomIds)
                        .del();
                }

                // 10. Now safe to delete rooms
                await trx('room')
                    .where('quiz', quizId)
                    .del();

                // 11. Delete comments
                await trx('comment')
                    .where('quiz', quizId)
                    .del();

                // Finally, delete the quiz itself
                await trx('quiz')
                    .where('id', quizId)
                    .del();

                return { success: true, message: 'Quiz and all related data deleted successfully' };

            } catch (error) {
                console.error('Error in deleteQuiz transaction:', error);
                throw error;
            }
        });
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
    },

    async addQuestionToQuiz(quizId, questionId) {
        try {
            return await db('quiz_question').insert({
                quiz_id: quizId,
                question_id: questionId
            });
        } catch (error) {
            console.error('Error in addQuestionToQuiz:', error);
            throw error;
        }
    },
    async updateQuiz(quizId, quizData) {
        try {
            // Make sure all fields are properly sanitized
            return await db('quiz').where('id', quizId).update(quizData);
        } catch (error) {
            console.error('Error in updateQuiz:', error);
            throw error;
        }
    },
    async searchQuizzes(searchTerm) {
        try {
            const quizzes = await db('quiz')
                .select('quiz.*')
                .where('quiz.title', 'like', `%${searchTerm}%`)
                .orWhere('quiz.description', 'like', `%${searchTerm}%`);
                
            if (!quizzes || quizzes.length === 0) {
                return [];
            }
            
            // Lấy thêm thông tin về media và số lượng câu hỏi
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
            console.error('Error in searchQuizzes:', error);
            return [];
        }
    },

    async getQuizPageDetails(quizId) {
    try {
        // --- Basic Quiz Info ---
        const quiz = await db('quiz')
            .leftJoin('media', 'quiz.media', 'media.id')
            .leftJoin('user', 'quiz.createdBy', 'user.id') // Join user table for creator info if needed
            .leftJoin('category', 'quiz.category', 'category.id') // Join category if needed
            .select(
                'quiz.id',
                'quiz.title',
                'quiz.description',
                'quiz.time as quizTimeField', // Raw time field from quiz table (purpose unclear for duration)
                'quiz.createdBy',
                'user.username as creatorUsername', // Example: get creator username
                'category.name as categoryName', // Example: get category name
                'media.url as coverImageUrl'
            )
            .where('quiz.id', quizId)
            .first();

        if (!quiz) {
            return null; // Quiz not found
        }

        // --- Questions ---
        const questions = await db('quiz_question')
            .join('question', 'quiz_question.question_id', 'question.id')
            .where('quiz_question.quiz_id', quizId)
            .select('question.id', 'question.content', 'question.points'); // Add other fields if needed
        const questionCount = questions.length;
        // Estimate time based on question count (e.g., 20 seconds per question)
        const estimatedMinutes = Math.ceil((questionCount * 20) / 60);


        // --- Tags ---
        const tags = await db('quiz_tag')
            .join('tag', 'quiz_tag.tag_id', 'tag.id')
            .where('quiz_tag.quiz_id', quizId)
            .select('tag.id', 'tag.name');

        // --- Stats: Player Count & Average Rating ---
        const resultsStats = await db('result')
            .where('quiz', quizId)
            .andWhere('status', 'COMPLETED') // Only count completed attempts
            .countDistinct('user as playerCount')
            .first();
        const playerCount = resultsStats ? Number(resultsStats.playerCount) : 0;

        const ratingStats = await db('rate')
            .where('quiz', quizId)
            .select(
            db.raw('COALESCE(AVG(score), 0) as averageRating'),
            db.raw('COUNT(score) as ratingCount')
            )
            .first();

        // Ensure rating is a number, default to 0, and round it to one decimal place
        const rating = Math.round((Math.max(0, Math.min(5, parseFloat(ratingStats?.averageRating || 0))) + Number.EPSILON) * 10) / 10;
        const ratingCount = parseInt(ratingStats?.ratingCount || 0, 10);

        // --- Comments ---
        // NOTE: Comment table schema lacks timestamp. Fetching user info.
        const comments = await db('comment')
            .join('user', 'comment.user', 'user.id')
            .leftJoin('media', 'user.avatar', 'media.id') // Join for user avatar
            .where('comment.quiz', quizId)
            .select(
                'comment.id',
                'comment.message',
                'user.username as authorUsername',
                'media.url as authorAvatarUrl'
                // 'comment.created_at' // This field is missing in the provided schema!
            )
            .orderBy('comment.id', 'desc'); // Assuming higher ID = newer comment

        // Process comments to add initials if no avatar
        comments.forEach(comment => {
            comment.authorInitials = comment.authorUsername ? comment.authorUsername.charAt(0).toUpperCase() : '?';
            // comment.relativeTime = comment.created_at ? dayjs(comment.created_at).fromNow() : ''; // Can't do this
        });


        // --- Leaderboard (Top 5) ---
        const leaderboard = await db('result')
            .join('user', 'result.user', 'user.id')
            .where('result.quiz', quizId)
            .andWhere('result.status', 'COMPLETED')
            .select(
                'user.username',
                'result.score',
                'result.start_time',
                'result.end_time'
            )
            .orderBy('result.score', 'desc') // Highest score first
            .orderByRaw('TIMESTAMPDIFF(SECOND, result.start_time, result.end_time) asc') // Fastest time first for ties
            .limit(5);

        // Calculate duration for leaderboard entries
        leaderboard.forEach(entry => {
            const startTime = dayjs(entry.start_time);
            const endTime = dayjs(entry.end_time);
            const duration = endTime.diff(startTime, 'second');
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;
            entry.timeTakenFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            // You might want to calculate score percentage if needed, e.g. based on total points
            // const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
            // entry.scoreFormatted = totalPoints > 0 ? `${entry.score}/${totalPoints}` : `${entry.score}`;
            entry.scoreFormatted = `${entry.score}`; // Using raw score for now
        });


        // --- Construct the final data object ---
        return {
            quiz: {
                id: quiz.id,
                title: quiz.title,
                description: quiz.description,
                coverImageUrl: quiz.coverImageUrl || null, //'https://placehold.co/600x300/3498db/FFFFFF?text=Quiz+Image', // Default image
                tags: tags,
                // quizTimeField: quiz.quizTimeField // Include if needed, purpose unclear
            },
            stats: {
                playerCount: playerCount,
                averageRating: rating,
                questionCount: questionCount,
                estimatedMinutes: estimatedMinutes // Using estimated time for the 'time' stat
            },
            rating: {
               average: rating,
               count: ratingCount,
               // You'll need a Handlebars helper to convert this number to stars
               // Example: fullStars: Math.floor(averageRating), halfStar: (averageRating % 1 >= 0.5) ? 1 : 0 ...
            },
            comments: comments,
            leaderboard: leaderboard
        };

    } catch (error) {
        console.error(`Error fetching quiz details for ID ${quizId}:`, error);
        // Depending on your app structure, you might throw the error
        // or return a specific error object or null.
        throw error;
    }
    },

    async getQuizzesWithDetails(userId) {
        try {
            // Get quizzes with related data
            const quizzes = await db('quiz')
            .where('quiz.createdBy', userId)
                .select(
                    'quiz.id',
                    'quiz.title',
                    'quiz.description',
                    'quiz.time as created_at',
                    'quiz.media',
                    'category.name as categoryName',
                    db.raw('GROUP_CONCAT(DISTINCT tag.name) as tagsString')
                )
                .leftJoin('category', 'quiz.category', 'category.id')
                .leftJoin('quiz_tag', 'quiz.id', 'quiz_tag.quiz_id')
                .leftJoin('tag', 'quiz_tag.tag_id', 'tag.id')
                .groupBy('quiz.id');

            // Format each quiz
            const formattedQuizzes = quizzes.map((quiz, index) => {
                const createdDate = new Date(quiz.created_at);
                const now = new Date();
                const diffTime = Math.abs(now - createdDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                return {
                    id: quiz.id,
                    rowNumber: index + 1,
                    title: quiz.title,
                    description: quiz.description,
                    categoryName: quiz.categoryName || 'Uncategorized',
                    tagsString: quiz.tagsString || '',
                    imageUrl: quiz.media ? `/media/${quiz.media}` : 'https://placehold.co/40x40/e1e1e1/909090?text=Q',
                    formattedCreatedAt: createdDate.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit'
                    }),
                    relativeUpdatedAt: diffDays === 0 ? 'today' : 
                                     diffDays === 1 ? 'yesterday' :
                                     `${diffDays} days ago`
                };
            });

            return formattedQuizzes;
        } catch (error) {
            console.error('Error in getQuizzesWithDetails:', error);
            throw error;
        }
    }
};