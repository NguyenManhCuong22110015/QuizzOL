import db from '../configs/db.js';

export default {
  async search(term) {
    return db('quiz').where('description', 'like', `%${term}%`);
  }
};
