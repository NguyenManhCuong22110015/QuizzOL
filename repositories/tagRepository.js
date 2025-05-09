import db from '../configs/db.js';

export default {
    /**
     * Find a tag by name
     * @param {string} tagName - The name of the tag to find
     * @returns {Promise<object|null>} - The tag object or null if not found
     */
    async findTagByName(tagName) {
        return db('tag')
            .where('name', tagName)
            .first();
    },

    /**
     * Create a new tag
     * @param {string} tagName - The name of the tag to create
     * @returns {Promise<number>} - The ID of the created tag
     */
    async createTag(tagName) {
        const [newTagId] = await db('tag').insert({ name: tagName });
        return newTagId;
    },

    /**
     * Get all tags
     * @returns {Promise<Array>} - Array of all tags
     */
    async getAllTags() {
        return db('tag').select('*').orderBy('name');
    },

    /**
     * Get tags by IDs
     * @param {Array<number>} tagIds - Array of tag IDs
     * @returns {Promise<Array>} - Array of tag objects
     */
    async getTagsByIds(tagIds) {
        return db('tag')
            .select('*')
            .whereIn('id', tagIds);
    },

    /**
     * Get tags for a quiz
     * @param {number} quizId - The quiz ID
     * @returns {Promise<Array>} - Array of tag objects
     */
    async getTagsByQuizId(quizId) {
        return db('quiz_tag')
            .join('tag', 'quiz_tag.tag_id', '=', 'tag.id')
            .where('quiz_tag.quiz_id', quizId)
            .select('tag.id', 'tag.name');
    },

    /**
     * Link tags to a quiz
     * @param {number} quizId - The quiz ID
     * @param {Array<number>} tagIds - Array of tag IDs
     * @returns {Promise<Array>} - Array of inserted records
     */
    async linkTagsToQuiz(quizId, tagIds) {
        const mappings = tagIds.map(tagId => ({
            quiz_id: quizId,
            tag_id: tagId
        }));
        
        return db('quiz_tag').insert(mappings);
    },

    /**
     * Delete quiz-tag mappings for a quiz
     * @param {number} quizId - The quiz ID
     * @returns {Promise<number>} - Number of deleted records
     */
    async deleteQuizTagMappings(quizId) {
        return db('quiz_tag').where('quiz_id', quizId).del();
    }
};