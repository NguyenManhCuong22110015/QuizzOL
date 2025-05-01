import express from "express";
import passport from "passport";
import session from "express-session";
import mysqlSession from "express-mysql-session";
import cloudinary from "cloudinary";



import { engine } from 'express-handlebars'; 
import path from 'path';
import { fileURLToPath } from 'url';
import quizRoute from './routes/quizRoute.js';
import authLoginRoute from './routes/authLoginRoute.js';
import flashCardRoute from './routes/flashCardRoute.js';
import rankingRoute from './routes/rankingRoute.js';
import homeRoute from './routes/homeRoute.js';
import userRoute from './routes/userRoute.js'
import adminRoute from './routes/adminRoute.js';
import studentRoute from './routes/studentRoute.js';
import './authentication/passport-setup.js';
import  {options} from './configs/db.js';
import moment from 'moment-timezone';
import dotenv from 'dotenv'; 
import mediaRoute from './routes/mediaRoute.js';
import userAnswerRoute from './routes/userAnswerRoute.js';
import resultRoute from './routes/resultRoute.js';
import flash from 'connect-flash'; 
import questionRoute from './routes/questionRoute.js';
import commentRoute from './routes/commentRoute.js';
import roomRouter from './routes/roomRoute.js';
import chatbotRouter from './routes/chatbotRouter.js';


