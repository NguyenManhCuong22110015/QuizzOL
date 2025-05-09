import db from '../configs/db.js';

export default {
  async search(term) {
    return db('quiz')
      .join('quiz_tag', 'quiz.id', 'quiz_tag.quiz_id')
      .join('tag', 'quiz_tag.tag_id', 'tag.id')
      .where('tag.name', 'like', `%${term}%`)
      .select('quiz.*');
  }
};


