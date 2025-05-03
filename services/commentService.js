import db from "../configs/db.js";

const commentService = {
  // Lấy tất cả bình luận cho một quiz
  async getAllComments(quizId) {
    try {
      const comments = await db("comment as c")
        .join("user as u", "c.user", "=", "u.id")
        .select("c.*", "u.username as authorUsername")
        .where("c.quiz", quizId)
        .orderBy("c.id", "desc");

      // Thêm chữ cái đầu tiên cho ảnh đại diện
      comments.forEach((comment) => {
        comment.authorInitials = comment.authorUsername.charAt(0).toUpperCase();
      });

      return comments;
    } catch (error) {
      console.error("Error in getAllComments:", error);
      throw error;
    }
  },

  // Thêm bình luận mới
  async addComment(quizId, userId, content) {
    try {
      console.log("Adding comment:", { quizId, userId, content });

      // 1. Kiểm tra xem quiz có tồn tại không
      const quizExists = await db("quiz").where("id", quizId).first();
      if (!quizExists) {
        throw new Error(`Quiz with ID ${quizId} not found`);
      }

      // 2. Kiểm tra xem user có tồn tại không
      const userExists = await db("user").where("id", userId).first();
      if (!userExists) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // 3. Thêm comment vào database
      const [id] = await db("comment").insert({
        quiz: quizId,
        user: userId,
        message: content,
      });

      return { id };
    } catch (error) {
      console.error("Error in addComment:", error);
      throw error;
    }
  },

  // Xóa bình luận
  async deleteComment(commentId) {
    try {
      await db("comment").where("id", commentId).del();

      return { success: true };
    } catch (error) {
      console.error("Error in deleteComment:", error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết của bình luận
  async getCommentById(commentId) {
    try {
      const comment = await db("comment").where("id", commentId).first();

      return comment || null;
    } catch (error) {
      console.error("Error in getCommentById:", error);
      throw error;
    }
  },

  // Đếm số lượng bình luận cho một quiz
  async countComments(quizId) {
    try {
      const result = await db("comment")
        .where("quiz", quizId)
        .count("id as count")
        .first();

      return result ? result.count : 0;
    } catch (error) {
      console.error("Error in countComments:", error);
      throw error;
    }
  },
};

export default commentService;
