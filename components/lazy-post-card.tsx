"use client"

import { useRef, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
import Link from "next/link"

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

interface LazyPostCardProps {
  post: Post
  index: number
}

export function LazyPostCard({ post, index }: LazyPostCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, index * 100)
          observer.disconnect()
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      },
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [index])

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-700 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <Link href={`/post/${post.id}`}>
        <Card className="h-full hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/20 transition-all duration-500 cursor-pointer bg-gradient-to-br from-slate-50/90 to-white/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:border-purple-300/50 dark:hover:border-purple-500/30 hover:scale-105 group">
          <CardHeader>
            <CardTitle className="line-clamp-2 text-slate-900 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
              {post.title}
            </CardTitle>
            <CardDescription className="line-clamp-3 text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
              {post.excerpt}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.ceil(post.content.split(" ").length / 200)} min read
              </div>
            </div>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs font-medium px-2 py-1 bg-gradient-to-r from-purple-600/90 to-blue-600/90 dark:from-purple-500/90 dark:to-blue-500/90 text-white dark:text-white border-0 group-hover:from-purple-700/90 group-hover:to-blue-700/90 dark:group-hover:from-purple-400/90 dark:group-hover:to-blue-400/90 transition-all duration-300 hover:scale-105"
                  >
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs font-medium px-2 py-1 bg-slate-100/90 dark:bg-slate-700/90 text-slate-700 dark:text-slate-300 border-slate-300/50 dark:border-slate-600/50 hover:bg-slate-200/90 dark:hover:bg-slate-600/90 transition-all duration-300"
                  >
                    +{post.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
