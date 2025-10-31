"use client"

import { useState } from "react"
import { ArrowLeft, Save, Upload, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

interface ProductFormData {
  name: string
  slug: string
  description: string
  price: number
  originalPrice: number
  discount: number
  image: string
  images: string[]
  category: string
  subcategory: string
  brand: string
  weight: number
  unit: string
  stock: number
  minStock: number
  isActive: boolean
  isFeatured: boolean
  isFlashSale: boolean
  tags: string[]
  nutrition: any
  storage: string
  expiry: number
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    price: 0,
    originalPrice: 0,
    discount: 0,
    image: "",
    images: [],
    category: "",
    subcategory: "",
    brand: "",
    weight: 0,
    unit: "kg",
    stock: 0,
    minStock: 5,
    isActive: true,
    isFeatured: false,
    isFlashSale: false,
    tags: [],
    nutrition: {},
    storage: "",
    expiry: 0
  })

  const [newTag, setNewTag] = useState("")
  const [nutritionFields, setNutritionFields] = useState([
    { key: "calories", label: "Calories", value: "" },
    { key: "protein", label: "Protein (g)", value: "" },
    { key: "fat", label: "Fat (g)", value: "" },
    { key: "carbs", label: "Carbs (g)", value: "" },
    { key: "fiber", label: "Fiber (g)", value: "" }
  ])

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }))
  }

  const handlePriceChange = (price: number) => {
    const originalPrice = formData.originalPrice || price
    const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0
    
    setFormData(prev => ({
      ...prev,
      price,
      discount
    }))
  }

  const handleOriginalPriceChange = (originalPrice: number) => {
    const price = formData.price || originalPrice
    const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0
    
    setFormData(prev => ({
      ...prev,
      originalPrice,
      discount
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const updateNutritionField = (index: number, value: string) => {
    const updatedFields = [...nutritionFields]
    updatedFields[index].value = value
    setNutritionFields(updatedFields)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    setLoading(true)

    try {
      // Prepare nutrition data
      const nutritionData = nutritionFields.reduce((acc, field) => {
        if (field.value) {
          acc[field.key] = parseFloat(field.value) || field.value
        }
        return acc
      }, {} as any)

      const submitData = {
        ...formData,
        nutrition: Object.keys(nutritionData).length > 0 ? nutritionData : null
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Sản phẩm đã được tạo thành công!")
        router.push('/admin/products')
      } else {
        toast.error(data.error || "Lỗi khi tạo sản phẩm")
      }
    } catch (error) {
      console.error("Create product error:", error)
      toast.error("Lỗi khi tạo sản phẩm")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/products"
              className="p-2 text-gray-400 hover:text-gray-600 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
              <p className="text-gray-600 mt-2">Tạo sản phẩm mới cho cửa hàng</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin cơ bản</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên sản phẩm"
                  required
                />
              </div>

              {/* Slug */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="product-slug"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả sản phẩm
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả chi tiết về sản phẩm"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá bán *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  required
                />
              </div>

              {/* Original Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá gốc
                </label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => handleOriginalPriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn danh mục</option>
                  <option value="thit-heo">Thịt heo</option>
                  <option value="thit-bo">Thịt bò</option>
                  <option value="thit-ga">Thịt gà</option>
                  <option value="combo">Combo</option>
                  <option value="san-pham-che-bien">Sản phẩm chế biến</option>
                </select>
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục con
                </label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Danh mục con"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thương hiệu
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Thương hiệu"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trọng lượng
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="piece">Cái</option>
                    <option value="pack">Gói</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quản lý tồn kho</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng tồn kho
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              {/* Min Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tồn kho tối thiểu
                </label>
                <input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>

              {/* Storage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hướng dẫn bảo quản
                </label>
                <input
                  type="text"
                  value={formData.storage}
                  onChange={(e) => setFormData(prev => ({ ...prev, storage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bảo quản trong tủ lạnh"
                />
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hạn sử dụng (ngày)
                </label>
                <input
                  type="number"
                  value={formData.expiry}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiry: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="7"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tags</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tag và nhấn Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Thêm
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Nutrition */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin dinh dưỡng</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nutritionFields.map((field, index) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => updateNutritionField(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Cài đặt</h2>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">Sản phẩm hoạt động</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">Sản phẩm nổi bật</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFlashSale}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFlashSale: e.target.checked }))}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">Flash Sale</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/products"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Tạo sản phẩm
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
