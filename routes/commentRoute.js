import { Router } from "express";
import commentController from "../controllers/commentController.js";

const router = new Router();

// API endpoint để thêm comment
router.post("/add-comment", commentController.addComment);

// API endpoint để thêm hoặc cập nhật rating
router.post("/add-rating", commentController.addRating);

// API endpoint để lấy rating của người dùng cho một quiz
router.get("/user-rating/:quizId/:userId", commentController.getUserRating);

export default router;