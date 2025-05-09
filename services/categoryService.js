import db from '../configs/db.js';
import categoryRepository from '../repositories/categoryRepository.js';

export default {

    getAllCategories(){
       return categoryRepository.getAll();
    }

}