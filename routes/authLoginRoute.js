import { Router } from 'express';
import { renderLoginPage,loginToFacebook ,handleLogin, handleSignup, loginToGoogle, loginToGithub} from '../controllers/authController.js';

import facebookPassport from '../authentication/facebook.js';
import googlePassport from '../authentication/google.js';
import githubPassport from '../authentication/github.js';


const router = Router();

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

export default router;