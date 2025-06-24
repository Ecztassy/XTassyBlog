"use client"

import { useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { ImageSlideshow } from "@/components/image-slideshow"
import { DynamicThemeProvider, useDynamicTheme } from "@/components/dynamic-theme-provider"
import { useTheme } from "next-themes"

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
}

interface PostContentProps {
  post: Post
  images: string[]
}

function PostContentInner({ post, images }: PostContentProps) {
  const { palette, updatePalette } = useDynamicTheme()
  const { theme } = useTheme()

  useEffect(() => {
    if (images.length > 0) {
      updatePalette(images[0])
    }
  }, [images, updatePalette])

  const handleImageChange = (imageUrl: string) => {
    updatePalette(imageUrl)
  }

  const formatContent = (content: string): string => {
    if (!content) return ""
    if (/<[a-z][\s\S]*>/i.test(content)) {
      return content
    }
    return content
      .split("\n")
      .filter((paragraph) => paragraph.trim() !== "")
      .map((paragraph) => `<p class="mb-6 text-lg leading-relaxed">${paragraph}</p>`)
      .join("")
  }

  // Theme-aware styling
  const isLightMode = theme === "light"
  const contentBg = isLightMode ? "rgba(255, 255, 255, 0.75)" : "transparent"
  const overlayGradient = isLightMode
    ? `linear-gradient(to bottom, transparent 0%, transparent 100%)`
    : `linear-gradient(to bottom, transparent 0%, ${palette.background}05 70%, ${palette.background}10 100%)`

  const textShadow = isLightMode
    ? "0 1px 3px rgba(255,255,255,0.8), 0 0 10px rgba(255,255,255,0.9)"
    : `0 0 20px ${palette.background}, 0 0 40px ${palette.background}, 0 2px 4px ${palette.background}`

  const borderColor = isLightMode ? "rgba(0,0,0,0.1)" : `${palette.primary}20`

  return (
    <div
      className="min-h-screen transition-all duration-700"
      style={{
        backgroundColor: palette.background,
      }}
    >
      {/* Full Screen Background Image */}
      <div className="fixed inset-0 z-0">
        <ImageSlideshow images={images} alt={post.title} onImageChange={handleImageChange} className="w-full h-full" />
        <div className="absolute inset-0 transition-all duration-700" style={{ background: overlayGradient }} />
      </div>

      {/* Fixed Header Controls */}
      <div className="fixed top-0 left-0 right-0 z-30 p-4 flex justify-between items-center">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="backdrop-blur-xl border transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: isLightMode ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)",
              borderColor: isLightMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)",
              color: isLightMode ? "#1e293b" : "white",
              textShadow: isLightMode ? "none" : "0 2px 8px rgba(0,0,0,0.8)",
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Homepage
          </Button>
        </Link>
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-20 pt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <div
              className="backdrop-blur-sm rounded-2xl p-8 mb-8 border transition-all duration-700"
              style={{
                backgroundColor: contentBg,
                borderColor: borderColor,
                boxShadow: isLightMode ? "0 10px 25px rgba(0,0,0,0.1)" : `0 0 30px ${palette.primary}10`,
              }}
            >
              <h1
                className="text-4xl md:text-6xl font-bold leading-tight mb-6 transition-colors duration-700"
                style={{
                  color: isLightMode ? "#1e293b" : palette.text,
                  textShadow: textShadow,
                }}
              >
                {post.title}
              </h1>

              <div
                className="flex flex-wrap items-center gap-6 text-lg mb-6 transition-colors duration-700"
                style={{
                  color: isLightMode ? "#475569" : palette.textSecondary,
                  textShadow: isLightMode ? "none" : `0 0 15px ${palette.background}, 0 2px 4px ${palette.background}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">{Math.ceil(post.content.split(" ").length / 200)} min read</span>
                </div>
              </div>

              {post.tags.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                  <Tag
                    className="h-5 w-5 transition-colors duration-700"
                    style={{
                      color: isLightMode ? "#475569" : palette.textSecondary,
                    }}
                  />
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="px-4 py-2 text-sm font-medium transition-all duration-700 hover:scale-105 backdrop-blur-sm"
                      style={{
                        backgroundColor: isLightMode ? "rgba(139, 92, 246, 0.1)" : `${palette.primary}15`,
                        color: isLightMode ? "#7c3aed" : palette.text,
                        borderColor: isLightMode ? "rgba(139, 92, 246, 0.3)" : `${palette.primary}40`,
                        textShadow: isLightMode ? "none" : `0 0 10px ${palette.background}`,
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Article Content */}
            <div
              className="backdrop-blur-sm rounded-2xl p-8 border transition-all duration-700"
              style={{
                backgroundColor: contentBg,
                borderColor: borderColor,
                boxShadow: isLightMode ? "0 10px 25px rgba(0,0,0,0.1)" : `0 0 30px ${palette.primary}10`,
              }}
            >
              <div
                className="prose prose-xl max-w-none transition-colors duration-700"
                style={{
                  color: isLightMode ? "#1e293b" : palette.text,
                  textShadow: textShadow,
                }}
                dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PostContent({ post, images }: PostContentProps) {
  return (
    <DynamicThemeProvider>
      <PostContentInner post={post} images={images} />
    </DynamicThemeProvider>
  )
}
