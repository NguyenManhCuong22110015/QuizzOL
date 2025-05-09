import tagRepository from '../repositories/tagRepository.js';

export default {
    /**
     * Find or create tags from a comma-separated string
     * @param {string} tagNames - Comma-separated list of tag names
     * @returns {Promise<Array<number>>} - Array of tag IDs
     */
    async findOrCreateTags(tagNames) {
        try {
            // Split tag string into array and clean up
            const tags = tagNames.split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            const tagIds = [];

            for (const tagName of tags) {
                // Try to find existing tag
                let tag = await tagRepository.findTagByName(tagName);

                if (!tag) {
                    // Create new tag if doesn't exist
                    const newTagId = await tagRepository.createTag(tagName);
                    tagIds.push(newTagId);
                } else {
                    tagIds.push(tag.id);
                }
            }

            return tagIds;
        } catch (error) {
            console.error('Error in findOrCreateTags:', error);
            throw error;
        }
    },

    /**
     * Get all available tags
     * @returns {Promise<Array>} - Array of all tags
     */
    async getAllTags() {
        try {
            return await tagRepository.getAllTags();
        } catch (error) {
            console.error('Error in getAllTags:', error);
            return [];
        }
    },

    /**
     * Update tags for a quiz
     * @param {number} quizId - The quiz ID
     * @param {string} tagNames - Comma-separated list of tag names
     * @returns {Promise<boolean>} - Success indicator
     */
    async updateQuizTags(quizId, tagNames) {
        try {
            // Get tag IDs from tag names
            const tagIds = await this.findOrCreateTags(tagNames);

            // Delete existing quiz-tag mappings
            await tagRepository.deleteQuizTagMappings(quizId);

            // Create new mappings
            if (tagIds.length > 0) {
                await tagRepository.linkTagsToQuiz(quizId, tagIds);
            }

            return true;
        } catch (error) {
            console.error('Error in updateQuizTags:', error);
            return false;
        }
    },

    /**
     * Get tags for a quiz
     * @param {number} quizId - The quiz ID
     * @returns {Promise<Array>} - Array of tag objects
     */
    async getTagsByQuizId(quizId) {
        try {
            return await tagRepository.getTagsByQuizId(quizId);
        } catch (error) {
            console.error('Error in getTagsByQuizId:', error);
            return [];
        }
    }
};