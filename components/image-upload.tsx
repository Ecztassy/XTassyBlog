"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function ImageUpload({ value, onChange, label = "Image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState(value)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()
      onChange(data.url)
      toast({
        title: "Success!",
        description: "Image uploaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleUrlSubmit = () => {
    onChange(urlInput)
    toast({
      title: "Success!",
      description: "Image URL updated.",
    })
  }

  const clearImage = () => {
    onChange("")
    setUrlInput("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <Label className="text-slate-300">{label}</Label>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
          <TabsTrigger value="upload" className="data-[state=active]:bg-purple-600">
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url" className="data-[state=active]:bg-purple-600">
            <Link className="h-4 w-4 mr-2" />
            Image URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="bg-slate-800/50 border-slate-700/50 text-slate-200 focus:border-purple-500/50"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
            >
              {uploading ? "Uploading..." : "Browse"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="bg-slate-800/50 border-slate-700/50 text-slate-200 focus:border-purple-500/50"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleUrlSubmit}
              className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
            >
              Set URL
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Image Preview */}
      {value && (
        <div className="relative">
          <div className="relative w-full h-32 bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50">
            <img
              src={value || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=128&width=256"
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={clearImage}
              className="absolute top-2 right-2"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-1">Current image: {value}</p>
        </div>
      )}
    </div>
  )
}
