import db from '../configs/db.js';

export default {

    async getAllRooms(page = 1, limit = 6) {
        try {
            const offset = (page - 1) * limit;
            
            // Get rooms with pagination
            const rooms = await db('room')
                .select('*')
                .limit(limit)
                .offset(offset);
            
            // Process rooms to set is_private flag based on password
            const processedRooms = rooms.map(room => {
                // Set is_private flag based on whether password exists and is not empty
                return {
                    ...room,
                    is_private: room.password !== null && room.password.trim() !== ''
                };
            });
                
            // Get total count for pagination
            const totalCount = await db('room')
                .count('* as count')
                .first();
                
            return {
                rooms: processedRooms,
                pagination: {
                    page,
                    limit,
                    totalRooms: parseInt(totalCount.count),
                    totalPages: Math.ceil(totalCount.count / limit)
                }
            };
        } catch (error) {
            console.error('Error fetching rooms with pagination:', error);
            return {
                rooms: [],
                pagination: {
                    page: 1,
                    limit,
                    totalRooms: 0,
                    totalPages: 0
                }
            }
        }
    },
    async checkRoomPassword(roomId, password) {
        try {
            const room = await db('room')
                .where('id', roomId)
                .first();
            
            if (!room) {
                return { success: false, message: 'Room not found' };
            }
            
            // Check if room is private based on password existence
            const isPrivate = room.password !== null && room.password.trim() !== '';
            
            // If room is not private, no password needed
            if (!isPrivate) {
                return { success: true, message: 'Room is public, no password needed' };
            }
            
            // If room is private, check password
            if (room.password === password) {
                return { success: true, message: 'Password correct' };
            } else {
                return { success: false, message: 'Incorrect password' };
            }
        } catch (error) {
            console.error('Error checking room password:', error);
            return { success: false, message: 'Server error' };
        }
    },
    async createRoom(userId, name,max_participants, password, description){
        try {
            const roomId = await db('room').insert({
                name: name,
                max_players: max_participants,
                password: password,
                creator: userId,
            }).returning('id');
            
           
            return { success: true, message: 'Room created successfully' };
        } catch (error) {
            console.error('Error creating room:', error);
            return { success: false, message: 'Server error' };
        }
    }



}