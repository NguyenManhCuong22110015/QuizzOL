import db from '../configs/db.js';


export default {

    getAll(){
        return db('category').select('*');
    }

}