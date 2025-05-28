import { Router } from "express";
import * as commentController from "../controllers/comment.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validateComment } from "../middleware/validation.middleware";

const router = Router();

// Public routes
router.get("/article/:articleId", commentController.getCommentsByArticle);

// Protected routes
router.post(
  "/article/:articleId",
  authenticate,
  validateComment,
  commentController.createComment
);
router.put(
  "/:commentId",
  authenticate,
  validateComment,
  commentController.updateComment
);
router.delete("/:commentId", authenticate, commentController.deleteComment);

export default router;
