import { NextResponse } from "next/server"

function getBaseUrl(req: Request) {
  const url = new URL(req.url)
  return url.origin
}

export async function GET(req: Request) {
  const baseUrl = getBaseUrl(req)

  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`

  if (!clientId) {
    return NextResponse.json({ error: "Thiếu cấu hình GOOGLE_CLIENT_ID" }, { status: 500 })
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent"
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  return NextResponse.redirect(authUrl)
}

