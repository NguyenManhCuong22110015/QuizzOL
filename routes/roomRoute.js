import {Router} from 'express'
import roomService from "../services/roomService.js"
import  userSerive from "../services/userService.js"
import dotenv from 'dotenv';
dotenv.config();
const router = new Router()

router.get('/list', async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = 6; // 6 rooms per page
      
      const result = await roomService.getAllRooms(page, limit);
     
      res.render('room/listRoom', { 
          rooms: result.rooms,
          pagination: result.pagination,
      });
  } catch (error) {
      console.error('Error rendering room list:', error);
      res.status(500).send('Server error');
  }
});

router.get('/chat-page/:roomId',async (req, res) => {
    const roomId = req.params.roomId;
    
    // Get username from session if user is logged in
    let username = null;
    let avatar = null;
    let user = null;
    if (req.session && req.session.authUser) {
        
        username = await userSerive.getUsernameByAccountId(req.session.authUser.id);
        avatar = await userSerive.getAvatarByAccountId(req.session.authUser.id);
        user = {
            id: req.session.authUser.id,
            username: username,
            avatar: avatar,
        }
    }
    console.log('Username:', username);
    res.render('room/chatPageRoom', { 
        roomId: roomId,
        user: JSON.stringify(user),
        username: username, 
        WEBSOCKET_URL: process.env.WEBSOCKET_URL,
       
    });
  });
  
router.post('/check-password/:roomId', async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const { password } = req.body;
        
        const result = await roomService.checkRoomPassword(roomId, password);
        
        return res.json(result);
    } catch (error) {
        console.error('Error checking room password:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

router.post('/create', async (req, res) => {

    try {
        const { name,max_participants, password, description } = req.body;
        const userId = req.session.authUser.id; // Assuming you have the user ID in the session
        const result = await roomService.createRoom(userId, name,max_participants, password, description);
        
        if (result.success) {
            return res.json({ success: true, message: 'Room created successfully' });
        } else {
            return res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Error creating room:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }

});


export default router;