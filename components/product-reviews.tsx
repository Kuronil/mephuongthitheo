"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsUp, MessageCircle, Image as ImageIcon, Edit, Trash2, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"

interface Review {
  id: number
  rating: number
  title?: string
  comment?: string
  images: string[]
  isVerified: boolean
  helpful: number
  createdAt: string
  user: {
    id: number
    name: string
    email: string
  }
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: Array<{
    rating: number
    count: number
  }>
}

interface ProductReviewsProps {
  productId: number
  currentUserId?: number
}

export default function ProductReviews({ productId, currentUserId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [ratingFilter, setRatingFilter] = useState('')

  // Review form state
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: [] as string[]
  })

  // Fetch reviews
  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...(ratingFilter && { rating: ratingFilter })
      })

      const response = await fetch(`/api/products/${productId}/reviews?${params}`)
      const data = await response.json()

      if (data.success) {
        setReviews(data.data.reviews)
        setStats(data.data.statistics)
        setTotalPages(data.data.pagination.totalPages)
        setCurrentPage(page)
      } else {
        toast.error("Lỗi khi tải đánh giá")
      }
    } catch (error) {
      console.error("Fetch reviews error:", error)
      toast.error("Lỗi khi tải đánh giá")
    } finally {
      setLoading(false)
    }
  }

  // Submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.rating) {
      toast.error("Vui lòng chọn số sao đánh giá")
      return
    }

    try {
      const url = editingReview 
        ? `/api/reviews/${editingReview.id}`
        : `/api/products/${productId}/reviews`
      
      const method = editingReview ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(editingReview ? "Đánh giá đã được cập nhật" : "Đánh giá đã được thêm")
        setShowReviewForm(false)
        setEditingReview(null)
        setFormData({ rating: 5, title: '', comment: '', images: [] })
        fetchReviews(1)
      } else {
        toast.error(data.error || "Lỗi khi gửi đánh giá")
      }
    } catch (error) {
      console.error("Submit review error:", error)
      toast.error("Lỗi khi gửi đánh giá")
    }
  }

  // Delete review
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      return
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Đánh giá đã được xóa")
        fetchReviews(currentPage)
      } else {
        toast.error(data.error || "Lỗi khi xóa đánh giá")
      }
    } catch (error) {
      console.error("Delete review error:", error)
      toast.error("Lỗi khi xóa đánh giá")
    }
  }

  // Mark helpful
  const handleMarkHelpful = async (reviewId: number) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Cảm ơn bạn!")
        fetchReviews(currentPage)
      } else {
        toast.error(data.error || "Lỗi khi đánh dấu hữu ích")
      }
    } catch (error) {
      console.error("Mark helpful error:", error)
      toast.error("Lỗi khi đánh dấu hữu ích")
    }
  }

  // Start editing
  const startEditing = (review: Review) => {
    setEditingReview(review)
    setFormData({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment || '',
      images: review.images
    })
    setShowReviewForm(true)
  }

  // Cancel editing
  const cancelEditing = () => {
    setShowReviewForm(false)
    setEditingReview(null)
    setFormData({ rating: 5, title: '', comment: '', images: [] })
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Render stars
  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onChange?.(star) : undefined}
            className={interactive ? "hover:scale-110 transition" : ""}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating 
                  ? "text-yellow-400 fill-current" 
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  // Initial load
  useEffect(() => {
    fetchReviews()
  }, [productId, sortBy, sortOrder, ratingFilter])

  return (
    <div className="space-y-6">
      {/* Review Statistics */}
      {stats && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Đánh giá sản phẩm</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(stats.averageRating))}
              <p className="text-gray-600 mt-2">
                Dựa trên {stats.totalReviews} đánh giá
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {stats.ratingDistribution.reverse().map((dist) => (
                <div key={dist.rating} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-8">{dist.rating} sao</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${stats.totalReviews > 0 ? (dist.count / stats.totalReviews) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{dist.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {editingReview ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}
          </h3>
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá của bạn
              </label>
              {renderStars(formData.rating, true, (rating) => 
                setFormData(prev => ({ ...prev, rating }))
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề (tùy chọn)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Tóm tắt đánh giá của bạn"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhận xét
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                {editingReview ? "Cập nhật" : "Gửi đánh giá"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            {showReviewForm ? "Ẩn form" : "Viết đánh giá"}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Tất cả đánh giá</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="createdAt-desc">Mới nhất</option>
            <option value="createdAt-asc">Cũ nhất</option>
            <option value="rating-desc">Đánh giá cao nhất</option>
            <option value="rating-asc">Đánh giá thấp nhất</option>
            <option value="helpful-desc">Hữu ích nhất</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Đang tải đánh giá...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Chưa có đánh giá</h3>
            <p className="text-gray-500">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">
                      {review.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                      {review.isVerified && (
                        <div title="Đã mua hàng">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                  </div>
                </div>

                {currentUserId === review.user.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(review)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                {renderStars(review.rating)}
              </div>

              {review.title && (
                <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
              )}

              {review.comment && (
                <p className="text-gray-700 mb-4">{review.comment}</p>
              )}

              {review.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleMarkHelpful(review.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition"
                  disabled={currentUserId === review.user.id}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Hữu ích ({review.helpful})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchReviews(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="px-3 py-2 text-sm">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => fetchReviews(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
