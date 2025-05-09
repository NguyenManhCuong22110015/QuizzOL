import { Router } from 'express';
import homeController from '../controllers/homeController.js';

const router = new Router();

// Home page route
router.get('/', homeController.getHomePage);

// API endpoint to get top players
router.get("/getTopPlayersByCriteria", homeController.getTopPlayersByCriteria);

export default router;