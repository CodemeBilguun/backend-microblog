import { Request, Response } from "express";
import * as userService from "../services/user.service";
import prisma from "../utils/prisma.util";
import { Role } from "@prisma/client";
// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const users = await userService.getAllUsers();

    res.json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Failed to get users" });
  }
};

// Get user by ID (admin only)
export const getUserById = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;

    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Failed to get user" });
  }
};

// Update user (admin only)
export const updateUser = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;
    const { name, email, password, role, isVerified } = req.body;

    // Don't allow changing the admin's own role to prevent lockout
    if (id === req.user.id && role && role !== Role.ADMIN) {
      return res.status(403).json({
        message: "You cannot change your own admin role",
      });
    }

    const updatedUser = await userService.updateUser(id, {
      name,
      email,
      password,
      role,
      isVerified,
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;

    // Don't allow admins to delete themselves
    if (id === req.user.id) {
      return res.status(403).json({
        message: "You cannot delete your own admin account",
      });
    }

    await userService.deleteUser(id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// Get dashboard stats (admin only)
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const [
      userCount,
      articleCount,
      commentCount,
      publishedArticleCount,
      tagCount,
      recentUsers,
      recentArticles,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.article.count(),
      prisma.comment.count(),
      prisma.article.count({ where: { isPublished: true } }),
      prisma.tag.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.article.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          isPublished: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    res.json({
      counts: {
        users: userCount,
        articles: articleCount,
        publishedArticles: publishedArticleCount,
        comments: commentCount,
        tags: tagCount,
      },
      recent: {
        users: recentUsers,
        articles: recentArticles,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Failed to get dashboard statistics" });
  }
};
