import { Redis } from "@upstash/redis"
import { type NextRequest, NextResponse } from "next/server"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const MAX_DIAGRAMS = 1000 // 최대 저장 가능한 다이어그램 수
const TTL_DAYS = 7 // 7일 후 자동 삭제

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    console.log("[v0] API: Saving diagram with data:", {
      tables: data.tables?.length || 0,
      relationships: data.relationships?.length || 0,
    })

    const keys = await redis.keys("diagram:*")
    console.log("[v0] API: Current diagram count:", keys.length)

    if (keys.length >= MAX_DIAGRAMS) {
      return NextResponse.json({ error: "최대 저장 용량을 초과했습니다. 잠시 후 다시 시도해주세요." }, { status: 507 })
    }

    const id = Math.random().toString(36).substring(2, 10)
    console.log("[v0] API: Generated ID:", id)

    const ttlSeconds = TTL_DAYS * 24 * 60 * 60
    await redis.setex(`diagram:${id}`, ttlSeconds, data)

    console.log("[v0] API: Saved to Redis with key:", `diagram:${id}`)

    return NextResponse.json({ id })
  } catch (error) {
    console.error("[v0] API: Share error:", error)
    return NextResponse.json({ error: "공유 링크 생성에 실패했습니다." }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const keys = await redis.keys("diagram:*")
    return NextResponse.json({ count: keys.length, max: MAX_DIAGRAMS })
  } catch (error) {
    console.error("Count error:", error)
    return NextResponse.json({ count: 0, max: MAX_DIAGRAMS })
  }
}
