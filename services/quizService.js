import db from '../configs/db.js';


export default {
    getAllQuizs() {
        return db('quiz').select('*');
    }
}
