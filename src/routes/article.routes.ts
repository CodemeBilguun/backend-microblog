import { Router } from "express";
import * as articleController from "../controllers/article.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validateArticle } from "../middleware/validation.middleware";
import { Role } from "@prisma/client";

const router = Router();

// Public routes
router.get("/", articleController.getAllArticles);
router.get("/tags", articleController.getAllTags);
router.get("/:id", articleController.getArticleById);

// Protected routes
router.post(
  "/",
  authenticate,
  validateArticle,
  articleController.createArticle
);
router.put(
  "/:id",
  authenticate,
  validateArticle,
  articleController.updateArticle
);
router.delete("/:id", authenticate, articleController.deleteArticle);
router.post("/:id/like", authenticate, articleController.toggleLike);
router.post(
  "/tags",
  authenticate,
  authorize([Role.ADMIN, Role.EDITOR]),
  articleController.createTag
);

export default router;
