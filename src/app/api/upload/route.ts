import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadFile } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const bucket = (formData.get('bucket') as string) || 'avab-materials'
    const folder = (formData.get('folder') as string) || 'general'

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${folder}/${timestamp}_${safeName}`

    const publicUrl = await uploadFile(bucket, path, buffer, file.type)

    return NextResponse.json({
      success: true,
      data: { url: publicUrl, name: file.name, size: file.size },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })
  }
}
