import db from '../configs/db.js';

export default {
    // Account related operations
    async findAccountByEmailAndProvider(email, provider) {
        return db('account')
            .where({ 
                email: email, 
                provider: provider 
            })
            .first();
    },

    async findAccountByEmail(email) {
        return db('account')
            .where({ email })
            .first();
    },

    async findAccountById(accountId) {
        return db('account')
            .where('id', accountId)
            .first();
    },

    async createAccount(accountData) {
        const [accountId] = await db('account').insert(accountData);
        return accountId;
    },

    async updateAccount(accountId, data) {
        return db('account')
            .where('id', accountId)
            .update(data);
    },

    async getAccountsByUserId(userId) {
        return db('account')
            .where({ user: userId });
    },

    // User related operations
    async findUserById(userId) {
        return db('user')
            .where('id', userId)
            .first();
    },

    async findUserByIdWithAvatar(userId) {
        return db('user')
            .leftJoin('media', 'user.avatar', 'media.id')
            .select('user.*', 'media.url as avatar_url')
            .where('user.id', userId)
            .first();
    },

    async createUser(userData) {
        const [userId] = await db('user').insert(userData);
        return userId;
    },

    async updateUser(userId, data) {
        return db('user')
            .where('id', userId)
            .update(data);
    },

    // Media related operations
    async createMedia(mediaData) {
        const [mediaId] = await db('media').insert(mediaData);
        return mediaId;
    },

    async findMediaById(mediaId) {
        return db('media')
            .where('id', mediaId)
            .first();
    },

    // Stats related operations
    async countQuizzesByUserId(userId) {
        const result = await db('quiz')
            .where({ createdBy: userId })
            .count('id as count')
            .first();
        return result ? result.count : 0;
    },

    async countFlashcardSetsByUserId(userId) {
        const result = await db('flashcard_set')
            .where({ user: userId })
            .count('id as count')
            .first();
        return result ? result.count : 0;
    },

    async getActiveSubscriptionByUserId(userId) {
        return db('subscription')
            .where({ user: userId })
            .orderBy('expiry_date', 'desc')
            .first();
    },

    // Transaction handling
    beginTransaction() {
        return db.transaction();
    }
};