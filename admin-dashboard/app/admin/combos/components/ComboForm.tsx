"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Package, Gift, Minus, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { customFetch } from "@/utils/customFetch"
import { useRouter } from "next/navigation"
import { Product } from "@/app/types/product"
// API response structure for combo products
interface ApiComboProduct {
  _id: string
  quantity: number
  productId: Product
}

// Form state structure for combo products
interface FormComboProduct {
  _id: string
  quantity: number
  product?: Product
}

interface Combo {
  _id: string
  slug: string
  name: string
  description: string
  products: ApiComboProduct[]
  originalPrice: number
  comboPrice: number
  images: string[]
  tags: string[]
  isFeatured: boolean
  isActive: boolean
  status: "out_of_stock" | "in_stock"
}


interface ComboFormProps {
  combo?: Combo
  onCancel: () => void
}

const baseurl: string = process.env.NEXT_PUBLIC_BASE_URL as string;

export function ComboForm({ combo, onCancel }: ComboFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    comboPrice: "",
    isFeatured: false,
    status: "in_stock" as "in_stock" | "out_of_stock",
    tags: [] as string[],
  })

  const [comboProducts, setComboProducts] = useState<FormComboProduct[]>([])
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [newTag, setNewTag] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [replaceImages, setReplaceImages] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const apiBaseurl: string = process.env.NEXT_PUBLIC_API_URL as string;

  const { toast } = useToast()
  console.log({combo})

  // Fetch available products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await customFetch.get("/products?limit=100&status=in_stock")
        if (response.data.success) {
          setAvailableProducts(response.data.products)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }
    fetchProducts()
  }, [])

  // Populate form if editing
  useEffect(() => {
    if (combo) {
      setFormData({
        name: combo.name,
        description: combo.description,
        comboPrice: combo.comboPrice.toString(),
        isFeatured: combo.isFeatured,
        status: combo.status,
        tags: combo.tags,
      })
      
      // Convert API structure to form structure
      const populatedProducts: FormComboProduct[] = combo.products.map(cp => ({
        _id: cp.productId._id,
        quantity: cp.quantity,
        product: cp.productId
      }))
      setComboProducts(populatedProducts)
      
      console.log('Combo products structure:', combo.products)
      console.log('Populated products:', populatedProducts)
    }
  }, [combo])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Add product to combo
  const addProductToCombo = (productId: string) => {
    const product = availableProducts.find(p => p._id === productId)
    if (product && !comboProducts.some(cp => cp._id === productId)) {
      setComboProducts(prev => [...prev, {
        _id: productId,
        quantity: 1,
        product
      }])
    }
  }

  // Remove product from combo
  const removeProductFromCombo = (productId: string) => {
    setComboProducts(prev => prev.filter(cp => cp._id !== productId))
  }

  // Update product quantity in combo
  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    setComboProducts(prev => prev.map(cp => 
      cp._id === productId ? { ...cp, quantity } : cp
    ))
  }

  // Calculate original price
  const calculateOriginalPrice = () => {
    return comboProducts.reduce((total, cp) => {
      const product = cp.product || availableProducts.find(p => p._id === cp._id)
      return total + (product ? product.price * cp.quantity : 0)
    }, 0)
  }

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  // Remove tag
  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (comboProducts.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product to the combo",
        variant: "destructive"
      })
      setLoading(false)
      return
    }

    const originalPrice = calculateOriginalPrice()
    const comboPrice = parseFloat(formData.comboPrice)

    if (comboPrice >= originalPrice) {
      toast({
        title: "Error",
        description: "Combo price must be less than original price to provide savings",
        variant: "destructive"
      })
      setLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()

      // Add form fields
      formDataToSend.append("name", formData.name)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("comboPrice", formData.comboPrice)
      formDataToSend.append("isFeatured", formData.isFeatured.toString())
      formDataToSend.append("status", formData.status)
      
      // Add products array
      formDataToSend.append("products", JSON.stringify(
        comboProducts.map(cp => ({
          _id: cp._id,
          quantity: cp.quantity
        }))
      ))
      
      // Add tags
      formDataToSend.append("tags", JSON.stringify(formData.tags))

      // Only add replaceImages if we're editing and user selected to replace
      if (combo && replaceImages) {
        formDataToSend.append("replaceImages", "true")
      }

      // Add files
      selectedFiles.forEach((file) => {
        formDataToSend.append("images", file)
      })

      let data
      
      if (combo) {
        // EDIT MODE - Update existing combo
        data = await customFetch.put(`combos/${combo._id}`, formDataToSend)
      } else {
        // ADD MODE - Create new combo
        data = await customFetch.post("combos", formDataToSend)
      }

      if (data.data.success) {
        toast({
          title: "Success",
          description: combo 
            ? "Combo updated successfully" 
            : "Combo created successfully",
        })
        router.push("/admin/combos")
      } else {
        toast({
          title: "Error",
          description: data.data.message || "Failed to save combo",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving combo:", error)
      toast({
        title: "Error",
        description: "Failed to save combo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = availableProducts.filter(product => 
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.quantity.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const originalPrice = calculateOriginalPrice()
  const savings = originalPrice - parseFloat(formData.comboPrice || "0")
  const savingsPercentage = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Combo Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Sweet Delight Combo, Family Pack Mix"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will auto-generate a URL slug for SEO
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your combo bundle..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) => handleInputChange("isFeatured", checked)}
              />
              <Label htmlFor="featured">Featured Combo</Label>
              <p className="text-xs text-muted-foreground ml-2">
                Featured combos appear in special sections
              </p>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Savings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Original Price:</span>
                  <span className="font-medium">₹{originalPrice}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Combo Price:</span>
                  <span className="font-medium">₹{formData.comboPrice || 0}</span>
                </div>
                <hr />
                <div className="flex justify-between font-medium">
                  <span>Savings:</span>
                  <span className="text-green-600">₹{savings} ({savingsPercentage}%)</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="comboPrice">Combo Price *</Label>
              <Input
                id="comboPrice"
                type="number"
                min="0"
                placeholder="Enter discounted combo price"
                value={formData.comboPrice}
                onChange={(e) => handleInputChange("comboPrice", e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be less than original price (₹{originalPrice}) to provide savings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Combo Products
          </CardTitle>
          <CardDescription>Select products to include in this combo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Products */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products to add..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Available Products */}
            {searchTerm && (
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="text-sm font-medium mb-2">Available Products:</p>
                <div className="space-y-2">
                  {filteredProducts
                    .filter(product => !comboProducts.some(cp => cp._id === product._id))
                    .map(product => (
                    <div key={product._id} className="flex items-center justify-between p-2 border rounded hover:bg-muted">
                      <div className="flex items-center gap-2">
                        
                        <div>
                          <p className="font-medium text-sm">{product.title}</p>
                          <p className="text-xs text-muted-foreground">
                            ₹{product.price} • {product.quantity}
                            {product.numberOfPieces && ` • ${product.numberOfPieces} pcs`}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addProductToCombo(product._id)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Products */}
            <div>
              <p className="text-sm font-medium mb-2">Selected Products ({comboProducts.length}):</p>
              {comboProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground italic border rounded-lg p-4">
                  No products selected. Search and add products above.
                </p>
              ) : (
                <div className="space-y-2 border rounded-lg p-4">
                  {comboProducts.map((cp) => {
                    const product = cp.product || availableProducts.find(p => p._id === cp._id)
                    if (!product) return null
                    
                    return (
                      <div key={cp._id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                       
                          <div>
                            <p className="font-medium text-sm">{product.title}</p>
                            <p className="text-xs text-muted-foreground">
                              ₹{product.price} each • {product.quantity}
                              {product.numberOfPieces && ` • ${product.numberOfPieces} pcs`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateProductQuantity(cp._id, cp.quantity - 1)}
                              disabled={cp.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{cp.quantity}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateProductQuantity(cp._id, cp.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Badge variant="outline">₹{product.price * cp.quantity}</Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProductFromCombo(cp._id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags & Categories</CardTitle>
          <CardDescription>Add tags to help categorize and promote your combo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., gift, festival, premium, bestseller"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => removeTag(index)}
                  >
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}

            {formData.tags.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No tags added yet. Click the + button to add tags.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Combo Images</CardTitle>
          <CardDescription>
            {combo 
              ? "Upload new images or replace existing ones" 
              : "Upload combo images (max 10 files, recommended size: 800x800px)"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="images">Select Images</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
                required = {combo ? replaceImages : true}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: JPG, PNG, WebP. Max file size: 20 MB each
              </p>
            </div>

            {combo && combo.images.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="replaceImages" 
                    checked={replaceImages} 
                    onCheckedChange={setReplaceImages} 
                  />
                  <Label htmlFor="replaceImages">Replace existing images</Label>
                </div>

                <div className="text-sm text-muted-foreground">
                  Current images: {combo.images.length}
                  {!replaceImages && selectedFiles.length > 0 && 
                    ` → Will have ${combo.images.length + selectedFiles.length} images total`
                  }
                </div>

                {/* Show existing images preview */}
                <div>
                  <p className="text-sm font-medium mb-2">Existing images:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {combo.images.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={baseurl + imageUrl || "/placeholder.svg"}
                          alt={`Combo image ${index + 1}`}
                          width={100}
                          height={100}
                          className="rounded-md object-cover border"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">
                  {combo && replaceImages ? "New images (will replace existing):" : "New images:"}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={file ? URL.createObjectURL(file) : "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        width={100}
                        height={100}
                        className="rounded-md object-cover border"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Combo Summary */}
      {(formData.name || comboProducts.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Combo Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                {formData.name && <Badge variant="outline" className="flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  {formData.name}
                </Badge>}
                {comboProducts.length > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {comboProducts.length} products
                  </Badge>
                )}
                {formData.comboPrice && <Badge variant="outline">₹{formData.comboPrice}</Badge>}
                {originalPrice > 0 && savings > 0 && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Save ₹{savings} ({savingsPercentage}%)
                  </Badge>
                )}
                {formData.isFeatured && <Badge variant="default">Featured</Badge>}
                <Badge variant={formData.status === "in_stock" ? "default" : "destructive"}>
                  {formData.status === "in_stock" ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || comboProducts.length === 0}>
          {loading ? "Saving..." : combo ? "Update Combo" : "Create Combo"}
        </Button>
      </div>
    </form>
  )
}