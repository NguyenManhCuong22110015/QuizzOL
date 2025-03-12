import express from 'express';
import passport from 'passport';
import session from 'express-session'
import { engine } from 'express-handlebars'; 
import path from 'path';
import { fileURLToPath } from 'url';
import quizRoute from './routes/quizRoute.js';
import authLoginRoute from './routes/authLoginRoute.js';
import './authentication/passport-setup.js';

import moment from 'moment-timezone';


const app = express()


   app.engine('hbs', engine({
    extname : 'hbs',
    helpers: {
      extractFirstImage: function (content) {
        if (!content) {
          return 'imgs/no_image.jpg';
        }
        const imgTagMatch = content.match(/<img[^>]+src="([^">]+)"/);
        return imgTagMatch ? imgTagMatch[1] : 'imgs/no_image.jpg';
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
      formatDate: function (dateString) {
        return moment(dateString)
          .tz('Asia/Ho_Chi_Minh')  
          .format('h:mm A z, dddd MMMM D, YYYY');  
      },
      formatLongDate: function(dateString) {
        return moment(dateString)
            .tz('Asia/Ho_Chi_Minh')
            .format('dddd, MMMM Do YYYY');
    },
      isUndefined: function(value) {
        return value === null || value === undefined;
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
}
    
    }
  }));
  app.set('view engine', 'hbs');
  app.set('views', './views');
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.use(session({
      secret: 'Q2VNTVN3QklsQXZTRmFhRHV6ZEtKcHhDdFNldG4xTHdGSzRCWkunSmJ5UT8',
      resave: false,
      saveUninitialized: true,
      cookie: { 
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      
    }
}));
app.use(passport.initialize());
  app.use(passport.session());


app.use(async function (req, res, next) {
    if(req.session.auth === null || req.session.auth === undefined){
      req.session.auth = false;
    }
    
    res.locals.auth = req.session.auth;
    res.locals.authUser = req.session.authUser || null;
    
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


app.get("/", (req, res) => {
    res.send("Hello word")
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()  => {
    console.log("App is running")
})
