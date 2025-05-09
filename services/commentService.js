import commentRepository from "../repositories/commentRepository.js";

const commentService = {
  // Lấy tất cả bình luận cho một quiz
  async getAllComments(quizId) {
    try {
      const comments = await commentRepository.findCommentsByQuizId(quizId);

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
      const quizExists = await commentRepository.checkQuizExists(quizId);
      if (!quizExists) {
        throw new Error(`Quiz with ID ${quizId} not found`);
      }

      // 2. Kiểm tra xem user có tồn tại không
      const userExists = await commentRepository.checkUserExists(userId);
      if (!userExists) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // 3. Thêm comment vào database
      const commentData = {
        quiz: quizId,
        user: userId,
        message: content,
      };
      
      const id = await commentRepository.insertComment(commentData);

      return { id };
    } catch (error) {
      console.error("Error in addComment:", error);
      throw error;
    }
  },

  // Xóa bình luận
  async deleteComment(commentId) {
    try {
      await commentRepository.deleteComment(commentId);
      return { success: true };
    } catch (error) {
      console.error("Error in deleteComment:", error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết của bình luận
  async getCommentById(commentId) {
    try {
      const comment = await commentRepository.findCommentById(commentId);
      return comment || null;
    } catch (error) {
      console.error("Error in getCommentById:", error);
      throw error;
    }
  },

  // Đếm số lượng bình luận cho một quiz
  async countComments(quizId) {
    try {
      return await commentRepository.countCommentsByQuizId(quizId);
    } catch (error) {
      console.error("Error in countComments:", error);
      throw error;
    }
  },
};

export default commentService;