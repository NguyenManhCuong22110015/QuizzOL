import db from "../configs/db.js";

const ratingService = {
  // Thêm đánh giá mới
  async addRating(quizId, userId, rating) {
    try {
      console.log("Adding rating:", { quizId, userId, rating });

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

      // 3. Thêm rating vào database
      const [id] = await db("rating").insert({
        quiz: quizId,
        user: userId,
        rating,
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
      await db("rating").where("id", ratingId).update({ rating: newRating });

      return { id: ratingId };
    } catch (error) {
      console.error("Error in updateRating:", error);
      throw error;
    }
  },

  // Lấy đánh giá của người dùng cho một quiz
  async getUserRating(quizId, userId) {
    try {
      const rating = await db("rating")
        .select("id", "rating")
        .where({
          quiz: quizId,
          user: userId,
        })
        .first();

      return rating || null;
    } catch (error) {
      console.error("Error in getUserRating:", error);
      throw error;
    }
  },

  // Tính toán điểm đánh giá trung bình cho một quiz
  async calculateAverageRating(quizId) {
    try {
      const result = await db("rating")
        .where("quiz", quizId)
        .avg("rating as averageRating")
        .count("id as count")
        .first();

      return {
        average: result.averageRating || 0,
        count: result.count || 0,
      };
    } catch (error) {
      console.error("Error in calculateAverageRating:", error);
      throw error;
    }
  },
};

export default ratingService;
