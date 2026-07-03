import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const STANDARDS_DIR = path.join(process.cwd(), '..', '..', 'teaching')

export async function GET() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    if (!fs.existsSync(STANDARDS_DIR)) {
      return NextResponse.json({ files: [] })
    }
    const files = fs.readdirSync(STANDARDS_DIR)
      .filter(f => f.endsWith('.md'))
      .sort()
      .map(f => {
        const fullPath = path.join(STANDARDS_DIR, f)
        const stat = fs.statSync(fullPath)
        return {
          name: f,
          size: stat.size,
          updatedAt: stat.mtime.toISOString(),
          sizeKb: Math.round(stat.size / 1024),
        }
      })
    return NextResponse.json({ files })
  } catch (e) {
    return NextResponse.json({ files: [] })
  }
}
