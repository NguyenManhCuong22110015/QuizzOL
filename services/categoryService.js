import db from '../configs/db.js';


export default {

    getAllCategories(){
        return db('category').select('*');
    }

}