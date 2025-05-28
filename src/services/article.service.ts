import prisma from "../utils/prisma.util";
import { Article, Tag } from "@prisma/client";

interface CreateArticleData {
  title: string;
  content: string;
  authorId: string;
  isPublished?: boolean;
  tagIds?: string[];
}

interface ArticleWithTags extends Article {
  tags: { tagId: string; tag: Tag }[];
  _count: { likes: number; comments: number };
}

export async function getAllArticles(
  page: number = 1,
  limit: number = 10,
  publishedOnly: boolean = true
): Promise<{ articles: ArticleWithTags[]; total: number }> {
  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: publishedOnly ? { isPublished: true } : {},
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.article.count({
      where: publishedOnly ? { isPublished: true } : {},
    }),
  ]);

  return { articles: articles as ArticleWithTags[], total };
}

export async function getArticleById(
  id: string
): Promise<ArticleWithTags | null> {
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  return article as ArticleWithTags | null;
}

export async function createArticle(data: CreateArticleData): Promise<Article> {
  const { title, content, authorId, isPublished = false, tagIds = [] } = data;

  const article = await prisma.article.create({
    data: {
      title,
      content,
      authorId,
      isPublished,
    },
  });

  // Add tags if provided
  if (tagIds.length > 0) {
    await Promise.all(
      tagIds.map((tagId) =>
        prisma.articleTag.create({
          data: {
            articleId: article.id,
            tagId,
          },
        })
      )
    );
  }

  return article;
}

export async function updateArticle(
  id: string,
  data: Partial<CreateArticleData>
): Promise<Article> {
  const { title, content, isPublished, tagIds } = data;

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(content && { content }),
      ...(isPublished !== undefined && { isPublished }),
    },
  });

  // Update tags if provided
  if (tagIds && tagIds.length > 0) {
    // Remove existing tags
    await prisma.articleTag.deleteMany({
      where: { articleId: id },
    });

    // Add new tags
    await Promise.all(
      tagIds.map((tagId) =>
        prisma.articleTag.create({
          data: {
            articleId: id,
            tagId,
          },
        })
      )
    );
  }

  return article;
}

export async function deleteArticle(id: string): Promise<Article> {
  return await prisma.article.delete({
    where: { id },
  });
}

export async function toggleLike(
  userId: string,
  articleId: string
): Promise<boolean> {
  // Check if like exists
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  });

  if (existingLike) {
    // Unlike
    await prisma.like.delete({
      where: { id: existingLike.id },
    });
    return false;
  } else {
    // Like
    await prisma.like.create({
      data: {
        userId,
        articleId,
      },
    });
    return true;
  }
}

export async function getAllTags(): Promise<Tag[]> {
  return await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createTag(name: string): Promise<Tag> {
  return await prisma.tag.create({
    data: { name },
  });
}
