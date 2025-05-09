import db from '../configs/db.js';

export default {
    // Get rooms with pagination
    async getRoomsWithPagination(limit, offset) {
        return db('room')
            .leftJoin('user', 'room.creator', 'user.id')
            .leftJoin('quiz', 'room.quiz', 'quiz.id')
            .select(
                'room.*',
                'user.username as creatorName',
                'quiz.title as quizTitle'
            )
            .limit(limit)
            .offset(offset);
    },
    
    // Count total number of rooms
    async countTotalRooms() {
        return db('room')
            .count('* as count')
            .first();
    },
    
    // Get a room by its ID
    async getRoomById(roomId) {
        return db('room')
            .where('id', roomId)
            .first();
    },
    
    // Create a new room
    async insertRoom(roomData) {
        const [roomId] = await db('room').insert(roomData);
        return roomId;
    },
    
    // Update a room
    async updateRoom(roomId, roomData) {
        return db('room')
            .where('id', roomId)
            .update(roomData);
    },
    
    // Delete a room
    async deleteRoom(roomId) {
        return db('room')
            .where('id', roomId)
            .delete();
    },
    
    // Add a user to a room
    async addUserToRoom(roomId, userId, isHost = false) {
        return db('room_user').insert({
            room_id: roomId,
            user_id: userId,
            is_host: isHost
        });
    },
    
    // Remove a user from a room
    async removeUserFromRoom(roomId, userId) {
        return db('room_user')
            .where({
                room_id: roomId,
                user_id: userId
            })
            .delete();
    },
    
    // Get users in a room
    async getUsersInRoom(roomId) {
        return db('room_user')
            .join('user', 'room_user.user_id', 'user.id')
            .leftJoin('media', 'user.avatar', 'media.id')
            .where('room_user.room_id', roomId)
            .select(
                'user.id',
                'user.username',
                'media.url as avatarUrl',
                'room_user.is_host'
            );
    },
    
    // Check if room exists
    async checkRoomExists(roomId) {
        const room = await db('room')
            .where('id', roomId)
            .first();
        return !!room;
    },
    
    // Check if user is in room
    async isUserInRoom(roomId, userId) {
        const record = await db('room_user')
            .where({
                room_id: roomId,
                user_id: userId
            })
            .first();
        return !!record;
    },
    
    // Get room details with complete quiz info
    async getRoomWithQuiz(roomId) {
        return db('room')
            .leftJoin('quiz', 'room.quiz', 'quiz.id')
            .leftJoin('user', 'room.creator', 'user.id')
            .where('room.id', roomId)
            .select(
                'room.*',
                'quiz.title as quizTitle',
                'quiz.description as quizDescription',
                'quiz.time as quizTime',
                'user.username as creatorName'
            )
            .first();
    },
    
    // Update room active status
    async updateRoomActiveStatus(roomId, isActive) {
        return db('room')
            .where('id', roomId)
            .update({ isActive });
    },
    
    // Update current players count
    async updateCurrentPlayers(roomId, count) {
        return db('room')
            .where('id', roomId)
            .update({ current_players: count });
    },
    
    // Get quiz ID for a room
    async getRoomQuizIds(roomId) {
        const room = await db('room')
            .where('id', roomId)
            .select('quiz')
            .first();
        return room?.quiz ? [room.quiz] : [];
    },
    
    // Get quizzes by IDs
    async getQuizzesByIds(quizIds) {
        if (!quizIds.length) return [];
        return db('quiz').whereIn('id', quizIds);
    },
    
    // Get questions for quizzes with options
    async getQuestionsWithOptionsForQuizzes(quizIds) {
        if (!quizIds.length) return [];
        
        // Get questions for the quiz IDs
        const questions = await db('question')
            .join('quiz_question', 'question.id', '=', 'quiz_question.question_id')
            .whereIn('quiz_question.quiz_id', quizIds)
            .select('question.*', 'quiz_question.quiz_id');
        
        // Get options for those questions
        const questionIds = questions.map(q => q.id);
        let options = [];
        
        if (questionIds.length) {
            options = await db('option').whereIn('question_id', questionIds);
        }
        
        // Combine questions with their options
        return questions.map(question => ({
            ...question,
            options: options.filter(opt => opt.question_id === question.id)
        }));
    },
    
    // Reset room on close
    async resetRoom(roomId) {
        return db('room')
            .where('id', roomId)
            .update({
                isActive: false,
                current_players: 0
            });
    },
    
    // Update room user role
    async updateRoomUserRole(roomId, userId, isHost) {
        return db('room_user')
            .where({
                room_id: roomId,
                user_id: userId
            })
            .update({ is_host: isHost });
    },
    
    // Get active rooms
    async getActiveRooms() {
        return db('room')
            .where('isActive', true)
            .select('*');
    },
    
    // Get rooms by creator
    async getRoomsByCreator(creatorId) {
        return db('room')
            .where('creator', creatorId)
            .select('*');
    },
    
    // Associate quiz with room
    async assignQuizToRoom(roomId, quizId) {
        return db('room')
            .where('id', roomId)
            .update({ quiz: quizId });
    },
    
    // Get room counts by quiz
    async getRoomCountsByQuiz(quizId) {
        const result = await db('room')
            .where('quiz', quizId)
            .count('id as count')
            .first();
        return result ? result.count : 0;
    },
    
    // Find room by name
    async findRoomByName(roomName) {
        return db('room')
            .where('name', 'like', `%${roomName}%`)
            .select('*');
    },
    
    // Check if a user is a host in a room
    async isUserHost(roomId, userId) {
        const record = await db('room_user')
            .where({
                room_id: roomId,
                user_id: userId,
                is_host: true
            })
            .first();
        return !!record;
    },
    
    // Get rooms with active players
    async getActivePlayerRooms(minPlayers = 1) {
        return db('room')
            .where('isActive', true)
            .where('current_players', '>=', minPlayers)
            .select('*');
    },
    
    // Get all public rooms (no password)
    async getPublicRooms() {
        return db('room')
            .whereNull('password')
            .orWhere('password', '')
            .select('*');
    }
};