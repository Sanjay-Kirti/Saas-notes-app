import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Helper function to get user from token
async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.substring(7)
  try {
    return verifyToken(token)
  } catch {
    return null
  }
}

// GET /api/notes - List tenant's notes
export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const notes = await prisma.note.findMany({
      where: {
        tenantId: user.tenantId
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/notes - Create note
export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Check tenant plan and note limit
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      include: {
        notes: true
      }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Enforce free plan limit
    if (tenant.plan === 'free' && tenant.notes.length >= 3) {
      return NextResponse.json(
        { error: 'Free plan limited to 3 notes. Please upgrade to Pro plan.' },
        { status: 403 }
      )
    }

    // Create note
    const note = await prisma.note.create({
      data: {
        title,
        content,
        tenantId: user.tenantId,
        userId: user.userId
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
