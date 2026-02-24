"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ComboForm } from "../components/ComboForm"

export default function NewComboPage() {
  const router = useRouter()

  const handleCancel = () => {
    router.push("/admin/combos")
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
          <h1 className="text-3xl font-bold">Add New Combo</h1>
          <p className="text-muted-foreground">Create a new combo for your inventory</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Combo Information</CardTitle>
          <CardDescription>Fill in the details below to create a new combo</CardDescription>
        </CardHeader>
        <CardContent>
          <ComboForm onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  )
}
