"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function LazyImage({ src, alt, width, height, className = "", priority = false }: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: "200px",
        threshold: 0.1,
      },
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [priority])

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden transition-opacity duration-700 ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {isVisible ? (
        <Image
          src={src || "/placeholder.svg?height=400&width=800"}
          alt={alt}
          width={width || 800}
          height={height || 400}
          className="w-full h-full object-cover"
          priority={priority}
        />
      ) : (
        <div
          className="w-full h-full bg-slate-200/50 dark:bg-slate-800/50 animate-pulse flex items-center justify-center"
          style={{ aspectRatio: width && height ? `${width}/${height}` : "16/9" }}
        >
          <div className="text-slate-400 dark:text-slate-600">Loading...</div>
        </div>
      )}
    </div>
  )
}
