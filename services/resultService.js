import resultRepository from '../repositories/resultRepository.js';

export default {
    async getResultById(resultId) {
        return resultRepository.getResultById(resultId);
    },

    async checkExistResult(quizId, userId) {
        try {
            const res = await resultRepository.findExistingResult(quizId, userId);
            if (res) {
                const userAnswers = await resultRepository.getUserAnswersByResultId(res.id);
                
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
            const userExists = await resultRepository.checkUserExists(userId);
            if (!userExists) {
                console.error(`Cannot create result: User with ID ${userId} does not exist`);
                return null;
            }
            
            // Insert the result record
            const insertId = await resultRepository.insertResult({
                quiz: quizId,
                user: userId,
                status: "IN_PROGRESS",
                start_time: new Date(),
                end_time: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
            });
            
            // Fetch the inserted record to return
            const result = await resultRepository.getResultById(insertId);
            return result;
        } catch (error) {
            console.error('Error creating new result:', error);
            return null;
        }
    },
    
    async updateResult(resultId, data) {
        try {
            // Update the record
            await resultRepository.updateResult(resultId, data);
            
            // Fetch and return the updated record
            const result = await resultRepository.getResultById(resultId);
            return result;
        } catch (error) {
            console.error('Error updating result:', error);
            return null;
        }
    },

    async completeResult(resultId) {
        try {
            // Update the result status to COMPLETED
            await resultRepository.updateResult(resultId, {
                status: 'COMPLETED',
                end_time: new Date(),
            });
            
            // Fetch and return the updated record
            const result = await resultRepository.getResultById(resultId);
            return result;
        } catch (error) {
            console.error('Error completing result:', error);
            return null;
        }
    },

    async calculateScore(resultId) {
        try {
            const result = await resultRepository.getResultById(resultId);
            if (!result) {
                console.error(`Result with ID ${resultId} not found`);
                return null;
            }
            
            const userAnswers = await resultRepository.getUserAnswers(resultId);
            let score = 0;
            
            for (const answer of userAnswers) {
                // Get the correct option for this question
                const correctOption = await resultRepository.getCorrectOptionForQuestion(answer.question_id);
                
                // Get the question to access its point value
                const question = await resultRepository.getQuestionById(answer.question_id);
                
                // Default to 1 point if no point value is specified
                const pointValue = question && question.points ? question.points : 1;
                
                // Add points if the answer is correct
                if (correctOption && answer.option_id === correctOption.id) {
                    score += pointValue; // Add the question's point value
                }
            }
            
            // Update the result with the calculated score
            await resultRepository.updateResult(resultId, { score });
            
            return score;
        } catch (error) {
            console.error('Error calculating score:', error);
            return null;
        }
    },

    async getUserAnswersByResultId(resultId) {
        try {
            return await resultRepository.getUserAnswersByResultId(resultId);
        } catch (error) {
            console.error('Error fetching user answers:', error);
            return null;
        }
    },

    async getResultsByUserId(userId, page = 1, limit = 5) {
        try {
            const offset = (page - 1) * limit;
            
            // Get paginated results sorted by date (newest first)
            const results = await resultRepository.getPaginatedResultsByUserId(userId, limit, offset);
            
            // Get total count for pagination
            const count = await resultRepository.countResultsByUserId(userId);
            
            // Enrich results with quiz details
            const enrichedResults = await Promise.all(results.map(async (result) => {
                // Get quiz info
                const quiz = await resultRepository.getQuizById(result.quiz);
                
                // Get correct/total answers count
                const userAnswers = await resultRepository.getUserAnswersByResultId(result.id);
                const totalCount = await resultRepository.getQuizQuestionCount(result.quiz);
                
                let correctCount = 0;
                
                for (const answer of userAnswers) {
                    const correctOption = await resultRepository.getCorrectOptionForQuestion(answer.question_id);
                    
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
            // Determine time range based on time parameter
            const endDate = new Date();
            let startDate = new Date();
            
            switch(time) {
                case 'week':
                    startDate.setDate(endDate.getDate() - 7); // 7 days ago
                    break;
                case 'month':
                    startDate.setMonth(endDate.getMonth() - 1); // 1 month ago
                    break;
                case 'year':
                    startDate.setFullYear(endDate.getFullYear() - 1); // 1 year ago
                    break;
                default:
                    startDate.setDate(endDate.getDate() - 7); // Default is week
            }
            
            let topPlayers;
            
            if (criteria === 'score') {
                // Total score criteria
                topPlayers = await resultRepository.getTopPlayersByScore(startDate, endDate, limit);
                    
                // Add ranking information
                topPlayers = topPlayers.map((player, index) => ({
                    ...player,
                    avatar: player.avatarUrl || `https://res.cloudinary.com/dj9r2qksh/image/upload/v1743576404/Quizz_Online/images/z3klhzrkoeikujya3fi9.jpg`, // Default URL if no avatar
                    rank: index + 1,
                    criteriaValue: player.totalScore || 0
                }));
            } 
            else if (criteria === 'attend') {
                // Number of completed quizzes criteria
                topPlayers = await resultRepository.getTopPlayersByAttendance(startDate, endDate, limit);
                    
                // Add ranking information
                topPlayers = topPlayers.map((player, index) => ({
                    ...player,
                    avatar: player.avatarUrl || `https://res.cloudinary.com/dj9r2qksh/image/upload/v1743576404/Quizz_Online/images/z3klhzrkoeikujya3fi9.jpg`, // Default URL
                    rank: index + 1,
                    criteriaValue: parseInt(player.completedQuizzes) || 0
                }));
            } 
            else if (criteria === 'mean') {
                // Average score percentage criteria
                
                // Get all users with completed results and total score
                const userScores = await resultRepository.getUserScoresInTimeRange(startDate, endDate);
                
                // Calculate maximum possible score and percentage for each user
                const usersWithPercentages = await Promise.all(
                    userScores.map(async (user) => {
                        // Get all completed results for the user in the time range
                        const results = await resultRepository.getUserResultsInTimeRange(user.userId, startDate, endDate);
                        
                        let totalPossible = 0;
                        
                        // Calculate maximum possible score for each result
                        for (const result of results) {
                            // Get all questions in the quiz
                            const quizQuestionCount = await resultRepository.getQuizQuestionCount(result.quiz);
                            
                            if (quizQuestionCount === 0) continue;
                            
                            // Get question IDs for the quiz
                            const questions = await db('quiz_question')
                                .join('question', 'quiz_question.question_id', '=', 'question.id')
                                .select('question.id', 'question.points')
                                .where('quiz_question.quiz_id', result.quiz);
                            
                            // Calculate total possible points
                            questions.forEach(question => {
                                totalPossible += question.points || 1; // Default to 1 if not specified
                            });
                        }
                        
                        // Calculate percentage (avoid division by zero)
                        const percentage = totalPossible > 0 
                            ? (user.totalEarned / totalPossible) * 100 
                            : 0;
                        
                        return {
                            ...user,
                            avatar: user.avatarUrl || `https://res.cloudinary.com/dj9r2qksh/image/upload/v1743576404/Quizz_Online/images/z3klhzrkoeikujya3fi9.jpg`, // Default avatar URL
                            percentage: parseFloat(percentage.toFixed(2)),
                            totalPossible,
                            criteriaValue: parseFloat(percentage.toFixed(2))
                        };
                    })
                );
                
                // Sort by percentage and get top players
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
    }
};