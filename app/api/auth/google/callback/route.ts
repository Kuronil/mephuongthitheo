import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

function getBaseUrl(req: Request) {
  const url = new URL(req.url)
  return url.origin
}

async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const params = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  })

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  })

  if (!resp.ok) {
    throw new Error(`Google token exchange failed: ${resp.status}`)
  }
  return resp.json()
}

async function fetchGoogleUserInfo(accessToken: string) {
  const resp = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!resp.ok) {
    throw new Error(`Google userinfo failed: ${resp.status}`)
  }
  return resp.json()
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    const baseUrl = getBaseUrl(req)
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`

    if (!code) {
      return NextResponse.json({ error: "Thiếu mã xác thực (code)" }, { status: 400 })
    }

    const tokens = await exchangeCodeForTokens(code, redirectUri)
    const userInfo = await fetchGoogleUserInfo(tokens.access_token)

    const email = userInfo.email as string | undefined
    const name = (userInfo.name as string | undefined) || (userInfo.given_name as string | undefined) || "Người dùng Google"

    if (!email) {
      return NextResponse.json({ error: "Không lấy được email từ Google" }, { status: 400 })
    }

    // Upsert user
    const dummyPasswordHash = await bcrypt.hash(`google_${userInfo.id}_${Date.now()}`, 10)
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: name,
        emailVerified: true,
      },
      create: {
        name: name,
        email: email,
        password: dummyPasswordHash,
        emailVerified: true,
      },
    })

    const { password: _pw, ...userWithoutPassword } = user as any

    // Return a small HTML that stores user in localStorage and redirects
    const html = `<!doctype html><html><head><meta charset="utf-8"/></head><body>
      <script>
        try {
          localStorage.setItem('user', ${JSON.stringify(JSON.stringify(userWithoutPassword))});
        } catch (e) {}
        window.location = '/';
      </script>
    </body></html>`

    return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } })
  } catch (err: any) {
    console.error("Google OAuth callback error:", err)
    return NextResponse.json({ error: "Đăng nhập Google thất bại" }, { status: 500 })
  }
}


