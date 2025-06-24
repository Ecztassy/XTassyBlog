"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, X, ImageIcon, LinkIcon, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/image-upload"

interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  tags: string[]
  createdAt: string
  updatedAt: string
  published: boolean
  coverImage?: string
  images?: string[]
}

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    tags: "",
    published: false,
    coverImage: "",
    images: [] as string[],
  })
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit")
  const [isNotifying, setIsNotifying] = useState(false)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      window.location.href = "/"
      return
    }
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts")
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const postData = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      id: editingPost?.id,
    }

    try {
      const response = await fetch("/api/posts", {
        method: editingPost ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        const { post } = await response.json()

        toast({
          title: editingPost ? "Post updated!" : "Post created!",
          description: "Your changes have been saved successfully.",
        })

        // If it's a new published post, ask if they want to notify subscribers
        if (!editingPost && formData.published) {
          const shouldNotify = confirm("Would you like to notify subscribers about this new post?")
          if (shouldNotify) {
            await notifySubscribers(post)
          }
        }

        resetForm()
        fetchPosts()
      } else {
        throw new Error("Failed to save post")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save the post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const notifySubscribers = async (post: Post) => {
    setIsNotifying(true)
    try {
      const response = await fetch("/api/notify-subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          title: post.title,
          excerpt: post.excerpt,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Notifications sent!",
          description: `${data.count} subscribers have been notified about the new post.`,
        })
      } else {
        throw new Error("Failed to send notifications")
      }
    } catch (error) {
      toast({
        title: "Notification failed",
        description: "Failed to notify subscribers. You can try again later.",
        variant: "destructive",
      })
    } finally {
      setIsNotifying(false)
    }
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      tags: post.tags.join(", "),
      published: post.published,
      coverImage: post.coverImage || "",
      images: post.images || [],
    })
    setIsEditing(true)
    setPreviewMode("edit")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const response = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        toast({
          title: "Post deleted!",
          description: "The post has been removed successfully.",
        })
        fetchPosts()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the post.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      tags: "",
      published: false,
      coverImage: "",
      images: [],
    })
    setEditingPost(null)
    setIsEditing(false)
    setPreviewMode("edit")
  }

  const addImage = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrl],
    }))
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const insertAtCursor = (textToInsert: string) => {
    if (!contentRef.current) return

    const textarea = contentRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value

    const newText = text.substring(0, start) + textToInsert + text.substring(end)
    setFormData({ ...formData, content: newText })

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length)
    }, 0)
  }

  const insertImage = () => {
    const imageUrl = prompt("Enter image URL:")
    if (imageUrl) {
      insertAtCursor(`<img src="${imageUrl}" alt="Image" class="w-full rounded-lg my-4" />\n`)
    }
  }

  const insertLink = () => {
    const url = prompt("Enter URL:")
    const text = prompt("Enter link text:")
    if (url && text) {
      insertAtCursor(`<a href="${url}" target="_blank" class="text-blue-500 hover:underline">${text}</a>`)
    }
  }

  const insertVideo = () => {
    const videoUrl = prompt("Enter video URL (YouTube, Vimeo, etc.):")
    if (videoUrl) {
      insertAtCursor(
        `<iframe src="${videoUrl}" width="100%" height="400" frameborder="0" allowfullscreen class="rounded-lg my-4"></iframe>\n`,
      )
    }
  }

  const formatContent = (content: string): string => {
    if (!content) return ""
    if (/<[a-z][\s\S]*>/i.test(content)) {
      return content
    }
    return content
      .split("\n")
      .filter((paragraph) => paragraph.trim() !== "")
      .map((paragraph) => `<p class="mb-4">${paragraph}</p>`)
      .join("")
  }

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isEditing && (
            <Card className="lg:col-span-1 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-slate-200">{editingPost ? "Edit Post" : "Create New Post"}</CardTitle>
                <CardDescription className="text-slate-400">
                  {editingPost ? "Update your existing post" : "Write a new blog post"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as "edit" | "preview")}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>

                  <TabsContent value="edit">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-slate-300">
                          Title
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                          className="bg-slate-800/50 border-slate-700/50 text-slate-200 focus:border-purple-500/50"
                        />
                      </div>

                      <ImageUpload
                        value={formData.coverImage}
                        onChange={(value) => setFormData({ ...formData, coverImage: value })}
                        label="Cover Image"
                      />

                      <div>
                        <Label className="text-slate-300">Additional Images (for slideshow)</Label>
                        <div className="space-y-2">
                          <ImageUpload value="" onChange={addImage} label="Add Image" />
                          {formData.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                              {formData.images.map((img, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={img || "/placeholder.svg"}
                                    alt={`Image ${index + 1}`}
                                    className="w-full h-20 object-cover rounded"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="excerpt" className="text-slate-300">
                          Excerpt
                        </Label>
                        <Textarea
                          id="excerpt"
                          value={formData.excerpt}
                          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                          rows={2}
                          placeholder="Brief description of the post..."
                          className="bg-slate-800/50 border-slate-700/50 text-slate-200 focus:border-purple-500/50"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="content" className="text-slate-300">
                            Content
                          </Label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={insertImage}
                              className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                            >
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Image
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={insertLink}
                              className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                            >
                              <LinkIcon className="h-3 w-3 mr-1" />
                              Link
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={insertVideo}
                              className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                            >
                              Video
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          id="content"
                          ref={contentRef}
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          rows={10}
                          required
                          className="bg-slate-800/50 border-slate-700/50 text-slate-200 focus:border-purple-500/50 font-mono"
                        />
                      </div>

                      <div>
                        <Label htmlFor="tags" className="text-slate-300">
                          Tags (comma-separated)
                        </Label>
                        <Input
                          id="tags"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="react, javascript, tutorial"
                          className="bg-slate-800/50 border-slate-700/50 text-slate-200 focus:border-purple-500/50"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="published"
                          checked={formData.published}
                          onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                        />
                        <Label htmlFor="published" className="text-slate-300">
                          Published
                        </Label>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {editingPost ? "Update" : "Create"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetForm}
                          className="border-slate-600 text-slate-300 hover:bg-slate-800/50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="preview">
                    <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700/50">
                      <h1 className="text-2xl font-bold text-slate-200 mb-4">{formData.title || "Post Title"}</h1>
                      {formData.coverImage && (
                        <div className="mb-6 rounded-lg overflow-hidden">
                          <img
                            src={formData.coverImage || "/placeholder.svg"}
                            alt="Cover"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )}
                      <div className="prose prose-slate prose-invert max-w-none">
                        <div
                          className="text-justify text-slate-300 space-y-4"
                          dangerouslySetInnerHTML={{ __html: formatContent(formData.content) }}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          <div className={isEditing ? "lg:col-span-1" : "lg:col-span-2"}>
            <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-slate-200">All Posts ({posts.length})</CardTitle>
                <CardDescription className="text-slate-400">Manage your blog posts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="border border-slate-700/50 rounded-lg p-4 bg-slate-800/50 backdrop-blur-sm hover:bg-slate-700/30 transition-colors duration-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-slate-200">{post.title}</h3>
                        <div className="flex gap-2">
                          {post.published && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => notifySubscribers(post)}
                              disabled={isNotifying}
                              className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(post)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(post.id)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{post.excerpt}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Badge
                          variant={post.published ? "default" : "secondary"}
                          className={
                            post.published
                              ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30"
                              : ""
                          }
                        >
                          {post.published ? "Published" : "Draft"}
                        </Badge>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.tags.length > 0 && <span>• {post.tags.join(", ")}</span>}
                      </div>
                    </div>
                  ))}
                  {posts.length === 0 && (
                    <p className="text-center text-slate-500 py-8">No posts yet. Create your first post!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
