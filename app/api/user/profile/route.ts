import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

// GET - Get user profile (create if not exists)
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to find existing user
    let user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: true,
      },
    })

    // If user doesn't exist, create from Clerk data
    if (!user) {
      const clerkUser = await currentUser()
      
      if (!clerkUser) {
        return NextResponse.json({ error: 'Unable to fetch user data' }, { status: 400 })
      }

      user = await db.user.create({
        data: {
          clerkId: userId,
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || null,
          imageUrl: clerkUser.imageUrl || null,
        },
        include: {
          subscription: true,
        },
      })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update user profile (create if not exists)
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { firstName, lastName, email, username, imageUrl } = body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }

    // Use upsert to create or update user
    const updatedUser = await db.user.upsert({
      where: { clerkId: userId },
      update: {
        firstName,
        lastName,
        email,
        username: username || null,
        imageUrl: imageUrl || null,
        updatedAt: new Date(),
      },
      create: {
        clerkId: userId,
        firstName,
        lastName,
        email,
        username: username || null,
        imageUrl: imageUrl || null,
      },
      include: {
        subscription: true,
      },
    })

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete user account
export async function DELETE() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.user.delete({
      where: { clerkId: userId },
    })

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting user account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}