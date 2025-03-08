import userService from '../services/userService.js';
import authService from '../services/authService.js';

export const renderLoginPage = (req, res) => {
    if (req.headers.referer && !req.headers.referer.includes('/login')) {
        req.session.retUrl = req.headers.referer;
    }
    res.render('pages/login_page');
}

export const loginToFacebook = async (req, res) => {
    try {
        const user = await userService.createAccountForUser(req.user, 'FACEBOOK');
        req.session.userId = user.id;
        req.session.role = user.role;
        req.session.auth = true;
        req.session.authUser = user;
        const currentDate = new Date();
        const expiryDate = new Date(user.subscription_expiry);
        req.session.is_premium = expiryDate > currentDate;
        const retUrl = req.session.retUrl || '/';
        delete req.session.retUrl;
        res.redirect(retUrl);
    } catch (error) {
       res.redirect('auth/login');
    }
}

export const handleLogin = async (req, res) => {
    const email = req.body.login_email || '';
    const password = req.body.login_password || '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      req.flash('error', 'Invalid email format');
      return  res.redirect('auth/login');
    }
    try {
        const user = await authService.login(email, password); 
        if (!user) {
            req.flash('error', 'Invalid email or password');
            return  res.redirect('auth/login');
        }
        
        req.user = user;
        req.session.userId = user.id;
        req.session.role = user.role;
        
        req.session.auth = true;
        req.session.authUser = user;
        
  
        const currentDate = new Date();
        const expiryDate = new Date(user.subscription_expiry);
        req.session.is_premium = expiryDate > currentDate;
  
  
        // Get return URL from session and redirect
        const returnTo = req.session.retUrl || '/';
        delete req.session.retUrl; // Clear stored URL
        return res.redirect(returnTo);
    } catch (error) {
        console.error('Error logging in:', error);
        req.flash('error', 'Internal server error');
        return  res.redirect('auth/login');
    }
}

export const handleSignup = async (req, res) => {
    const email = req.body.reg_email || '';
    const password = req.body.reg_password || '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      req.flash('error', 'Invalid email format');
      return  res.redirect('auth/login');
    }
    const token = req.body['h-captcha-response'];
    if (!token) {
        req.flash('error', 'Please complete the captcha');
        return  res.redirect('auth/login');
    }
  
    try {
      const existingUser = await authService.checkAccountOrCreateAccount(email, password);
  
      if (existingUser === null) {
        req.flash('error', 'Account already exists. Please log in.');
        return  res.redirect('auth/login'); 
      }
      req.flash('success', 'Account created successfully. Please log in.');
       res.redirect('auth/login'); 
  
    } catch (error) {
      console.error('Error during signup:', error);
      req.flash('error', 'Internal server error');
       res.redirect('auth/login');
    }
}
export const loginToGoogle = async (req, res) => {
    try {
      const user = await userService.createAccountForUser(req.user, 'google');
      req.session.userId = user.id;
      req.session.role = user.role;
      req.session.auth = true;
      req.session.authUser = user;
      const currentDate = new Date();
        const expiryDate = new Date(user.subscription_expiry);
        req.session.is_premium = expiryDate > currentDate;
        console.log('user', user);
      const retUrl = req.session.retUrl || '/';
      delete req.session.retUrl;
       return res.redirect(retUrl);
    } catch (error) {
        console.error('Error during Google login:', error);
       res.redirect('auth/login');
    }
}

export const loginToGithub =  async (req, res) => {
    try {
    const user = await userService.createAccountForUser(req.user, 'github');
    req.session.userId = user.id;
    req.session.role = user.role;

    req.session.auth = true;
    req.session.authUser = user;
    const currentDate = new Date();
      const expiryDate = new Date(user.subscription_expiry);
      req.session.is_premium = expiryDate > currentDate;
    const retUrl = req.session.retUrl || '/';
    delete req.session.retUrl;
      res.redirect(retUrl);
    } catch (error) {
     res.redirect('auth/login');
    }
}