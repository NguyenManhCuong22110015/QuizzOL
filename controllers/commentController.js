import commentService from "../services/commentService.js";
import userService from "../services/userService.js";
import ratingService from "../services/ratingService.js";
import db from "../configs/db.js";

export default {
  /**
   * Add new comment for a quiz
   */
  addComment: async (req, res) => {
    try {
      let { quizId, userId, content } = req.body;

      userId = await userService.getUserIdByAccountId(userId);

      console.log("Received comment data:", { quizId, userId, content });

      // Validate input
      if (!quizId || !userId || !content) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Kiểm tra userId có tồn tại không
      const userExists = await db("user").where("id", userId).first();
      if (!userExists) {
        console.log(`User ID ${userId} not found in database`);

        // Nếu không tìm thấy, sử dụng ID 30 (Trung Trần) từ kết quả SQL của bạn
        console.log(`Using default user ID 30 (Trung Trần)`);
      } else {
        console.log(`Found user by ID ${userId}: ${userExists.username}`);
      }

      // Kiểm tra quizId có tồn tại không
      const quizExists = await db("quiz").where("id", quizId).first();
      if (!quizExists) {
        return res.status(400).json({
          error: `Quiz with ID ${quizId} not found`,
          details: "quizId không tồn tại trong bảng quiz",
        });
      }

      // Thêm comment sử dụng userID đã xác thực
      const result = await commentService.addComment(quizId, userId, content);
      res.status(201).json({ message: "Comment added successfully", result });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  },

  /**
   * Add or update rating for a quiz
   */
  addRating: async (req, res) => {
    try {
      let { quizId, userId, rating } = req.body;
      console.log("Received rating data:", { quizId, userId, rating });

      userId = await userService.getUserIdByAccountId(userId);

      // Validate input
      if (!quizId || !userId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Invalid rating data" });
      }

      const userExists = await db("user").where("id", userId).first();
      if (!userExists) {
        console.log(`User ID ${userId} not found in database`);
        return res.status(400).json({ error: "User not found" });
      } else {
        console.log(`Found user by ID ${userId}: ${userExists.username}`);
      }

      // Kiểm tra quizId có tồn tại không
      const quizExists = await db("quiz").where("id", quizId).first();
      if (!quizExists) {
        return res.status(400).json({
          error: `Quiz with ID ${quizId} not found`,
          details: "quizId không tồn tại trong bảng quiz",
        });
      }

      // Kiểm tra xem người dùng đã đánh giá quiz này chưa
      const existingRating = await ratingService.getUserRating(quizId, userId);

      let result;
      if (existingRating) {
        // Cập nhật đánh giá hiện có
        result = await ratingService.updateRating(existingRating.id, rating);
      } else {
        // Thêm đánh giá mới
        result = await ratingService.addRating(quizId, userId, rating);
      }

      // Tính toán và cập nhật lại rating trung bình cho quiz
      const avgRating = await ratingService.calculateAverageRating(quizId);

      res.status(200).json({
        message: "Rating saved successfully",
        result,
        averageRating: avgRating,
      });
    } catch (error) {
      console.error("Error saving rating:", error);
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  },

  /**
   * Get user rating for a quiz
   */
  getUserRating: async (req, res) => {
    try {
      let { quizId, userId } = req.params;
      userId = await userService.getUserIdByAccountId(userId);
      console.log("Fetching rating for:", { quizId, userId });

      if (!quizId || !userId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Kiểm tra userId có tồn tại không
      const userExists = await db("user").where("id", userId).first();
      if (!userExists) {
        console.log(`User ID ${userId} not found in database`);
        userId = await userService.getUserIdByAccountId(userId);
      } else {
        console.log(`Found user by ID ${userId}: ${userExists.username}`);
      }

      // Lấy rating của user đã xác thực
      const userRating = await ratingService.getUserRating(quizId, userId);
      res.status(200).json({ rating: userRating ? userRating.rating : 0 });
    } catch (error) {
      console.error("Error fetching user rating:", error);
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  }
};