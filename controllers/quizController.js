import resultService from "../services/resultService.js";
import userService from "../services/userService.js";
import questionService from "../services/questionService.js";
import moment from "moment";

export default{
    checkResult : async (req, res) => {
        const resultId = req.params.id
        
        const result = await resultService.getResultById(resultId)  || 0;
        const userId = result.user;
        const user = await userService.getUserById(userId) || 0;
        
        
          // Calculate the duration
          const startTime = moment(result.start_time);
          const endTime = moment(result.end_time);
          const duration = moment.duration(endTime.diff(startTime));
          const formattedDuration = `${duration.hours()} giờ ${duration.minutes()} phút ${duration.seconds()} giây`;

          
          const data = {
              
              result: result,
              user: user,
              duration: formattedDuration 
          };
        
    res.render('quiz/checkResultE', {
      data,
      layout: false,
    })
          
    }
}