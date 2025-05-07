import db from '../configs/db.js'

export default {
    async findOrCreateTags(tagNames) {
        try {
            // Split tag string into array and clean up
            const tags = tagNames.split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            const tagIds = [];

            for (const tagName of tags) {
                // Try to find existing tag
                let tag = await db('tag')
                    .where('name', tagName)
                    .first();

                if (!tag) {
                    // Create new tag if doesn't exist
                    const [newTagId] = await db('tag')
                        .insert({ name: tagName });
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
    }
}