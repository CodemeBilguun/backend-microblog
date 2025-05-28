import { Request, Response, NextFunction } from "express";

export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body;

  const errors = [];

  if (!name || name.trim() === "") {
    errors.push("Name is required");
  }

  if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    errors.push("Valid email is required");
  }

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

export const validateArticle = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, content } = req.body;

  const errors = [];

  if (!title || title.trim() === "") {
    errors.push("Title is required");
  }

  if (!content || content.trim() === "") {
    errors.push("Content is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
