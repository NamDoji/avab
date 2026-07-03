import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const STANDARDS_DIR = path.join(process.cwd(), '..', '..', 'teaching')

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { filename } = await params
  // Security: only allow .md files, no path traversal
  if (!filename.endsWith('.md') || filename.includes('..') || filename.includes('/')) {
    return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
  }

  const filePath = path.join(STANDARDS_DIR, filename)
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  return NextResponse.json({ content, filename })
}
