import prisma from "../utils/prisma.util";
import { Role, User } from "@prisma/client";
import bcrypt from "bcrypt";

interface UserData {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  isVerified?: boolean;
}

// Get all users (for admin)
export async function getAllUsers(): Promise<User[]> {
  return (await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          articles: true,
          comments: true,
        },
      },
    },
  })) as unknown as User[];
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  return (await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          articles: true,
          comments: true,
        },
      },
    },
  })) as unknown as User | null;
}

// Update user
export async function updateUser(id: string, data: UserData): Promise<User> {
  const { name, email, password, role } = data;

  // If password is provided, hash it
  let updateData: any = {
    ...(name && { name }),
    ...(email && { email }),
    ...(role && { role }),
  };

  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  return await prisma.user.update({
    where: { id },
    data: updateData,
  });
}

// Delete user
export async function deleteUser(id: string): Promise<User> {
  return await prisma.user.delete({
    where: { id },
  });
}
