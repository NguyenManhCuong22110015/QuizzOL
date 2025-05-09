import roomRepository from '../repositories/roomRepository.js';

export default {
    async getAllRooms(page = 1, limit = 6) {
        try {
            const offset = (page - 1) * limit;
            
            // Get rooms with pagination using repository
            const rooms = await roomRepository.getRoomsWithPagination(limit, offset);
            
            // Process rooms to set is_private flag based on password
            const processedRooms = rooms.map(room => {
                // Set is_private flag based on whether password exists and is not empty
                return {
                    ...room,
                    is_private: room.password !== null && room.password.trim() !== ''
                };
            });
                
            // Get total count for pagination
            const totalCount = await roomRepository.countTotalRooms();
                
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
            const room = await roomRepository.getRoomById(roomId);
            
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
    
    async createRoom(userId, name, max_participants, password, description) {
        try {
            const roomData = {
                name: name,
                max_players: max_participants,
                password: password || null,
                creator: userId,
                description: description || null
            };
            
            const roomId = await roomRepository.insertRoom(roomData);
            
            // Add the creator as a host in the room
            await roomRepository.addUserToRoom(roomId, userId, true);
            
            return { 
                success: true, 
                message: 'Room created successfully',
                roomId
            };
        } catch (error) {
            console.error('Error creating room:', error);
            return { success: false, message: 'Server error' };
        }
    },
    
    async joinRoom(roomId, userId) {
        try {
            // Check if room exists
            const roomExists = await roomRepository.checkRoomExists(roomId);
            if (!roomExists) {
                return { success: false, message: 'Room not found' };
            }
            
            // Check if user is already in the room
            const isInRoom = await roomRepository.isUserInRoom(roomId, userId);
            if (isInRoom) {
                return { success: true, message: 'User already in room' };
            }
            
            // Get room to check max players
            const room = await roomRepository.getRoomById(roomId);
            
            // Get current users in the room
            const roomUsers = await roomRepository.getUsersInRoom(roomId);
            
            // Check if room is full
            if (room.max_players && roomUsers.length >= room.max_players) {
                return { success: false, message: 'Room is full' };
            }
            
            // Add user to room
            await roomRepository.addUserToRoom(roomId, userId);
            
            return { success: true, message: 'Joined room successfully' };
        } catch (error) {
            console.error('Error joining room:', error);
            return { success: false, message: 'Server error' };
        }
    },
    
    async leaveRoom(roomId, userId) {
        try {
            await roomRepository.removeUserFromRoom(roomId, userId);
            
            // Check if any users remain in the room
            const roomUsers = await roomRepository.getUsersInRoom(roomId);
            
            // If no users left, delete the room
            if (roomUsers.length === 0) {
                await roomRepository.deleteRoom(roomId);
                return { success: true, message: 'Left room and room was deleted (empty room)' };
            }
            
            // If user was host, assign a new host
            const wasHost = roomUsers.some(user => user.id === userId && user.is_host);
            
            if (wasHost && roomUsers.length > 0) {
                // Assign first remaining user as host
                const newHost = roomUsers.filter(user => user.id !== userId)[0];
                if (newHost) {
                    await roomRepository.updateRoomUserRole(roomId, newHost.id, true);
                }
            }
            
            return { success: true, message: 'Left room successfully' };
        } catch (error) {
            console.error('Error leaving room:', error);
            return { success: false, message: 'Server error' };
        }
    },
    
    async getRoomDetails(roomId) {
        try {
            // Get room details with quiz info
            const room = await roomRepository.getRoomWithQuiz(roomId);
            
            if (!room) {
                return { success: false, message: 'Room not found' };
            }
            
            // Get users in the room
            const users = await roomRepository.getUsersInRoom(roomId);
            
            // Add avatar initials for users without avatars
            users.forEach(user => {
                if (!user.avatarUrl) {
                    user.avatarInitial = user.username.charAt(0).toUpperCase();
                }
            });
            
            // Process private room flag
            const isPrivate = room.password !== null && room.password.trim() !== '';
            
            return {
                success: true,
                room: {
                    ...room,
                    is_private: isPrivate,
                    participants: users,
                    current_participants: users.length,
                }
            };
        } catch (error) {
            console.error('Error getting room details:', error);
            return { success: false, message: 'Server error' };
        }
    },
    
    async updateRoom(roomId, roomData) {
        try {
            await roomRepository.updateRoom(roomId, roomData);
            return { success: true, message: 'Room updated successfully' };
        } catch (error) {
            console.error('Error updating room:', error);
            return { success: false, message: 'Server error' };
        }
    }
};