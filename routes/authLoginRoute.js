import { Router } from 'express';
import check from '../middlewares/auth.mdw.js';
import authController from '../controllers/authController.js';
import facebookPassport from '../authentication/facebook.js';
import googlePassport from '../authentication/google.js';
import githubPassport from '../authentication/github.js';

const router = Router();

// Email verification
router.get('/verify/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Basic login/signup
router.get('/login', authController.renderLoginPage);
router.post('/login', authController.handleLogin);
router.post('/signup', authController.handleSignup);

// Facebook auth
router.get('/facebook', facebookPassport.authenticate('facebook', { auth_type: 'reauthenticate' }));
router.get('/facebook/callback',
    facebookPassport.authenticate('facebook', { failureRedirect: '/login' }),
    authController.loginToFacebook);

// Google auth
router.get('/google', googlePassport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));
router.get('/google/callback',
    googlePassport.authenticate('google', { failureRedirect: '/login' }),
    authController.loginToGoogle);

// GitHub auth (where needed)
router.get('/github', githubPassport.authenticate('github'));
router.get('/github/callback',
    githubPassport.authenticate('github', { failureRedirect: '/login' }),
    authController.loginToGithub);

// Password management
router.post('/update-password', check, authController.handleUpdatePassword);

// Logout
router.get('/logout', authController.handleLogout);

export default router;