dotenv.config();
const app = express();
app.set("trust proxy", 1);
app.use(flash());

   app.engine('hbs', engine({
    extname : 'hbs',
    helpers: {
      extractFirstImage: function (content) {
        if (!content) {
          return "imgs/no_image.jpg";
        }
        const imgTagMatch = content.match(/<img[^>]+src="([^">]+)"/);
        return imgTagMatch ? imgTagMatch[1] : "imgs/no_image.jpg";
      },
      inc: function (value) {
        return parseInt(value) + 1;
      },
      ifEquals: function (arg1, arg2, options) {
        return arg1 == arg2 ? options.fn(this) : options.inverse(this);
      },
      chunk: function (array, size) {
        const chunkedArr = [];
        for (let i = 0; i < array.length; i += size) {
          chunkedArr.push(array.slice(i, i + size));
        }
        return chunkedArr;
      },
      eq: function (a, b) {
        return a === b;
      },
      noteq: function (a, b) {
        return a !== b;
      },
      gt: function (a, b) {
        return a > b;
      },
      formatDate: function (dateString) {
        return moment(dateString)
          .tz("Asia/Ho_Chi_Minh")
          .format("h:mm A z, dddd MMMM D, YYYY");
      },
      formatLongDate: function (dateString) {
        return moment(dateString)
          .tz("Asia/Ho_Chi_Minh")
          .format("dddd, MMMM Do YYYY");
      },
      isUndefined: function (value) {
        return value === null || value === undefined;
       },
       json: function(context) {
        return JSON.stringify(context);
      },
       firstLetter: function(text) {
        if (!text || typeof text !== 'string' || text.length === 0) {
          return '';
        }
        return text.charAt(0).toUpperCase();
      },
       toUpperCase: function(text) {
        return text ? text.toUpperCase() : '';
    },
      or: function() {
      // Remove the last argument (Handlebars options)
      const args = Array.prototype.slice.call(arguments, 0, -1);
      return args.some(Boolean);
  },
     isSubscriptionActive : function(expiryDate) {
      if (!expiryDate) return false;
      const today = new Date();
      const expiry = new Date(expiryDate);
      
      return expiry > today;
  },
      range: function(start, end) {
    const array = [];
    for (let i = start; i <= end; i++) {
      array.push(i);
    }
    return array;
  },
  add: function (a, b) {
    return a + b;
  },
  pageRange: function (currentPage, totalPages) {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    
    if (end - start < 4 && totalPages > 5) {
      if (currentPage < totalPages / 2) {
        end = Math.min(totalPages, start + 4);
      } else {
        start = Math.max(1, end - 4);
      }
    }
    
    const result = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  },
  stars: function (rating) {
    const fullStars = Math.floor(rating); // Number of full stars
    const halfStar = rating % 1 >= 0.5 ? 1 : 0; // Add a half star if the remainder is >= 0.5
    const emptyStars = 5 - fullStars - halfStar; // Remaining empty stars

    // Generate HTML for stars
    let html = "";
    for (let i = 0; i < fullStars; i++) {
      html += '<i class="fas fa-star"></i>'; // Full star
    }
    if (halfStar) {
      html += '<i class="fas fa-star-half-alt"></i>'; // Half star
    }
    for (let i = 0; i < emptyStars; i++) {
      html += '<i class="far fa-star"></i>'; // Empty star
    }
    html +=
      '<span class="rating-text" style="color: Gray; font-weight: bold;"> (' + rating.toFixed(1) + ')</span>'; // Add vibrant yellow rating text
    // Return the HTML string for stars and rating text

    return html;
  },
  getRemainingDays: function(expiryDate) {
    if (!expiryDate) return 'No subscription';
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    // Reset time part for accurate day calculation
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return '1 day remaining';
    return `${diffDays} days remaining`;
},
math: function(lvalue, operator, rvalue) {
  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);
  
  return {
      '+': lvalue + rvalue,
      '-': lvalue - rvalue,
      '*': lvalue * rvalue,
      '/': lvalue / rvalue,
      '%': lvalue % rvalue
  }[operator];
}
,
    lt : function(a, b) {
      return a < b;
    },
    subtract : function(a, b) {
      return a - b;
    },
    each_page: function(from, to, current, options) {
      let result = '';
      
      // Show max 5 page numbers to avoid cluttering
      let start = Math.max(1, current - 2);
      let end = Math.min(to, start + 4);
      
      // Adjust start if we're near the end
      if (end - start < 4) {
        start = Math.max(1, end - 4);
      }
      
      for (let i = start; i <= end; i++) {
        result += options.fn({
          number: i,
          active: i === current
        });
      }
      
      return result;
    },
    and:  function() {
      return Array.prototype.slice.call(arguments, 0, -1).every(Boolean);
    },
    not: function(value) {
      return !value;
    }
 
    
    }
  }));
  app.set('view engine', 'hbs');
  app.set('views', './views');
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.join(__dirname, 'public')));
  const MySQLStore = mysqlSession(session);
  const sessionStore = new MySQLStore({
    ...options,
    clearExpired: true,               
    checkExpirationInterval: 900000,  
    expiration: 86400000              
  });
  app.use(session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      store:sessionStore,
      saveUninitialized: true,
      cookie: { 
        secure: process.env.NODE_ENV === 'production', // Automatically true in production
        httpOnly: true,
       maxAge: 24 * 60 * 60 * 1000,
       domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN_URL : undefined,
       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(async function (req, res, next) {
  if (req.session.auth === null || req.session.auth === undefined) {
    req.session.auth = false;
  }

  res.locals.auth = req.session.auth;
  res.locals.authUser = req.session.authUser || null;

  next();
});
app.use((req, res, next) => {
  // Trước khi render, thêm biến loading
  res.locals.showLoading = true;
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//   app.use(facebookPassport.initialize());
//   app.use(facebookPassport.session());
//   app.use(googlePassport.initialize());
//   app.use(googlePassport.session());
//   app.use(passport.initialize());
//   app.use(passport.session());
//   app.use(githubPassport.initialize());
 // app.use(githubPassport.session());
  
app.use('/quiz', quizRoute);
app.use('/auth', authLoginRoute);
app.use("/flashCard", flashCardRoute);
app.use("/ranking", rankingRoute);
app.use("/", homeRoute);
app.use("/user", userRoute);
app.use("/media", mediaRoute);
app.use("/admin", adminRoute);
app.use("/student", studentRoute);

app.use("/user-answer", userAnswerRoute);  
app.use("/result", resultRoute);
app.use("/question", questionRoute);
app.use("/comment", commentRoute);
app.use("/room", roomRouter);
app.use("/chatbot", chatbotRouter);
app.get("/", (req, res) => {
  res.send("Hello word");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("App is running");
});
