import db from "../configs/db.js";

export default {
  // Get question IDs mapped to a quiz
  async findQuestionMappingsByQuizId(quizId) {
    return db("quiz_question")
      .select("question_id")
      .where("quiz_id", quizId);
  },

  // Get questions by IDs
  async findQuestionsByIds(questionIds) {
    return db("question")
      .select("*")
      .whereIn("id", questionIds);
  },

  // Get media by IDs
  async findMediaByIds(mediaIds) {
    return db("media")
      .select("id", "url")
      .whereIn("id", mediaIds);
  },

  // Insert a single question
  async insertQuestion(questionData) {
    const [id] = await db("question").insert(questionData);
    return id;
  },

  // Insert multiple questions
  async insertQuestions(questions) {
    const insertedIds = [];
    
    for (const question of questions) {
      const [id] = await db("question").insert(question);
      insertedIds.push(id);
    }
    
    return insertedIds;
  },

  // Insert quiz-question mappings
  async insertQuizQuestionMappings(mappings) {
    return db("quiz_question").insert(mappings);
  },

  // Insert options for a question
  async insertOptions(options) {
    return db("option").insert(options);
  },

  // Delete quiz-question mappings by quiz ID
  async deleteQuizQuestionMappingsByQuizId(quizId) {
    return db("quiz_question").where("quiz_id", quizId).del();
  },

  // Delete questions by IDs
  async deleteQuestionsByIds(questionIds) {
    if (questionIds.length === 0) return 0;
    return db("question").whereIn("id", questionIds).del();
  },

  // Delete quiz-question mapping
  async deleteQuizQuestionMapping(questionId, quizId) {
    return db("quiz_question")
      .where({
        quiz_id: quizId,
        question_id: questionId,
      })
      .del();
  },

  // Delete question by ID
  async deleteQuestionById(questionId) {
    return db("question").where("id", questionId).del();
  },

  // Count quiz-question mappings by question ID
  async countQuizzesByQuestionId(questionId) {
    const result = await db("quiz_question")
      .where("question_id", questionId)
      .count("* as count")
      .first();
    
    return result ? result.count : 0;
  },

  // Get a question by ID
  async findQuestionById(questionId) {
    return db("question")
      .select("*")
      .where("id", questionId)
      .first();
  },

  // Get options by question ID
  async findOptionsByQuestionId(questionId) {
    return db("option")
      .select("*")
      .where("question_id", questionId);
  },

  // Get media URL by ID
  async findMediaUrlById(mediaId) {
    return db("media")
      .select("url")
      .where("id", mediaId)
      .first();
  },

  // Begin a transaction
  async beginTransaction() {
    return db.transaction();
  }
};