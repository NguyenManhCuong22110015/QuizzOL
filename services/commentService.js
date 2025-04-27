import db from '../configs/db.js';


export default {

    getAllComments(quizId){
        return db('comment')
            .select('*')
            .where('quiz_id', quizId)
            .orderBy('created_at', 'desc');
    },

    addComment(quizId, userId, content){
        return db('comment')
            .insert({
                quiz: quizId,
                user: userId,
                message: content
            });
    },

    deleteComment(commentId){
        return db('comment')
            .where('id', commentId)
            .del();
    }

}