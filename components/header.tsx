"use client"

import { Search, User, ShoppingCart } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useUser } from '@/contexts/UserContext'
import { getCartCount } from "@/lib/cart"
import NotificationBell from "./notification-bell"
import SearchSuggestions from "./search-suggestions"

export default function Header() {
  const { user, setUser } = useUser()
  const [cartCount, setCartCount] = useState<number>(0)
  
  useEffect(() => {
    const update = () => setCartCount(getCartCount())
    update()
    window.addEventListener("storage", update)
    return () => window.removeEventListener("storage", update)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <>
      <div className="bg-orange-600 text-white py-2 px-4 text-center text-sm">
        <p>🎉 Chào mừng đến với Thịt Heo Mẹ Phương - Thịt tươi, chất lượng cao!</p>
      </div>

      <header className="bg-orange-600 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center overflow-hidden">
                <Image 
                  src="/mephuong.png" 
                  alt="Mẹ Phương Logo" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold">Thịt Heo Mẹ Phương</span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 mx-8">
              <SearchSuggestions className="w-full" />
            </div>

            {/* Icons */}
            <div className="flex items-center gap-4">
              {user && <NotificationBell />}
              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/account/profile" className="text-sm font-medium hover:underline">
                    {user.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-xs hover:text-yellow-300 transition"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/account/login"
                    className="text-sm font-medium hover:text-yellow-300 transition"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/account/register"
                    className="text-sm font-medium hover:text-yellow-300 transition"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
              <Link href="/cart" className="relative hover:opacity-80 transition">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-orange-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-6 text-sm font-semibold overflow-x-auto pb-2">
            <Link href="/about" className="hover:text-yellow-300 transition whitespace-nowrap">
              GIỚI THIỆU
            </Link>
            <Link href="/products" className="hover:text-yellow-300 transition whitespace-nowrap">
              THỊT HEO
            </Link>
            <Link href="/processed-products" className="hover:text-yellow-300 transition whitespace-nowrap">
              SẢN PHẨM THỊT CHẾ BIẾN
            </Link>
            <Link href="/contact" className="hover:text-yellow-300 transition whitespace-nowrap">
              LIÊN HỆ
            </Link>
          </nav>
        </div>
      </header>
    </>
  )
}
