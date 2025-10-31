import Header from "@/components/header"
import HeroBanner from "@/components/hero-banner"
import Features from "@/components/features"
import ProductRecommendations from "@/components/product-recommendations"
import QuickSearch from "@/components/quick-search"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <HeroBanner />
      
      {/* Quick Search Section */}
      <div className="py-12 bg-linear-to-br from-orange-50 to-orange-100">
        <div className="max-w-4xl mx-auto px-4">
          <QuickSearch />
        </div>
      </div>
      
      <Features />
      
      {/* Featured Products */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ProductRecommendations
            type="featured"
            title="Sản phẩm nổi bật"
            limit={8}
          />
        </div>
      </div>
      
      {/* Flash Sale Products */}
      <div className="py-12 bg-red-50">
        <div className="max-w-7xl mx-auto px-4">
          <ProductRecommendations
            type="flash-sale"
            title="⚡ Flash Sale"
            limit={8}
          />
        </div>
      </div>
      
      {/* Product Recommendations */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <ProductRecommendations
            type="trending"
            title="Sản phẩm đang hot"
            limit={8}
          />
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
