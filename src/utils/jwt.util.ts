import jwt from "jsonwebtoken";
import { User } from "@prisma/client";

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export function generateToken(
  user: Pick<User, "id" | "email" | "role">
): string {
  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
}
