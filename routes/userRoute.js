import { Router } from 'express';
import check from "../middlewares/auth.mdw.js";
import userController from '../controllers/userController.js';

const router = new Router();

// Profile and overview routes
router.get('/profile', check, userController.getProfilePage);
router.get('/overview', check, userController.getOverviewPage);

// User data update routes
router.post('/update-field', check, userController.updateField);
router.post('/update-birthday', check, userController.updateBirthday);
router.post('/update-avatar', check, userController.updateAvatar);

export default router;