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
    }

};