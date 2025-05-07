import resultService from "../services/resultService.js";
import userService from "../services/userService.js";
import questionService from "../services/questionService.js";
import optionService from "../services/optionService.js";
import moment from "moment";

export default {
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

            // Xử lý dựa trên loại câu hỏi
            let isCorrect = false;
            let correctOption = null;
            let allOptions = [];
            let userSelectedOptions = [];
            let correctAnswer = '';

            switch (question.type) {
                case 'SINGLE_ANSWER':
                case 'TRUE_FALSE':
                    // Lấy đáp án đúng
                    correctOption = await optionService.getCorrectOptionByQuestionId(question.id) || null;

                    // Lấy tất cả các đáp án
                    allOptions = await optionService.getOptionsByQuestionId(question.id) || [];

                    // Kiểm tra nếu người dùng trả lời đúng
                    isCorrect = userAnswer && correctOption && userAnswer.option_id === correctOption.id;
                    break;

                    case 'MULTIPLE_ANSWER':
                        // Lấy tất cả đáp án đúng
                        const correctOptions = await optionService.getCorrectOptionsByQuestionId(question.id) || [];
                        const correctOptionIds = correctOptions.map(opt => opt.id);
    
                        // Lấy tất cả các đáp án
                        allOptions = await optionService.getOptionsByQuestionId(question.id) || [];
    
                        // Lấy câu trả lời của người dùng
                        let selectedOptions = [];
                        if (userAnswer && userAnswer.selected_options) {
                            try {
                                // Chuyển đổi sang mảng số nguyên
                                if (Array.isArray(userAnswer.selected_options)) {
                                    selectedOptions = userAnswer.selected_options.map(id => parseInt(id, 10));
                                } else {
                                    // Nếu là chuỗi JSON, parse trước
                                    const parsedOptions = JSON.parse(userAnswer.selected_options);
                                    selectedOptions = Array.isArray(parsedOptions) ? 
                                        parsedOptions.map(id => parseInt(id, 10)) : [];
                                }
                            } catch (e) {
                                selectedOptions = [];
                            }
                        }
                        userSelectedOptions = selectedOptions;
                        
    
                        // Đánh dấu các options đã được chọn và đúng/sai
                        allOptions = allOptions.map(option => ({
                            ...option,
                            isSelected: selectedOptions.includes(option.id),
                            isCorrect: correctOptionIds.includes(option.id)
                        }));
                       
    
                        // Đúng khi chọn đủ và đúng tất cả các đáp án cần chọn
                        isCorrect = correctOptionIds.length > 0 &&
                            selectedOptions.length === correctOptionIds.length &&
                            correctOptionIds.every(id => selectedOptions.includes(id));
                        break;

                case 'FILL_IN_THE_BLANK':
                    // Lấy câu trả lời đúng
                    correctAnswer = await optionService.getCorrectAnswerByQuestionId(question.id) || '';

                    // So sánh với câu trả lời của người dùng (không phân biệt hoa thường)
                    const userText = userAnswer ? userAnswer.text_answer || '' : '';
                    isCorrect = correctAnswer && userText &&
                        userText.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
                    break;
            }

            // console.log("haha",userSelectedOptions )
            // console.log("isCorrect",isCorrect )

            return {
                question_id: question.id,
                question_type: question.type,
                option_id: userAnswer ? userAnswer.option_id : null,
                text_answer: userAnswer ? userAnswer.text_answer : null,
                selected_options: userSelectedOptions,
                result_id: resultId,
                question: question,
                correctOption: correctOption,
                correctAnswer: correctAnswer,
                allOptions: allOptions,
                isCorrect: isCorrect,
                isAnswered: !!userAnswer,
                correctOptionId: correctOption ? correctOption.id : null,
                correctOptionText: correctOption
                    ? correctOption.text || correctOption.content
                    : (correctAnswer || "No correct answer defined")
            };
        }));

        // Calculate duration
        const startTime = moment(result.start_time);
        const endTime = moment(result.end_time);
        const duration = moment.duration(endTime.diff(startTime));
        const formattedDuration = `${duration.hours()} giờ ${duration.minutes()} phút ${duration.seconds()} giây`;


        // console.log(answers)

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