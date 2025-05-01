import db from '../configs/db.js';

export default {
    getResultById(resultId) {
        return db('result').select('*').where('id', resultId).first();
    },
    async checkExistResult(quizId, userId){
        try {
            const res = await db('result').select('*').where({ quiz: quizId, user: userId, status: "IN_PROGRESS" }).first();
            if (res){
                const userAnswers = await db('userAnswer')
                .select('*')
                .where({ result_id: res.id });
                
                return {
                    result: res,
                    userAnswers: userAnswers || [],
                };
            }
            else {
                return null;
            }

        }
        catch (error) {
            console.error('Error checking answer or creating new:', error);
            return null;
        }
    },
    async createResult(quizId, userId) {
        try {
            // First verify the user exists to prevent foreign key constraint errors
            const userExists = await db('user').where('id', userId).first();
            if (!userExists) {
                console.error(`Cannot create result: User with ID ${userId} does not exist`);
                return null;
            }
            
            // Insert the result record
            const [insertId] = await db('result').insert({
                quiz: quizId,
                user: userId,
                status: "IN_PROGRESS",
                start_time: new Date(),
                end_time: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
            });
            
            // Fetch the inserted record to return
            const result = await db('result').where('id', insertId).first();
            return result;
        } catch (error) {
            console.error('Error creating new result:', error);
            return null;
        }
    },
    
    async updateResult(resultId, data) {
        try {
            // Update the record
            await db('result').where('id', resultId).update(data);
            
            // Fetch and return the updated record
            const result = await db('result').where('id', resultId).first();
            return result;
        } catch (error) {
            console.error('Error updating result:', error);
            return null;
        }
    },
    async completeResult(resultId) {
        try {
            // Update the result status to COMPLETED
            await db('result').where('id', resultId).update({
                status: 'COMPLETED',
                end_time: new Date(),
            });
            
            // Fetch and return the updated record
            const result = await db('result').where('id', resultId).first();
            return result;
        } catch (error) {
            console.error('Error completing result:', error);
            return null;
        }
    },
    async calculateScore(resultId) {
        try {
            const result = await db('result').where('id', resultId).first();
            if (!result) {
                console.error(`Result with ID ${resultId} not found`);
                return null;
            }
            
            const userAnswers = await db('userAnswer').where('result_id', resultId);
            let score = 0;
            
            for (const answer of userAnswers) {
                // Get the correct option for this question
                const correctOption = await db('option').where({ 
                    question_id: answer.question_id, 
                    isCorrect: true 
                }).first();
                
                // Get the question to access its point value
                const question = await db('question').where('id', answer.question_id).first();
                
                // Default to 1 point if no point value is specified
                const pointValue = question && question.points ? question.points : 1;
                
                // Add points if the answer is correct
                if (correctOption && answer.option_id === correctOption.id) {
                    score += pointValue; // Add the question's point value
                }
            }
            
            // Update the result with the calculated score
            await db('result').where('id', resultId).update({ score });
            
            return score;
        } catch (error) {
            console.error('Error calculating score:', error);
            return null;
        }
    },
    async getUserAnswersByResultId(resultId) {
        try {
            const answers = await db('userAnswer').where('result_id', resultId);
            return answers;
        } catch (error) {
            console.error('Error fetching user answers:', error);
            return null;
        }
    },
    async getResultsByUserId(userId, page = 1, limit = 5) {
        try {
            const offset = (page - 1) * limit;
            
            // Get paginated results sorted by date (newest first)
            const results = await db('result')
                .where('user', userId)
                .orderBy('end_time', 'desc')
                .limit(limit)
                .offset(offset);
            
            // Get total count for pagination
            const [{ count }] = await db('result')
                .where('user', userId)
                .count('id as count');
            
            // Enrich results with quiz details
            const enrichedResults = await Promise.all(results.map(async (result) => {
                // Get quiz info
                const quiz = await db('quiz').where('id', result.quiz).first();
                
                // Get correct/total answers count
                const userAnswers = await db('userAnswer').where('result_id', result.id);
                const totalQuestions = await db('quiz_question').where({
                    quiz_id: result.quiz,
                    
                }).count('quiz_id as count');
                const totalCount = totalQuestions[0].count;
                
                let correctCount = 0;
                
                for (const answer of userAnswers) {
                    const correctOption = await db('option')
                        .where({ 
                            question_id: answer.question_id, 
                            isCorrect: true 
                        })
                        .first();
                    
                    if (correctOption && answer.option_id === correctOption.id) {
                        correctCount++;
                    }
                }
                
                return {
                    ...result,
                    quiz: quiz || { title: 'Unknown Quiz' },
                    correctCount,
                    totalCount,
                    formattedDate: new Date(result.end_time).toLocaleDateString('vi-VN')
                };
            }));
            
            return {
                results: enrichedResults,
                pagination: {
                    page,
                    limit,
                    totalResults: parseInt(count),
                    totalPages: Math.ceil(parseInt(count) / limit)
                }
            };
        } catch (error) {
            console.error('Error fetching user results:', error);
            return {
                results: [],
                pagination: {
                    page: 1,
                    limit,
                    totalResults: 0,
                    totalPages: 0
                }
            };
        }
    },
    async getTopPlayersByCriteria(criteria, time, limit = 10) {
        try {
            // Xác định khoảng thời gian dựa trên tham số time
            const endDate = new Date();
            let startDate = new Date();
            
            switch(time) {
                case 'week':
                    startDate.setDate(endDate.getDate() - 7); // 7 ngày trước
                    break;
                case 'month':
                    startDate.setMonth(endDate.getMonth() - 1); // 1 tháng trước
                    break;
                case 'year':
                    startDate.setFullYear(endDate.getFullYear() - 1); // 1 năm trước
                    break;
                default:
                    startDate.setDate(endDate.getDate() - 7); // Mặc định là tuần
            }
            
            // Truy vấn cơ bản với join để lấy thông tin avatar
            const baseQuery = db('result')
                .where('status', 'COMPLETED')
                .whereBetween('end_time', [startDate, endDate])
                .join('user', 'result.user', '=', 'user.id')
                .leftJoin('media', 'user.avata', '=', 'media.id');
            
            let topPlayers;
            
            if (criteria === 'score') {
                // Tiêu chí tổng điểm
                topPlayers = await baseQuery
                    .select('user.id as userId', 'user.username', 'user.email', 'user.avata', 'media.url as avatarUrl')
                    .sum('result.score as totalScore')
                    .groupBy('user.id', 'user.username', 'user.email', 'user.avata', 'media.url')
                    .orderBy('totalScore', 'desc')
                    .limit(limit);
                    
                // Thêm thông tin xếp hạng
                topPlayers = topPlayers.map((player, index) => ({
                    ...player,
                    avatar: player.avatarUrl || `https://res.cloudinary.com/dj9r2qksh/image/upload/v1743576404/Quizz_Online/images/z3klhzrkoeikujya3fi9.jpg`, // URL mặc định nếu không có avatar
                    rank: index + 1,
                    criteriaValue: player.totalScore || 0
                }));
            } 
            else if (criteria === 'attend') {
                // Tiêu chí số lượng quiz hoàn thành
                topPlayers = await baseQuery
                    .select('user.id as userId', 'user.username', 'user.email', 'user.avata', 'media.url as avatarUrl')
                    .countDistinct('result.quiz as completedQuizzes')
                    .groupBy('user.id', 'user.username', 'user.email', 'user.avata', 'media.url')
                    .orderBy('completedQuizzes', 'desc')
                    .limit(limit);
                    
                // Thêm thông tin xếp hạng
                topPlayers = topPlayers.map((player, index) => ({
                    ...player,
                    avatar: player.avatarUrl || `https://res.cloudinary.com/dj9r2qksh/image/upload/v1743576404/Quizz_Online/images/z3klhzrkoeikujya3fi9.jpg`, // URL mặc định
                    rank: index + 1,
                    criteriaValue: parseInt(player.completedQuizzes) || 0
                }));
            } 
            else if (criteria === 'mean') {
                // Tiêu chí tỷ lệ điểm số trung bình
                
                // Lấy tất cả người dùng có kết quả hoàn thành và tổng điểm
                const userScores = await baseQuery
                    .select(
                        'user.id as userId', 
                        'user.username', 
                        'user.email', 
                        'user.avata',
                        'media.url as avatarUrl',
                        db.raw('SUM(result.score) as totalEarned'),
                        db.raw('COUNT(DISTINCT result.id) as quizCount')
                    )
                    .groupBy('user.id', 'user.username', 'user.email', 'user.avata', 'media.url');
                
                // Tính toán điểm tối đa có thể và tỷ lệ phần trăm cho mỗi người dùng
                const usersWithPercentages = await Promise.all(
                    userScores.map(async (user) => {
                        // Lấy tất cả kết quả hoàn thành của người dùng trong khoảng thời gian
                        const results = await db('result')
                            .where('user', user.userId)
                            .where('status', 'COMPLETED')
                            .whereBetween('end_time', [startDate, endDate]);
                        
                        let totalPossible = 0;
                        
                        // Tính điểm tối đa có thể cho mỗi kết quả
                        for (const result of results) {
                            // Lấy tất cả câu hỏi trong quiz
                            const quizQuestions = await db('quiz_question')
                                .select('question_id')
                                .where('quiz_id', result.quiz);
                            
                            if (quizQuestions.length === 0) continue;
                            
                            // Lấy giá trị điểm cho tất cả câu hỏi trong một truy vấn
                            const questionIds = quizQuestions.map(qq => qq.question_id);
                            const questions = await db('question')
                                .select('id', 'points')
                                .whereIn('id', questionIds);
                            
                            // Tính tổng giá trị điểm
                            questions.forEach(question => {
                                totalPossible += question.points || 1; // Mặc định là 1 nếu không có điểm
                            });
                        }
                        
                        // Tính tỷ lệ phần trăm (tránh chia cho 0)
                        const percentage = totalPossible > 0 
                            ? (user.totalEarned / totalPossible) * 100 
                            : 0;
                        
                        return {
                            ...user,
                            avatar: user.avatarUrl || `https://res.cloudinary.com/dj9r2qksh/image/upload/v1743576404/Quizz_Online/images/z3klhzrkoeikujya3fi9.jpg`, // Thêm URL avatar mặc định
                            percentage: parseFloat(percentage.toFixed(2)),
                            totalPossible,
                            criteriaValue: parseFloat(percentage.toFixed(2))
                        };
                    })
                );
                
                // Sắp xếp theo tỷ lệ phần trăm và lấy người chơi hàng đầu
                topPlayers = usersWithPercentages
                    .sort((a, b) => b.percentage - a.percentage)
                    .slice(0, limit)
                    .map((player, index) => ({
                        ...player,
                        rank: index + 1
                    }));
            }
            
            return {
                criteria,
                timePeriod: time,
                players: topPlayers || []
            };
        } catch (error) {
            console.error('Error fetching top players:', error);
            return {
                criteria,
                timePeriod: time,
                players: []
            };
        }
    },
};