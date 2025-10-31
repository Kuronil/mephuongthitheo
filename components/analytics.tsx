"use client"

import dynamic from 'next/dynamic'

// Dynamically import Analytics to avoid SSR issues
const Analytics = dynamic(
  () => import('@vercel/analytics/next').then((mod) => mod.Analytics),
  { ssr: false }
)

export default function AnalyticsComponent() {
  return <Analytics />
}

