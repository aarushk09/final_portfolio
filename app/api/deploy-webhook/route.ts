import { NextResponse } from "next/server"

export async function POST(request: Request) {
  // Optional: verify GitHub webhook secret
  const signature = request.headers.get("x-hub-signature-256") ?? request.headers.get("x-github-signature")
  const secret = process.env.GITHUB_WEBHOOK_SECRET
  if (secret && signature) {
    // Verify HMAC-SHA256: compare crypto.createHmac("sha256", secret).update(body).digest("hex") with signature
    const encoder = new TextEncoder()
    const body = await request.text()
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )
    const sig = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(body)
    )
    const expected = "sha256=" + Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    if (signature !== expected) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 })
    }
  }

  console.log("Webhook received, deploy triggered!")
  // Trigger your deployment script here if running on a VPS:
  // const { exec } = require("child_process");
  // exec("cd /path/to/portfolio && git pull && pnpm install && pnpm run build && pm2 restart portfolio");

  return NextResponse.json({ message: "Deploy triggered" })
}

export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 })
}
