import { Request, Response, NextFunction } from "express";
import { validateEmail, validatePassword } from "../utils/validation.util";

export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (name.length < 2) {
    return res
      .status(400)
      .json({ message: "Name must be at least 2 characters" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters",
    });
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  next();
};

export const validateArticle = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  if (title.length < 3) {
    return res
      .status(400)
      .json({ message: "Title must be at least 3 characters" });
  }

  if (content.length < 10) {
    return res
      .status(400)
      .json({ message: "Content must be at least 10 characters" });
  }

  next();
};

export const validateComment = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Comment content is required" });
  }

  if (content.length < 2) {
    return res
      .status(400)
      .json({ message: "Comment must be at least 2 characters" });
  }

  next();
};
