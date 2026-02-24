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
import { X, Plus, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { customFetch } from "@/utils/customFetch"
import { useRouter } from "next/navigation"
import { Product } from "@/app/types/product"

interface ProductFormProps {
  product?: Product
  onCancel: () => void
}

const baseurl: string = process.env.NEXT_PUBLIC_BASE_URL as string;
console.log({baseurl})

export function ProductForm({ product, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    numberOfPieces: "" ,
    price: "",
    discountPrice: "",
    quantity: "",
    isFeatured: false,
    status: "in_stock" as "in_stock" | "out_of_stock",
    ingredients: ["Walnut", "Honey", "Dates"] as string[],
  })

  const [newIngredient, setNewIngredient] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [replaceImages, setReplaceImages] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const { toast } = useToast()

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description,
        numberOfPieces: product.numberOfPieces != null ? product.numberOfPieces.toString() : "", // Fixed this line
        price: product.price.toString() || "",
        discountPrice: product.discountPrice?.toString() || "",
        quantity: product.quantity,
        isFeatured: product.isFeatured,
        status: product.status,
        ingredients: product.ingredients,
      })
    }
  }, [product])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient.trim()],
      }))
      setNewIngredient("")
    }
  }

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
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

    try {
      const formDataToSend = new FormData()

      // Add form fields
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      
      // Handle numberOfPieces - only append if it has a value
      if (formData.numberOfPieces.trim()) {
        formDataToSend.append("numberOfPieces", formData.numberOfPieces)
      }
      
      formDataToSend.append("price", formData.price)
      if (formData.discountPrice) {
        formDataToSend.append("discountPrice", formData.discountPrice)
      }
      formDataToSend.append("quantity", formData.quantity)
      formDataToSend.append("isFeatured", formData.isFeatured.toString())
      formDataToSend.append("ingredients", JSON.stringify(formData.ingredients))
      formDataToSend.append("status", formData.status)

      // Only add replaceImages if we're editing and user selected to replace
      if (product && replaceImages) {
        formDataToSend.append("replaceImages", "true")
      }

      // Add files
      selectedFiles.forEach((file) => {
        formDataToSend.append("images", file)
      })

      let data
      
      if (product) {
        // EDIT MODE - Update existing product
        data = await customFetch.put(`products/${product._id}`, formDataToSend)
      } else {
        // ADD MODE - Create new product
        data = await customFetch.post("products", formDataToSend)
      }

      if (data.data.success) {
        toast({
          title: "Success",
          description: product 
            ? "Product updated successfully" 
            : "Product created successfully",
        })
        router.push("/admin/products")
      } else {
        toast({
          title: "Error",
          description: data.data.error.message || "Failed to save product",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Moonlight Walnut Treat, Family Pack, Bulk Pack"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
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
                placeholder="Describe your walnut fudge product..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="numberOfPieces">Number of Pieces (Optional)</Label>
              <div className="relative">
                <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="numberOfPieces"
                  type="number"
                  placeholder="e.g., 6, 12, 24"
                  value={formData.numberOfPieces}
                  onChange={(e) => handleInputChange("numberOfPieces", e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                How many individual pieces are in this product ,enter 0  if not applicable
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                placeholder="e.g., 100 , 200, 1000 "
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="discountPrice">Discount Price</Label>
              <Input
                id="discountPrice"
                type="number"
                min="0"
                placeholder="100 , 200, 1000 (optional) less than price"
                value={formData.discountPrice}
                onChange={(e) => handleInputChange("discountPrice", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty if no discount
              </p>
            </div>

            <div>
              <Label htmlFor="quantity">Weight/Size *</Label>
              <Input type="text" placeholder="e.g. ,100g , 200g , 500g , 1kg" value={formData.quantity} onChange={(e) => handleInputChange("quantity", e.target.value)} />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) => handleInputChange("isFeatured", checked)}
              />
              <Label htmlFor="featured">Featured Product</Label>
              <p className="text-xs text-muted-foreground ml-2">
                Featured products appear in special sections
              </p>
            </div>

            <div>
              <Label htmlFor="status">Stock Status *</Label>
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
      </div>

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredients & Features</CardTitle>
          <CardDescription>Add key ingredients or special features of your walnut fudge</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Premium Walnuts, Organic Sugar, Pure Vanilla"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
              />
              <Button type="button" onClick={addIngredient}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {formData.ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.ingredients.map((ingredient, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    onClick={() => removeIngredient(index)}
                  >
                    {ingredient}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            )}

            {formData.ingredients.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No ingredients added yet. Click the + button to add ingredients.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
          <CardDescription>
            {product 
              ? "Upload new images or replace existing ones" 
              : "Upload product images (max 10 files, recommended size: 800x800px)"
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
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: JPG, PNG, WebP. Max file size: 20 MB each
              </p>
            </div>

            {product && product.images.length > 0 && (
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
                  Current images: {product.images.length}
                  {!replaceImages && selectedFiles.length > 0 && 
                    ` → Will have ${product.images.length + selectedFiles.length} images total`
                  }
                </div>

                {/* Show existing images preview */}
                <div>
                  <p className="text-sm font-medium mb-2">Existing images:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {product.images.slice(0, 4).map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={baseurl + imageUrl || "/placeholder.svg"}
                          alt={`Product image ${index + 1}`}
                          width={100}
                          height={100}
                          className="rounded-md object-cover border"
                        />
                      </div>
                    ))}
                    {product.images.length > 4 && (
                      <div className="flex items-center justify-center bg-gray-100 rounded-md h-[100px] text-sm text-gray-600 border">
                        +{product.images.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">
                  {product && replaceImages ? "New images (will replace existing):" : "New images:"}
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

      {/* Form Summary */}
      {(formData.title || formData.numberOfPieces || formData.quantity) && (
        <Card>
          <CardHeader>
            <CardTitle>Product Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 items-center">
              {formData.title && <Badge variant="outline">{formData.title}</Badge>}
              {formData.numberOfPieces && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {formData.numberOfPieces} pieces
                </Badge>
              )}
              {formData.quantity && <Badge variant="outline">{formData.quantity}</Badge>}
              {formData.price && <Badge variant="outline">₹{formData.price}</Badge>}
              {formData.isFeatured && <Badge variant="default">Featured</Badge>}
              <Badge variant={formData.status === "in_stock" ? "default" : "destructive"}>
                {formData.status === "in_stock" ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  )
}