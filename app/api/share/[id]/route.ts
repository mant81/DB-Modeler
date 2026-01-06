import { Redis } from "@upstash/redis"
import { type NextRequest, NextResponse } from "next/server"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await redis.get(`diagram:${id}`)

    if (!data) {
      return NextResponse.json(
        { error: "다이어그램을 찾을 수 없습니다. 링크가 만료되었거나 잘못되었습니다." },
        { status: 404 },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Load error:", error)
    return NextResponse.json({ error: "다이어그램을 불러오는데 실패했습니다." }, { status: 500 })
  }
}
