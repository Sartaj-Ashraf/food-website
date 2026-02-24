"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Download, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { customFetch } from "@/utils/customFetch"

interface Combo {
  _id: string
  name: string
  images: string[]
}

interface ComboImagesProps {
  combo: Combo
  onUpdate: () => void
}

export function ComboImages({ combo, onUpdate }: ComboImagesProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()
  const baseurl: string = process.env.NEXT_PUBLIC_BASE_URL as string;

  const handleRemoveImage = async (imageUrl: string) => {
    setLoading(imageUrl)

    try {
      const response = await customFetch.delete(`/combos/${combo._id}/images/${encodeURIComponent(imageUrl)}`)

      if (response.data.success) {
        onUpdate()
        toast({
          title: "Success",
          description: "Image removed successfully",
        })
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to remove image",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleDownloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement("a")
    link.href = baseurl + imageUrl
    link.download = `${combo.name}-image-${index + 1}`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewImage = (imageUrl: string) => {
    window.open(baseurl + imageUrl, "_blank")
  }

  if (combo.images.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground">No images available for this combo</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{combo.name}</CardTitle>
          <CardDescription>
            {combo.images.length} image{combo.images.length !== 1 ? "s" : ""} available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {combo.images.map((imageUrl, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={baseurl + imageUrl || "/placeholder.svg"}
                    alt={`${combo.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Image {index + 1}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewImage(imageUrl)}
                        title="View full size"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadImage(imageUrl, index)}
                        title="Download image"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={loading === imageUrl} title="Remove image">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Image</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove this image? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveImage(imageUrl)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
