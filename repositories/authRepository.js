import db from '../configs/db.js';

export default {
    async findAccountByEmail(email) {
        return db('account').where({ email }).first();
    },
    
    async findAccountByEmailAndProvider(email, provider) {
        return db('account').where({ email, provider }).first();
    },
    
    async findAccountById(id) {
        return db('account').where({ id }).first();
    },
    
    async findUserDetails(userId) {
        return db('user')
            .where({ 'user.id': userId })
            .leftJoin('media', 'user.avatar', '=', 'media.id')
            .select('user.username', 'user.avatar', 'media.url as avatar_url')
            .first();
    },
    
    async createUserAndAccount(userData, accountData, trx) {
        const dbToUse = trx || db;
        
        // Insert user first
        const [userId] = await dbToUse('user').insert(userData);
        
        // Then insert account with user reference
        const [accountId] = await dbToUse('account').insert({
            ...accountData,
            user: userId
        });
        
        return { userId, accountId };
    },
    
    async findAccountByVerificationToken(token) {
        return db('account')
            .where({ verification_token: token })
            .where('token_expiry', '>', db.fn.now())
            .first();
    },
    
    async updateAccount(accountId, updateData) {
        return db('account')
            .where({ id: accountId })
            .update(updateData);
    },
    
    async updateVerificationToken(accountId, token, expiry) {
        return db('account')
            .where({ id: accountId })
            .update({
                verification_token: token,
                token_expiry: expiry
            });
    },
    
    async getNewAccount(accountId, trx) {
        const dbToUse = trx || db;
        return dbToUse('account')
            .where({ id: accountId })
            .first();
    },
    
    async getNewUser(userId, trx) {
        const dbToUse = trx || db;
        return dbToUse('user')
            .where({ id: userId })
            .first();
    },
    
    async beginTransaction() {
        return db.transaction();
    }
}