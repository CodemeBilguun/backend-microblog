import { Request, Response } from "express";
import * as articleService from "../services/article.service";
import { Role } from "@prisma/client";

// Get all articles (public)
export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const tag = req.query.tag as string;

    // Non-authenticated users or regular users can only see published articles
    const publishedOnly = !req.user || req.user.role === Role.READER;

    let { articles, total } = await articleService.getAllArticles(
      page,
      limit,
      publishedOnly
    );

    // Filter by tag if specified
    if (tag) {
      articles = articles.filter((article) =>
        article.tags.some((t) => t.tag.name.toLowerCase() === tag.toLowerCase())
      );
    }

    res.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all articles error:", error);
    res.status(500).json({ message: "Failed to get articles" });
  }
};

// Get single article by ID
export const getArticleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const article = await articleService.getArticleById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Check if article is published or user is author/admin/editor
    const isAuthor = req.user && req.user.id === article.authorId;
    const isStaff =
      req.user &&
      (req.user.role === Role.ADMIN || req.user.role === Role.EDITOR);

    if (!article.isPublished && !isAuthor && !isStaff) {
      return res
        .status(403)
        .json({ message: "This article is not yet published" });
    }

    res.json(article);
  } catch (error) {
    console.error("Get article by ID error:", error);
    res.status(500).json({ message: "Failed to get article" });
  }
};

// Create article (requires authentication)
export const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, content, isPublished, tagIds } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const article = await articleService.createArticle({
      title,
      content,
      authorId: req.user.id,
      isPublished: isPublished || false,
      tagIds,
    });

    res.status(201).json(article);
  } catch (error) {
    console.error("Create article error:", error);
    res.status(500).json({ message: "Failed to create article" });
  }
};

// Update article (requires authentication and authorization)
export const updateArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, isPublished, tagIds } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if article exists
    const article = await articleService.getArticleById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Check if user is the author or admin/editor
    const isAuthor = req.user.id === article.authorId;
    const isAdmin = req.user.role === Role.ADMIN;
    const isEditor = req.user.role === Role.EDITOR;

    if (!isAuthor && !isAdmin && !isEditor) {
      return res
        .status(403)
        .json({ message: "You don't have permission to update this article" });
    }

    // Regular users can only update their own articles
    // Editors can publish/unpublish any article
    // Admins can do anything
    if (!isAdmin && !isAuthor && isEditor && (title || content)) {
      return res
        .status(403)
        .json({ message: "Editors can only change publication status" });
    }

    const updatedArticle = await articleService.updateArticle(id, {
      title,
      content,
      isPublished,
      tagIds,
    });

    res.json(updatedArticle);
  } catch (error) {
    console.error("Update article error:", error);
    res.status(500).json({ message: "Failed to update article" });
  }
};

// Delete article (requires authentication and authorization)
export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if article exists
    const article = await articleService.getArticleById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Only author or admin can delete
    const isAuthor = req.user.id === article.authorId;
    const isAdmin = req.user.role === Role.ADMIN;

    if (!isAuthor && !isAdmin) {
      return res
        .status(403)
        .json({ message: "You don't have permission to delete this article" });
    }

    await articleService.deleteArticle(id);

    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Delete article error:", error);
    res.status(500).json({ message: "Failed to delete article" });
  }
};

// Toggle like (requires authentication)
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if article exists
    const article = await articleService.getArticleById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Can't like unpublished articles unless you're the author
    if (!article.isPublished && req.user.id !== article.authorId) {
      return res
        .status(403)
        .json({ message: "This article is not yet published" });
    }

    const liked = await articleService.toggleLike(req.user.id, id);

    res.json({
      message: liked ? "Article liked" : "Article unliked",
      liked,
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ message: "Failed to toggle like" });
  }
};

// Get all tags
export const getAllTags = async (req: Request, res: Response) => {
  try {
    const tags = await articleService.getAllTags();

    res.json(tags);
  } catch (error) {
    console.error("Get all tags error:", error);
    res.status(500).json({ message: "Failed to get tags" });
  }
};

// Create tag (requires admin or editor role)
export const createTag = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role !== Role.ADMIN && req.user.role !== Role.EDITOR) {
      return res.status(403).json({ message: "Permission denied" });
    }

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Tag name is required" });
    }

    const tag = await articleService.createTag(name.toLowerCase().trim());

    res.status(201).json(tag);
  } catch (error: any) {
    console.error("Create tag error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({ message: "Tag already exists" });
    }

    res.status(500).json({ message: "Failed to create tag" });
  }
};
