import ratingRepository from "../repositories/ratingRepository.js";

const ratingService = {
  // Thêm đánh giá mới
  async addRating(quizId, userId, rating) {
    try {
      console.log("Adding rating:", { quizId, userId, rating });

      // 1. Kiểm tra xem quiz có tồn tại không
      const quizExists = await ratingRepository.checkQuizExists(quizId);
      if (!quizExists) {
        throw new Error(`Quiz with ID ${quizId} not found`);
      }

      // 2. Kiểm tra xem user có tồn tại không
      const userExists = await ratingRepository.checkUserExists(userId);
      if (!userExists) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // 3. Thêm rating vào database
      const id = await ratingRepository.insertRating({
        quiz: quizId,
        user: userId,
        score: rating,
      });

      return { id };
    } catch (error) {
      console.error("Error in addRating:", error);
      throw error;
    }
  },

  // Cập nhật đánh giá hiện có
  async updateRating(ratingId, newRating) {
    try {
      await ratingRepository.updateRating(ratingId, newRating);
      return { id: ratingId };
    } catch (error) {
      console.error("Error in updateRating:", error);
      throw error;
    }
  },

  // Lấy đánh giá của người dùng cho một quiz
  async getUserRating(quizId, userId) {
    try {
      const rating = await ratingRepository.findUserRating(quizId, userId);
      return rating || null;
    } catch (error) {
      console.error("Error in getUserRating:", error);
      throw error;
    }
  },

  // Tính toán điểm đánh giá trung bình cho một quiz
  async calculateAverageRating(quizId) {
    try {
      const result = await ratingRepository.calculateAverageRating(quizId);

      return {
        average: result.averageRating || 0,
        count: result.count || 0,
      };
    } catch (error) {
      console.error("Error in calculateAverageRating:", error);
      throw error;
    }
  },
  
  // Xóa đánh giá
  async deleteRating(ratingId) {
    try {
      await ratingRepository.deleteRating(ratingId);
      return { success: true };
    } catch (error) {
      console.error("Error in deleteRating:", error);
      throw error;
    }
  },
  
  // Lấy tất cả đánh giá cho một quiz
  async getRatingsByQuizId(quizId) {
    try {
      const ratings = await ratingRepository.findRatingsByQuizId(quizId);
      return ratings;
    } catch (error) {
      console.error("Error in getRatingsByQuizId:", error);
      throw error;
    }
  }
};

export default ratingService;