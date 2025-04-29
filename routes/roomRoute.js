import {Router} from 'express'
import roomService from "../services/roomService.js"
import  userSerive from "../services/userService.js"
const router = new Router()

router.get('/list', async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = 6; // 6 rooms per page
      
      const result = await roomService.getAllRooms(page, limit);
      
      res.render('room/listRoom', { 
          rooms: result.rooms,
          pagination: result.pagination
      });
  } catch (error) {
      console.error('Error rendering room list:', error);
      res.status(500).send('Server error');
  }
});

router.get('/chat-page/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  
  // Get username from session if user is logged in
  let username = null;
  if (req.session && req.session.authUser) {
      
      username = req.session.authUser.username;
  }
  
  res.render('room/chatPageRoom', { 
      roomId: roomId,
      username: username
  });
});


export default router;