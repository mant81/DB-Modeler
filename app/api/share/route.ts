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

    // 현재 저장된 다이어그램 수 확인
    const keys = await redis.keys("diagram:*")

    if (keys.length >= MAX_DIAGRAMS) {
      return NextResponse.json({ error: "최대 저장 용량을 초과했습니다. 잠시 후 다시 시도해주세요." }, { status: 507 })
    }

    // 고유 ID 생성 (8자리 랜덤)
    const id = Math.random().toString(36).substring(2, 10)

    // Redis에 저장 (7일 TTL)
    const ttlSeconds = TTL_DAYS * 24 * 60 * 60
    await redis.setex(`diagram:${id}`, ttlSeconds, JSON.stringify(data))

    return NextResponse.json({ id })
  } catch (error) {
    console.error("Share error:", error)
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
