import { NextResponse } from "next/server"
import crypto from "crypto"
import { exec } from "child_process"

// Ensure this route runs in the Node.js runtime (not Edge)
export const runtime = "nodejs"

export async function POST(request: Request) {
  const rawBody = await request.text()

  // Optional: verify GitHub webhook secret (highly recommended)
  const signature = request.headers.get("x-hub-signature-256") ?? request.headers.get("x-github-signature")
  const secret = process.env.GITHUB_WEBHOOK_SECRET

  if (secret && signature) {
    const hmac = crypto.createHmac("sha256", secret)
    const digest = "sha256=" + hmac.update(rawBody).digest("hex")

    if (signature !== digest) {
      console.warn("Invalid GitHub webhook signature")
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 })
    }
  }

  console.log("Webhook received, deploy triggered!")

  // Trigger your deployment script here (self-hosted server)
  // Adjust the path and commands to match your environment
  exec(
    "cd /home/aarushkute/portfolio && git pull && npm install --prod --no-frozen-lockfile && npm run build && pm2 restart portfolio",
  
    (err, stdout, stderr) => {
      if (err) {
        console.error("Deploy script error:", err)
        if (stderr) console.error(stderr)
      } else {
        console.log("Deploy script output:\n", stdout)
      }
    },
  )

  // Respond immediately; deploy runs in the background
  return NextResponse.json({ message: "Deploy triggered" })
}

export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 })
}
