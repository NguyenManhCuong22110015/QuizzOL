import db from "../configs/db.js";

export default {
  // Get all questions for a quiz using quiz_question mapping table
  async getQuestionsByQuizId(quizId) {
    try {
      // First get all question_ids from quiz_question mapping table
      const questionMappings = await db("quiz_question")
        .select("question_id")
        .where("quiz_id", quizId);

      // If no questions mapped to this quiz, return empty array
      if (!questionMappings || questionMappings.length === 0) {
        return [];
      }

      // Extract just the question_ids from the mapping results
      const questionIds = questionMappings.map(
        (mapping) => mapping.question_id
      );

      // Now get the actual questions using these IDs
      const questions = await db("question")
        .select("*")
        .whereIn("id", questionIds);

      // Get media URLs for questions that have them
      const mediaIds = questions.map((q) => q.img_url).filter(Boolean);

      if (mediaIds.length > 0) {
        const media = await db("media")
          .select("id", "url")
          .whereIn("id", mediaIds);

        const mediaMap = media.reduce((acc, m) => {
          acc[m.id] = m.url;
          return acc;
        }, {});

        // Attach media URLs to questions
        questions.forEach((question) => {
          if (question.img_url && mediaMap[question.img_url]) {
            question.imageUrl = mediaMap[question.img_url];
          }
        });
      }

      return questions;
    } catch (error) {
      console.error("Error in getQuestionsByQuizId:", error);
      return [];
    }
  },

  async addQuestions(quizId, questions) {
    return await db.transaction(async (trx) => {
      try {
        const insertedQuestions = [];

        // Insert each question individually to capture each inserted id
        for (const question of questions) {
          const [id] = await trx("question").insert({
            content: question.content,
            type: question.type,
            img_url: question.img_url || null,
            points: question.points || 0,
            explaination: questionData.explanation || null,
          });
          insertedQuestions.push({ id, ...question });
        }

        // Prepare the quiz_question mapping records using every inserted question's id
        const mappings = insertedQuestions.map((q) => ({
          quiz_id: quizId,
          question_id: q.id,
        }));

        // Insert all mappings at once
        await trx("quiz_question").insert(mappings);

        return insertedQuestions;
      } catch (error) {
        console.error("Error in addQuestions:", error);
        throw error;
      }
    });
  },

  // ...existing code...

  async addQuestion(questionData) {
    const { content, type, points, explanation, img_url, option } = questionData;
    
    try {
        // Insert the question first
        const [questionId] = await db('question').insert({
            content,
            type,
            points: points || 1,
            explanation,
            img_url
        });

        // If we have options, insert them
        if (option && option.length > 0) {
            const optionsToInsert = option.map(opt => ({
                content: opt.content,
                isCorrect: opt.isCorrect,
                question_id: questionId
            }));

            await db('option').insert(optionsToInsert);
        }

        return [questionId];
    } catch (error) {
        console.error('Error in addQuestion:', error);
        throw error;
    }
  },

  // Delete all questions for a quiz
  async deleteQuestionsByQuizId(quizId) {
    return await db.transaction(async (trx) => {
      try {
        // First get all question IDs associated with this quiz
        const questionMappings = await trx("quiz_question")
          .select("question_id")
          .where("quiz_id", quizId);

        const questionIds = questionMappings.map(
          (mapping) => mapping.question_id
        );

        // Delete the mappings first
        await trx("quiz_question").where("quiz_id", quizId).del();

        // Then delete the actual questions
        if (questionIds.length > 0) {
          await trx("question").whereIn("id", questionIds).del();
        }

        return true;
      } catch (error) {
        console.error("Error in deleteQuestionsByQuizId:", error);
        throw error;
      }
    });
  },

  // Delete a single question (and its mapping)
  async deleteQuestionById(questionId, quizId) {
    return await db.transaction(async (trx) => {
      try {
        // First delete the mapping
        await trx("quiz_question")
          .where({
            quiz_id: quizId,
            question_id: questionId,
          })
          .del();

        // Then delete the question itself
        await trx("question").where("id", questionId).del();

        return true;
      } catch (error) {
        console.error("Error in deleteQuestionById:", error);
        throw error;
      }
    });
  },

  // Add a new function to check if a question is used in multiple quizzes
  async isQuestionUsedInMultipleQuizzes(questionId) {
    try {
      const count = await db("quiz_question")
        .where("question_id", questionId)
        .count("* as count")
        .first();

      return count.count > 1;
    } catch (error) {
      console.error("Error in isQuestionUsedInMultipleQuizzes:", error);
      return false;

    }},
    async getQuestionById(questionId) {
        try {
            const question = await db('question')
                .select('*')
                .where('id', questionId)
                .first();
            
            const options = await db('option')
                .select('*')
                .where('question_id', questionId);

            if (!question) {
                return null;
            }
            
            // Get media URL if it exists
            if (question.img_url) {
                const media = await db('media')
                    .select('url')
                    .where('id', question.img_url)
                    .first();
                
                if (media) {
                    question.imageUrl = media.url;
                }
            }
            
            return {
                question: question,
                options : options
            };
        } catch (error) {
            console.error('Error in getQuestionById:', error);
            return null;
        }
    },
};
