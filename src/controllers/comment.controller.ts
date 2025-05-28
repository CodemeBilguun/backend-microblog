import { Request, Response } from "express";
import prisma from "../utils/prisma.util";
import { Role } from "@prisma/client";

// Get comments for an article
export const getCommentsByArticle = async (req: Request, res: Response) => {
  try {
    const { articleId } = req.params;

    // Check if article exists and is published
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Only allow comments on published articles unless user is author/admin/editor
    if (!article.isPublished) {
      if (!req.user) {
        return res
          .status(403)
          .json({ message: "This article is not published" });
      }

      const isAuthor = req.user.id === article.authorId;
      const isStaff =
        req.user.role === Role.ADMIN || req.user.role === Role.EDITOR;

      if (!isAuthor && !isStaff) {
        return res
          .status(403)
          .json({ message: "This article is not published" });
      }
    }

    const comments = await prisma.comment.findMany({
      where: { articleId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Failed to get comments" });
  }
};

// Create a comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const { articleId } = req.params;
    const { content } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if article exists and is published
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Only allow comments on published articles unless user is author/admin/editor
    if (!article.isPublished) {
      const isAuthor = req.user.id === article.authorId;
      const isStaff =
        req.user.role === Role.ADMIN || req.user.role === Role.EDITOR;

      if (!isAuthor && !isStaff) {
        return res
          .status(403)
          .json({ message: "This article is not published" });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.user.id,
        articleId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: "Failed to create comment" });
  }
};

// Update a comment
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only allow comment author or admin to update
    const isAuthor = req.user.id === comment.userId;
    const isAdmin = req.user.role === Role.ADMIN;

    if (!isAuthor && !isAdmin) {
      return res
        .status(403)
        .json({ message: "You don't have permission to update this comment" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(updatedComment);
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ message: "Failed to update comment" });
  }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only allow comment author or admin to delete
    const isAuthor = req.user.id === comment.userId;
    const isAdmin = req.user.role === Role.ADMIN;
    const isArticleAuthor =
      req.user.id ===
      (
        await prisma.article.findUnique({
          where: { id: comment.articleId },
          select: { authorId: true },
        })
      )?.authorId;

    if (!isAuthor && !isAdmin && !isArticleAuthor) {
      return res
        .status(403)
        .json({ message: "You don't have permission to delete this comment" });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};
