import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const user = await getUserFromRequest(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden: Only admins can upgrade the tenant plan' },
      { status: 403 }
    )
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: params.slug }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    if (tenant.id !== user.tenantId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot upgrade other tenants' },
        { status: 403 }
      )
    }

    if (tenant.plan === 'pro') {
      return NextResponse.json(
        { message: 'Tenant is already on Pro plan' },
        { status: 200 }
      )
    }
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { plan: 'pro' }
    })

    return NextResponse.json({
      message: 'Tenant successfully upgraded to Pro plan',
      tenant: {
        slug: updatedTenant.slug,
        name: updatedTenant.name,
        plan: updatedTenant.plan
      }
    })
  } catch (error) {
    console.error('Error upgrading tenant:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
