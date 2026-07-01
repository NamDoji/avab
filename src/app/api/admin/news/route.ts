import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 }
  return { session }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    + '-' + Date.now()
}

export async function GET() {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: news })
  } catch (error) {
    console.error('Admin get news error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải tin tức' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const body = await request.json()
    const { title, summary, content, thumbnail, isPublished } = body

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Tiêu đề và nội dung là bắt buộc' },
        { status: 400 }
      )
    }

    const slug = generateSlug(title)
    const published = Boolean(isPublished)

    const article = await prisma.news.create({
      data: {
        title,
        slug,
        summary: summary || null,
        content,
        thumbnail: thumbnail || null,
        isPublished: published,
        publishedAt: published ? new Date() : null,
      },
    })

    return NextResponse.json({ success: true, data: article }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Slug đã tồn tại, thử tiêu đề khác' },
        { status: 409 }
      )
    }
    console.error('Admin create news error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tạo bài viết' },
      { status: 500 }
    )
  }
}
