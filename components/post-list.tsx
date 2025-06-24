"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Tag } from "lucide-react"
import { LazyPostCard } from "@/components/lazy-post-card"

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

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  const search = searchParams.get("search") || ""
  const sortBy = searchParams.get("sort") || "recent"

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts")
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error("Failed to fetch posts:", error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedPosts = posts
    .filter((post) => post.published && post.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "alphabetic":
          return a.title.localeCompare(b.title)
        case "alphabetic-desc":
          return b.title.localeCompare(a.title)
        case "recent":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-lg h-64"
          ></div>
        ))}
      </div>
    )
  }

  if (filteredAndSortedPosts.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in-up">
        <div className="text-slate-400 dark:text-slate-500 mb-4">
          <Tag className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
          {search ? "No posts found" : "No posts yet"}
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          {search ? `No posts match "${search}". Try a different search term.` : "Check back later for new content!"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredAndSortedPosts.map((post, index) => (
        <LazyPostCard key={post.id} post={post} index={index} />
      ))}
    </div>
  )
}
