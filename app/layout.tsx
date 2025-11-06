import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/client-providers'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'),
  title: {
    default: 'Thịt heo Mẹ Phương | Tươi ngon mỗi ngày',
    template: '%s | Thịt heo Mẹ Phương',
  },
  description: 'Cửa hàng thịt heo tươi sạch Mẹ Phương – Sản phẩm chất lượng, giá tốt, giao nhanh tại TP.HCM.',
  keywords: ['thịt heo', 'thịt tươi sạch', 'mẹ phương', 'thực phẩm', 'thịt heo tươi'],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Thịt heo Mẹ Phương | Tươi ngon mỗi ngày',
    description: 'Cửa hàng thịt heo tươi sạch Mẹ Phương – Sản phẩm chất lượng, giá tốt, giao nhanh tại TP.HCM.',
    siteName: 'Thịt heo Mẹ Phương',
    images: [
      { url: '/mephuong.png', width: 1200, height: 630, alt: 'Thịt heo Mẹ Phương' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#f97316',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`font-sans antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}

