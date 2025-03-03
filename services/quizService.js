import db from '../utils/db.js';


export default {
    getAllQuizs() {
        return db('quiz').select('*');
    }
}
