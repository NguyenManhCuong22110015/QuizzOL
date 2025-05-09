import db from '../configs/db.js';

export default {
    /**
     * Fetches all flashcards with their associated question/answer data.
     * @returns {Promise<Array>} - An array of all flashcard objects.
     */
    async getAllFlashcards() {
        try {
            const flashcards = await db('flashcard as f')
                .join('question as q', 'f.question', 'q.id')
                .leftJoin(db.raw(`(SELECT question_id, GROUP_CONCAT(content SEPARATOR '; ') AS answer_text FROM \`option\` WHERE isCorrect = 1 GROUP BY question_id) as correct_options`), 'q.id', 'correct_options.question_id')
                .leftJoin('media as m', builder => { builder.on(db.raw('CAST(q.img_url AS SIGNED)'), '=', 'm.id').andOn(db.raw('q.img_url REGEXP \'^[0-9]+$\'')); })
                .select(
                    'f.id', 'f.name as flashcardName', 'f.method_type', 'f.question as questionId',
                    'q.content as questionText', 'q.img_url as questionImageUrlSource', 'm.url as questionImageUrl',
                    db.raw('COALESCE(correct_options.answer_text, \'Correct answer not set\') as answerText')
                )
                .orderBy('f.id');

            return flashcards;
        } catch (error) {
            console.error('Error fetching all flashcards:', error);
            throw error;
        }
    },

    /**
     * Gets user information from the database
     * @param {number|string} userId - ID of the user
     * @returns {Promise<object|null>} - User object or null if not found
     */
    async getUserById(userId) {
        try {
            return await db('user')
                .leftJoin('media', 'user.avatar', 'media.id')
                .where('user.id', userId)
                .first('user.username', 'media.url as avatarUrl');
        } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Gets user's learning streak information
     * @param {number|string} userId - ID of the user
     * @returns {Promise<number>} - Number of streak days
     */
    async getUserStreakDays(userId) {
        try {
            // This is a placeholder. In a real implementation, you would query
            // a table that tracks user learning activity
            return 0;
        } catch (error) {
            console.error(`Error fetching streak for user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Get a specific flashcard by ID
     * @param {number} flashcardId - The ID of the flashcard
     * @returns {Promise<object|null>} - Flashcard object or null if not found
     */
    async getFlashcardById(flashcardId) {
        try {
            return await db('flashcard').where('id', flashcardId).first();
        } catch (error) {
            console.error(`Error fetching flashcard ${flashcardId}:`, error);
            throw error;
        }
    },

    /**
     * Create a new flashcard
     * @param {object} data - Flashcard data
     * @returns {Promise<number>} - ID of the created flashcard
     */
    async createFlashcard(data) {
        try {
            const [id] = await db('flashcard').insert(data);
            return id;
        } catch (error) {
            console.error('Error creating flashcard:', error);
            throw error;
        }
    },

    /**
     * Update an existing flashcard
     * @param {number} flashcardId - ID of the flashcard to update
     * @param {object} data - New flashcard data
     * @returns {Promise<number>} - Number of affected rows
     */
    async updateFlashcard(flashcardId, data) {
        try {
            return await db('flashcard').where('id', flashcardId).update(data);
        } catch (error) {
            console.error(`Error updating flashcard ${flashcardId}:`, error);
            throw error;
        }
    },

    /**
     * Delete a flashcard
     * @param {number} flashcardId - ID of the flashcard to delete
     * @returns {Promise<number>} - Number of affected rows
     */
    async deleteFlashcard(flashcardId) {
        try {
            return await db('flashcard').where('id', flashcardId).delete();
        } catch (error) {
            console.error(`Error deleting flashcard ${flashcardId}:`, error);
            throw error;
        }
    }
};