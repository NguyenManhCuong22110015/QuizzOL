import db from "../configs/db.js";

const commentRepository = {
  async findCommentsByQuizId(quizId) {
    return db("comment as c")
      .join("user as u", "c.user", "=", "u.id")
      .select("c.*", "u.username as authorUsername")
      .where("c.quiz", quizId)
      .orderBy("c.id", "desc");
  },

  async insertComment(commentData) {
    const [id] = await db("comment").insert(commentData);
    return id;
  },

  async deleteComment(commentId) {
    return db("comment").where("id", commentId).del();
  },

  async findCommentById(commentId) {
    return db("comment").where("id", commentId).first();
  },

  async countCommentsByQuizId(quizId) {
    const result = await db("comment")
      .where("quiz", quizId)
      .count("id as count")
      .first();
    
    return result ? result.count : 0;
  },

  async checkQuizExists(quizId) {
    return db("quiz").where("id", quizId).first();
  },

  async checkUserExists(userId) {
    return db("user").where("id", userId).first();
  }
};

export default commentRepository;