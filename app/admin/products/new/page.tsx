"use client"

import { useState, useRef } from "react"
import { ArrowLeft, Save, Upload, X, Plus, Image as ImageIcon } from "lucide-react"
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
  const [uploadingMainImage, setUploadingMainImage] = useState(false)
  const [uploadingAdditionalImages, setUploadingAdditionalImages] = useState(false)
  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const additionalImagesInputRef = useRef<HTMLInputElement>(null)
  const [nutritionFields, setNutritionFields] = useState([
    { key: "calories", label: "Calories", value: "" },
    { key: "protein", label: "Protein (g)", value: "" },
    { key: "fat", label: "Fat (g)", value: "" },
    { key: "carbs", label: "Carbs (g)", value: "" },
    { key: "fiber", label: "Fiber (g)", value: "" }
  ])

  // Tự động tạo slug từ tên
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

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Kiểm tra định dạng tệp
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh')
      return
    }

    // Kiểm tra kích thước tệp (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB')
      return
    }

    setUploadingMainImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }))
        toast.success('Tải ảnh chính thành công!')
      } else {
        toast.error(data.error || 'Lỗi khi tải ảnh lên')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Lỗi khi tải ảnh lên')
    } finally {
      setUploadingMainImage(false)
      if (mainImageInputRef.current) {
        mainImageInputRef.current.value = ''
      }
    }
  }

  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingAdditionalImages(true)
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Kiểm tra định dạng tệp
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} không phải là file hình ảnh`)
          return null
        }

        // Kiểm tra kích thước tệp (tối đa 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} vượt quá 5MB`)
          return null
        }

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()
        return data.success ? data.url : null
      })

      const urls = await Promise.all(uploadPromises)
      const validUrls = urls.filter((url): url is string => url !== null)

      if (validUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...validUrls]
        }))
        toast.success(`Đã tải ${validUrls.length} ảnh phụ thành công!`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Lỗi khi tải ảnh lên')
    } finally {
      setUploadingAdditionalImages(false)
      if (additionalImagesInputRef.current) {
        additionalImagesInputRef.current.value = ''
      }
    }
  }

  const removeAdditionalImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    setLoading(true)

    try {
      // Chuẩn bị dữ liệu dinh dưỡng
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
        {/* Tiêu đề */}
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

        {/* Biểu mẫu */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin cơ bản</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tên sản phẩm */}
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

              {/* Mô tả */}
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

              {/* Tải ảnh chính */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh chính sản phẩm
                </label>
                <div className="space-y-4">
                  {formData.image ? (
                    <div className="relative group">
                      <img 
                        src={formData.image} 
                        alt="Main product" 
                        className="w-48 h-48 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Chưa có ảnh chính</p>
                      <button
                        type="button"
                        onClick={() => mainImageInputRef.current?.click()}
                        disabled={uploadingMainImage}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 mx-auto"
                      >
                        {uploadingMainImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Đang tải...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Tải ảnh lên
                          </>
                        )}
                      </button>
                      <input
                        ref={mainImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tải ảnh phụ */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh phụ
                </label>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => additionalImagesInputRef.current?.click()}
                      disabled={uploadingAdditionalImages}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {uploadingAdditionalImages ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                          Đang tải...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Thêm ảnh phụ
                        </>
                      )}
                    </button>
                    <input
                      ref={additionalImagesInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImagesUpload}
                      className="hidden"
                    />
                    <span className="text-sm text-gray-500">Có thể chọn nhiều ảnh cùng lúc</span>
                  </div>
                  {formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={image} 
                            alt={`Additional ${index + 1}`} 
                            className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Giá bán */}
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

              {/* Giá gốc */}
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

              {/* Danh mục */}
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

              {/* Danh mục con */}
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

              {/* Thương hiệu */}
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

              {/* Trọng lượng */}
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

          {/* Tồn kho */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quản lý tồn kho</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Số lượng tồn */}
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

              {/* Mức tồn tối thiểu */}
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

              {/* Bảo quản */}
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

              {/* Hạn sử dụng */}
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

          {/* Thẻ (tags) */}
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

          {/* Dinh dưỡng */}
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

          {/* Cài đặt */}
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

          {/* Gửi */}
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
