import bcrypt from "bcrypt";
import crypto from "crypto";
import { Role, User } from "@prisma/client";
import prisma from "../utils/prisma.util";
import { generateToken } from "../utils/jwt.util";

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

interface LoginResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export async function registerUser(userData: RegisterUserData): Promise<User> {
  const { name, email, password } = userData;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: Role.READER,
      verificationToken,
    },
  });

  return user;
}

export async function verifyUserEmail(token: string): Promise<User> {
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) {
    throw new Error("Invalid verification token");
  }

  return await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verificationToken: null },
  });
}

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.isVerified) {
    throw new Error("Please verify your email before logging in");
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function requestPasswordReset(email: string): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

  return await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<User> {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  return await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
}
