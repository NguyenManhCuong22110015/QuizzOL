import { create } from 'express-handlebars';
import db from '../configs/db.js';


export default {
   async createMedia(media) {
        try {
           const { media_url, public_id, mediaType } = media;
            const [result] = await db('media').insert({
                url: media_url,
                public_id: public_id,
                resource_type: mediaType
            })
            return result;
        } catch (error) {
            console.error('Error creating media:', error);
            throw error;
        }
    }
   
}