import { NextRequest, NextResponse } from 'next/server'
import { checkModuleAccess } from '@/lib/module-gate'

// Simulate job ID generation
function generateJobId(module: string): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${module.slice(0, 3).toUpperCase()}-${ts}-${rand}`
}

// Simulate processing time estimation
function estimateDuration(module: string, params: Record<string, unknown>): number {
  const base: Record<string, number> = {
    'education-standard': 45,
    'curriculum': 30,
    'lesson': 25,
    'homework': 20,
    'qa': 15,
    'publishing': 10,
  }
  return (base[module] ?? 20) + Math.floor(Math.random() * 10)
}

export async function POST(req: NextRequest) {
  try {
    const gate = await checkModuleAccess(req, 'ai')
    if ('error' in gate) return NextResponse.json({ error: gate.error }, { status: gate.status })

    const body = await req.json()
    const { module, params } = body as { module: string; params: Record<string, unknown> }

    if (!module) {
      return NextResponse.json({ error: 'Missing module' }, { status: 400 })
    }

    // Validate module exists
    const validModules = ['education-standard', 'curriculum', 'lesson', 'homework', 'qa', 'publishing']
    if (!validModules.includes(module)) {
      return NextResponse.json({ error: `Unknown module: ${module}` }, { status: 400 })
    }

    // Simulate queuing the job
    const jobId = generateJobId(module)
    const estimatedSeconds = estimateDuration(module, params)

    // In production, this would:
    // 1. Save job to DB with status 'queued'
    // 2. Push to message queue (Redis/BullMQ/etc.)
    // 3. Worker picks it up, calls AI (OpenAI, Anthropic, etc.)
    // 4. Worker saves result and updates job status
    // 5. Client polls /api/admin/ai-generator/status/[jobId] or uses WebSocket

    return NextResponse.json({
      success: true,
      jobId,
      status: 'queued',
      module,
      params,
      estimatedSeconds,
      message: `Job ${jobId} queued successfully. Estimated: ~${estimatedSeconds}s`,
      // Simulated result preview (would be empty in real queue-based system)
      simulatedResult: {
        type: module,
        title: `Generated ${module.replace('-', ' ')} — ${new Date().toLocaleString('vi-VN')}`,
        wordCount: Math.floor(Math.random() * 800) + 200,
        quality: Math.floor(Math.random() * 15) + 85,
        items: Math.floor(Math.random() * 10) + 1,
      },
    })
  } catch (err) {
    console.error('[AI Generator] Generate error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: String(err) },
      { status: 500 }
    )
  }
}

// GET: Check job status (stub — for future polling)
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId')
  if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 })

  // Stub: In production, lookup DB by jobId
  return NextResponse.json({
    jobId,
    status: 'completed',
    progress: 100,
    result: null, // Would contain actual generated content
    message: 'Job status check — connect DB to get real status',
  })
}
