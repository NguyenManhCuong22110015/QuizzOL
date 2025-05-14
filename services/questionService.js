import questionRepository from "../repositories/questionRepository.js";

export default {
  // Get all questions for a quiz using quiz_question mapping table
  async getQuestionsByQuizId(quizId) {
    try {
      // First get all question_ids from quiz_question mapping table
      const questionMappings = await questionRepository.findQuestionMappingsByQuizId(quizId);

      // If no questions mapped to this quiz, return empty array
      if (!questionMappings || questionMappings.length === 0) {
        return [];
      }

      // Extract just the question_ids from the mapping results
      const questionIds = questionMappings.map(
        (mapping) => mapping.question_id
      );

      // Now get the actual questions using these IDs
      const questions = await questionRepository.findQuestionsByIds(questionIds);

      // Get media URLs for questions that have them
      const mediaIds = questions.map((q) => q.media).filter(Boolean);

      if (mediaIds.length > 0) {
        const media = await questionRepository.findMediaByIds(mediaIds);

        const mediaMap = media.reduce((acc, m) => {
          acc[m.id] = m.url;
          return acc;
        }, {});

        // Attach media URLs to questions
        questions.forEach((question) => {
          if (question.media && mediaMap[question.media]) {
            question.imageUrl = mediaMap[question.media];
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
    const trx = await questionRepository.beginTransaction();
    try {
      const insertedQuestions = [];

      // Insert each question individually to capture each inserted id
      for (const question of questions) {
        const id = await trx("question").insert({
          content: question.content,
          type: question.type,
          media: question.media || null,
          points: question.points || 0,
          explanation: question.explanation || null,
        });
        insertedQuestions.push({ id: id[0], ...question });
      }

      // Prepare the quiz_question mapping records using every inserted question's id
      const mappings = insertedQuestions.map((q) => ({
        quiz_id: quizId,
        question_id: q.id,
      }));

      // Insert all mappings at once
      await trx("quiz_question").insert(mappings);
      
      await trx.commit();
      return insertedQuestions;
    } catch (error) {
      await trx.rollback();
      console.error("Error in addQuestions:", error);
      throw error;
    }
  },

  async addQuestion(questionData) {
    const { content, type, points, explanation, media, options } = questionData;
    
    try {
        // Insert the question first
        const questionId = await questionRepository.insertQuestion({
            content,
            type,
            points: points || 1,
            explanation,
            media
        });

        // If we have optionss, insert them
        if (options && options.length > 0) {
            const optionsToInsert = options.map(opt => ({
                content: opt.content,
                isCorrect: opt.isCorrect,
                question_id: questionId
            }));

            await questionRepository.insertOptions(optionsToInsert);
        }

        return [questionId];
    } catch (error) {
        console.error('Error in addQuestion:', error);
        throw error;
    }
  },

  // Delete all questions for a quiz
  async deleteQuestionsByQuizId(quizId) {
    const trx = await questionRepository.beginTransaction();
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

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      console.error("Error in deleteQuestionsByQuizId:", error);
      throw error;
    }
  },

  // Delete a single question (and its mapping)
  async deleteQuestionById(questionId, quizId) {
    const trx = await questionRepository.beginTransaction();
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

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      console.error("Error in deleteQuestionById:", error);
      throw error;
    }
  },

  // Check if a question is used in multiple quizzes
  async isQuestionUsedInMultipleQuizzes(questionId) {
    try {
      const count = await questionRepository.countQuizzesByQuestionId(questionId);
      return count > 1;
    } catch (error) {
      console.error("Error in isQuestionUsedInMultipleQuizzes:", error);
      return false;
    }
  },
  
  async getQuestionById(questionId) {
    try {
      const question = await questionRepository.findQuestionById(questionId);
      
      if (!question) {
        return null;
      }
      
      const options = await questionRepository.findOptionsByQuestionId(questionId);
      
      // Get media URL if it exists
      if (question.media) {
        const media = await questionRepository.findMediaUrlById(question.media);
        
        if (media) {
          question.imageUrl = media.url;
        }
      }
      
      return {
        question: question,
        options: options
      };
    } catch (error) {
      console.error('Error in getQuestionById:', error);
      return null;
    }
  },
};