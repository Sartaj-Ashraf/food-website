"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { customFetch } from "@/utils/customFetch"
import { ComboForm } from "../../components/ComboForm"
interface Combo {
    _id: string
    slug: string
    name: string
    description: string
    products: []
    originalPrice: number
    comboPrice: number
    images: string[]
    tags: string[]
    isFeatured: boolean
    isActive: boolean
    status: "out_of_stock" | "in_stock"
}

export default function EditComboPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [combo, setCombo] = useState<Combo | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const {data} = await customFetch.get(`/combos/combo/${id}`)

        if (data.success) {
          setCombo(data.combo)
        } else {
          toast({
            title: "Error",
            description: "Combo not found",
            variant: "destructive",
          })
          router.push("/admin/combos")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch product",
          variant: "destructive",
        })
        router.push("/admin/combos")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, router, toast])

  const handleCancel = () => {
    router.push("/admin/combos")
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

  if (!combo) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Combo not found</h1>
          <Link href="/admin/combos">
            <Button className="mt-4">Back to Combos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/combos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Combos
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Combo</h1>
          <p className="text-muted-foreground">Update combo information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Combo Information</CardTitle>
          <CardDescription>Update the details below to modify the combo</CardDescription>
        </CardHeader>
        <CardContent>
          <ComboForm combo={combo} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  )
}
