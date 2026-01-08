import { Redis } from "@upstash/redis"
import { type NextRequest, NextResponse } from "next/server"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    console.log("[v0] API: Loading shared diagram with ID:", id)
    console.log("[v0] API: Redis key:", `diagram:${id}`)

    const data = await redis.get(`diagram:${id}`)

    console.log("[v0] API: Redis returned:", data ? "Data found" : "No data")
    console.log("[v0] API: Data type:", typeof data)

    if (!data) {
      console.log("[v0] API: Diagram not found in Redis")
      return NextResponse.json(
        { error: "다이어그램을 찾을 수 없습니다. 링크가 만료되었거나 잘못되었습니다." },
        { status: 404 },
      )
    }

    console.log("[v0] API: Successfully returning data")
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] API: Load error:", error)
    return NextResponse.json({ error: "다이어그램을 불러오는데 실패했습니다." }, { status: 500 })
  }
}
