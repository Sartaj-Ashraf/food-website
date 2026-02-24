"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ProductForm } from "../../components/product-form"
import { useToast } from "@/hooks/use-toast"
import { customFetch } from "@/utils/customFetch"

interface Product {
  _id: string
  title: string
  description: string
  numberOfPieces: number
  slug: string
  price: number
  discountPrice?: number
  quantity: string
  images: string[]
  ingredients: string[]
  isFeatured: boolean
  isActive: boolean
  status: "out_of_stock" | "in_stock"
  createdAt: string
  createdBy: {
    name: string
    email: string
  }
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await customFetch.get(`/products/${id}`)
        const data = await response.data

        if (data.success) {
          setProduct(data.product)
        } else {
          toast({
            title: "Error",
            description: "Product not found",
            variant: "destructive",
          })
          router.push("/admin/products")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch product",
          variant: "destructive",
        })
        router.push("/admin/products")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, router, toast])

  const handleCancel = () => {
    router.push("/admin/products")
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Link href="/admin/products">
            <Button className="mt-4">Back to Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">Update product information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Update the details below to modify the product</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm product={product} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  )
}
