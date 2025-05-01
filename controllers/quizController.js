import resultService from "../services/resultService.js";
import userService from "../services/userService.js";
import questionService from "../services/questionService.js";
import optionService from "../services/optionService.js";
import moment from "moment";

export default{
    checkResult: async (req, res) => {
      const resultId = req.params.id;
      
      // Get result and user data
      const result = await resultService.getResultById(resultId) || 0;
      const userId = result.user;
      const user = await userService.getUserById(userId) || 0;
      const quizId = result.quiz; // Get the quiz ID from the result
      
      // Get all questions for this quiz
      const allQuestions = await questionService.getQuestionsByQuizId(quizId) || [];
      
      // Get user's actual answers
      const userAnswers = await resultService.getUserAnswersByResultId(resultId) || [];
      
      // Create a map of user answers for quick lookup
      const userAnswerMap = {};
      userAnswers.forEach(answer => {
          userAnswerMap[answer.question_id] = answer;
      });
      
      // Process all questions (answered and unanswered)
      const answers = await Promise.all(allQuestions.map(async (question) => {
          // Get user's answer for this question or null if not answered
          const userAnswer = userAnswerMap[question.id] || null;
          
          // Get the correct option
          const correctOption = await optionService.getCorrectOptionByQuestionId(question.id) || 0;
          
          // Get all options for this question
          const allOptions = await optionService.getOptionsByQuestionId(question.id) || [];
          
          // Determine if user's answer is correct
          const isCorrect = userAnswer && correctOption && userAnswer.option_id === correctOption.id;
          
          // Create enriched answer object
          return {
              question_id: question.id,
              option_id: userAnswer ? userAnswer.option_id : null, // Will be null if unanswered
              result_id: resultId,
              question: question,
              correctOption: correctOption,
              allOptions: allOptions,
              isCorrect: isCorrect,
              isAnswered: !!userAnswer, // Boolean flag to indicate if question was answered
              correctOptionId: correctOption ? correctOption.id : null,
              correctOptionText: correctOption ? correctOption.text || correctOption.content : "No correct answer defined"
          };
      }));
      
      // Calculate duration
      const startTime = moment(result.start_time);
      const endTime = moment(result.end_time);
      const duration = moment.duration(endTime.diff(startTime));
      const formattedDuration = `${duration.hours()} giờ ${duration.minutes()} phút ${duration.seconds()} giây`;
      
      const data = {
          result: result,
          user: user,
          answers: answers,
          duration: formattedDuration
      };
      
      res.render('quiz/checkResultE', {
          data,
          layout: false,
      });
          
    },

    addFullQuiz: async (req, res) => {
         try {
                const data = req.body;
                const quiz = {
                    title: data.quizTitle,
                    description: data.quizDescription,
                    createdBy: session.userID || 1,
                    category: data.categoryId,
                    tag: data.tag,
                    time: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    media: data.quizMedia
                };
        
                // Add the quiz to the database and get the inserted quiz ID
                const quizId = await quizService.addQuiz(quiz) || 0;
        
                // Get question from request body and add them to the quiz
                const questions = data.questionList || [];
        
                // Add quizId to each question object and add new question to the database
                // This returns an array of inserted questions
                const insertedQuestions = await questionService.addQuestions(quizId, questions) || 0;
        
                // Now add options for each inserted question using their "option" property
                await answerService.addOptionsForAllQuestions(questions, insertedQuestions) || 0;
        
                res.json({
                    message: "Quiz created successfully",
                    quizId,
                    insertedQuestions
                });
            } catch (error) {
                console.error('Error creating quiz:', error);
                res.status(500).json({ error: 'Failed to create quiz' });
            }
        }
    
}