import { db } from '@/lib/db';
import { User } from '@prisma/client';

export interface CreateUserData {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

export async function createUserWithDefaults(userData: CreateUserData) {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { clerkId: userData.clerkId },
      include: {
        userPreferences: true,
        subscription: true
      }
    });

    if (existingUser) {
      return existingUser;
    }

    // Create user with default settings
    const newUser = await db.user.create({
      data: {
        clerkId: userData.clerkId,
        email: userData.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        imageUrl: userData.imageUrl || '',
        // credits will use default value from schema (0)
        // Create default user preferences
        userPreferences: {
          create: {
            emailNotifications: true,
            defaultAiVendor: "gemini",
          }
        }
      },
      include: {
        userPreferences: true,
        subscription: true
      }
    });

    console.log(`User created successfully: ${userData.email}`);
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function ensureUserExists(clerkId: string, userData: Partial<CreateUserData>) {
  try {
    let user = await db.user.findUnique({
      where: { clerkId },
      include: {
        userPreferences: true,
        subscription: true
      }
    });

    if (!user && userData.email) {
      user = await createUserWithDefaults({
        clerkId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        imageUrl: userData.imageUrl
      });
    }

    return user;
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    return null;
  }
}

export async function getUserWithDetails(clerkId: string) {
  try {
    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        userPreferences: true,
        subscription: true
      }
    });

    return user;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}