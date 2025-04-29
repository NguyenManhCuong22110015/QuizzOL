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
                
            // Get total count for pagination
            const totalCount = await db('room')
                .count('* as count')
                .first();
                
            return {
                rooms,
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
    }



}