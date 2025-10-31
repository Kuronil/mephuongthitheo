import { Facebook, Instagram, Youtube } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-600 rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="font-bold text-lg">Thịt Heo Mẹ Phương</span>
            </div>
            <p className="text-gray-400 text-sm">Cung cấp thịt tươi, chất lượng cao với giá cả hợp lý.</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4">Về chúng tôi</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Liên hệ
                </Link>
              </li>           
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold mb-4">Theo dõi chúng tôi</h4>
            <div className="flex gap-4">
              <a href="#" className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Thịt Heo Mẹ Phương. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
