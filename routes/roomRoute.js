import {Router} from 'express';
import roomController from "../controllers/roomController.js";

const router = new Router();

// Get room list
router.get('/list', roomController.getRoomList);

// Get room chat page
router.get('/chat-page/:roomId', roomController.getChatPage);

// Check room password
router.post('/check-password/:roomId', roomController.checkRoomPassword);

// Create new room
router.post('/create', roomController.createRoom);

// Additional useful routes
router.post('/join/:roomId', roomController.joinRoom);
router.post('/leave/:roomId', roomController.leaveRoom);
router.get('/details/:roomId', roomController.getRoomDetails);

export default router;