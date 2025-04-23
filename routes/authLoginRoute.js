import { Router } from 'express';
import check from '../middlewares/auth.mdw.js';
import { renderLoginPage,
  loginToFacebook ,
  handleLogin, 
  handleSignup, 
  loginToGoogle,
  resendVerification, 
  loginToGithub,
  handleUpdatePassword

}
   from '../controllers/authController.js';

import facebookPassport from '../authentication/facebook.js';
import googlePassport from '../authentication/google.js';
import githubPassport from '../authentication/github.js';
import {verifyEmail} from '../controllers/authController.js';

const router = Router();
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/login', renderLoginPage);

router.get('/facebook', facebookPassport.authenticate('facebook',{auth_type: 'reauthenticate'} ));

router.get('/facebook/callback',
    facebookPassport.authenticate('facebook', 
    { failureRedirect: '/login' }),
    loginToFacebook);

router.post('/login', handleLogin );
    
router.post('/signup', handleSignup );

router.get('/google',googlePassport.authenticate('google', { scope: ['profile', 'email'] ,prompt: 'select_account' }));

router.get('/google/callback',googlePassport.authenticate('google', { failureRedirect: '/login' }),
    loginToGoogle);

router.get( '/github',(req, res, next) => {req.logout((err) => {
        if (err) return next(err);
        next();
      }); 
    },
    githubPassport.authenticate('github', { scope: ['user:email'] })
);

router.get( '/github', githubPassport.authenticate('github', { failureRedirect: '/login' }), loginToGithub );

router.post('/update-password',check, handleUpdatePassword);

router.get('/logout', (req, res, next) => {
  
    req.logout(function(err) {
      if (err) { return next(err); }
      
      // Xóa toàn bộ session
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        res.clearCookie('connect.sid');
        
        res.redirect(req.headers.referer || '/' );
      });
    });
  });


export default router;