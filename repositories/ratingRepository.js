import db from "../configs/db.js";

const ratingRepository = {
  // Check if quiz exists
  async checkQuizExists(quizId) {
    return db("quiz").where("id", quizId).first();
  },

  // Check if user exists
  async checkUserExists(userId) {
    return db("user").where("id", userId).first();
  },

  // Insert new rating
  async insertRating(data) {
    const [id] = await db("rate").insert(data);
    return id;
  },

  // Update existing rating
  async updateRating(ratingId, score) {
    return db("rate").where("id", ratingId).update({ score });
  },

  // Get user rating for a specific quiz
  async findUserRating(quizId, userId) {
    return db("rate")
      .select("id", "score")
      .where({
        quiz: quizId,
        user: userId,
      })
      .first();
  },

  // Calculate average rating and count for a quiz
  async calculateAverageRating(quizId) {
    return db("rate")
      .where("quiz", quizId)
      .avg("score as averageRating")
      .count("id as count")
      .first();
  },

  // Delete rating
  async deleteRating(ratingId) {
    return db("rate").where("id", ratingId).del();
  },

  // Get all ratings for a quiz
  async findRatingsByQuizId(quizId) {
    return db("rate")
      .select("rate.*", "user.username")
      .leftJoin("user", "rate.user", "user.id")
      .where("rate.quiz", quizId)
      .orderBy("rate.id", "desc");
  }
};

export default ratingRepository;