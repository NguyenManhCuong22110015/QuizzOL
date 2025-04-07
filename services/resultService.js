import db from '../configs/db.js';

export default {
    getResultById(resultId) {
        return db('result').select('*').where('id', resultId).first();
    }
};