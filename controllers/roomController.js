import roomService from "../services/roomService.js";
import userService from "../services/userService.js";
import dotenv from 'dotenv';
dotenv.config();

export default {
  /**
   * Get paginated list of rooms
   */
  getRoomList: async (req, res) => {
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
  },

  /**
   * Get chat page for a specific room
   */
  getChatPage: async (req, res) => {
    try {
      const roomId = req.params.roomId;
      
      // Get username from session if user is logged in
      let username = null;
      let avatar = null;
      let user = null;
      if (req.session && req.session.authUser) {
          
          username = await userService.getUsernameByAccountId(req.session.authUser.id);
          avatar = await userService.getAvatarByAccountId(req.session.authUser.id);
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
    } catch (error) {
      console.error('Error rendering chat page:', error);
      res.status(500).send('Server error');
    }
  },

  /**
   * Check if a password is correct for a room
   */
  checkRoomPassword: async (req, res) => {
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
  },

  /**
   * Create a new room
   */
  createRoom: async (req, res) => {
    try {
      const { name, max_participants, password, description } = req.body;
      
      // Validate the user is logged in
      if (!req.session || !req.session.authUser) {
        return res.status(401).json({ 
          success: false, 
          message: 'You must be logged in to create a room' 
        });
      }
      
      const userId = req.session.authUser.id;
      const result = await roomService.createRoom(userId, name, max_participants, password, description);
      
      if (result.success) {
        return res.json({ 
          success: true, 
          message: 'Room created successfully',
          roomId: result.roomId 
        });
      } else {
        return res.status(400).json({ 
          success: false, 
          message: result.message 
        });
      }
    } catch (error) {
      console.error('Error creating room:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },
  
  /**
   * Join a room
   */
  joinRoom: async (req, res) => {
    try {
      const roomId = req.params.roomId;
      
      // Validate the user is logged in
      if (!req.session || !req.session.authUser) {
        return res.status(401).json({ 
          success: false, 
          message: 'You must be logged in to join a room' 
        });
      }
      
      const userId = req.session.authUser.id;
      const result = await roomService.joinRoom(roomId, userId);
      
      return res.json(result);
    } catch (error) {
      console.error('Error joining room:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },
  
  /**
   * Leave a room
   */
  leaveRoom: async (req, res) => {
    try {
      const roomId = req.params.roomId;
      
      // Validate the user is logged in
      if (!req.session || !req.session.authUser) {
        return res.status(401).json({ 
          success: false, 
          message: 'You must be logged in to leave a room' 
        });
      }
      
      const userId = req.session.authUser.id;
      const result = await roomService.leaveRoom(roomId, userId);
      
      return res.json(result);
    } catch (error) {
      console.error('Error leaving room:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },
  
  /**
   * Get room details
   */
  getRoomDetails: async (req, res) => {
    try {
      const roomId = req.params.roomId;
      const room = await roomService.getRoomDetails(roomId);
      
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }
      
      return res.json({
        success: true,
        room: room
      });
    } catch (error) {
      console.error('Error getting room details:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
};