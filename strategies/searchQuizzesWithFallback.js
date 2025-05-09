import SearchByTitle from'../strategies/SearchByTitleStrategy.js';
import SearchByDescription from'../strategies/SearchByDescriptionStrategy.js';
import SearchByTag from'../strategies/SearchByTagStrategy.js';
import db from '../configs/db.js';
const strategies = [
  SearchByTitle,
  SearchByDescription,
  SearchByTag
];

export default {
    async searchQuizzes(searchTerm) {
        let quizzes = [];
      
        for (const strategy of strategies) {
          quizzes = await strategy.search(searchTerm);
          if (quizzes && quizzes.length > 0) {
            break; // nếu tìm được kết quả thì dừng
          }
        }
      
        if (!quizzes || quizzes.length === 0) return [];
      
        // Gắn media và số câu hỏi giống như cũ:
        const quizIds = quizzes.map(quiz => quiz.id);
      
        const mediaResults = await db('media')
          .select('id', 'url')
          .whereIn('id', quizzes.map(quiz => quiz.media).filter(Boolean));
      
        const mediaMap = mediaResults.reduce((map, item) => {
          map[item.id] = item.url;
          return map;
        }, {});
      
        const questionCounts = await db('quiz_question')
          .select('quiz_id')
          .count('question_id as count')
          .whereIn('quiz_id', quizIds)
          .groupBy('quiz_id');
      
        const questionCountMap = questionCounts.reduce((map, item) => {
          map[item.quiz_id] = item.count;
          return map;
        }, {});
      
        return quizzes.map(quiz => ({
          ...quiz,
          imageUrl: quiz.media && mediaMap[quiz.media]
            ? mediaMap[quiz.media]
            : 'https://placehold.co/600x400?text=Quiz&bg=f0f4f8',
          numberOfQuestions: questionCountMap[quiz.id] || 0
        }));
      }
      
}

