"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LazyImage } from "@/components/lazy-image"

interface ImageSlideshowProps {
  images: string[]
  alt: string
  onImageChange?: (imageUrl: string, index: number) => void
  className?: string
}

export function ImageSlideshow({ images, alt, onImageChange, className = "" }: ImageSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    const newIndex = (currentIndex + 1) % images.length
    setCurrentIndex(newIndex)
    onImageChange?.(images[newIndex], newIndex)
  }

  const prevImage = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
    onImageChange?.(images[newIndex], newIndex)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
    onImageChange?.(images[index], index)
  }

  useEffect(() => {
    // Notify parent of initial image
    if (images.length > 0) {
      onImageChange?.(images[0], 0)
    }
  }, [images, onImageChange])

  if (images.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <LazyImage
          src="/placeholder.svg?height=600&width=1200&text=No+Image"
          alt={alt}
          width={1200}
          height={600}
          priority={true}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className={`relative ${className}`}>
        <LazyImage
          src={images[0]}
          alt={alt}
          width={1200}
          height={600}
          priority={true}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className={`relative group ${className}`}>
      <LazyImage
        src={images[currentIndex]}
        alt={`${alt} - Image ${currentIndex + 1}`}
        width={1200}
        height={600}
        priority={true}
        className="w-full h-full object-cover transition-opacity duration-500"
      />

      {/* Navigation Arrows */}
      <Button
        onClick={prevImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-2 border-white/30 hover:border-white/50 backdrop-blur-sm transition-all duration-300 opacity-70 group-hover:opacity-100 z-10"
        size="lg"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        onClick={nextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-2 border-white/30 hover:border-white/50 backdrop-blur-sm transition-all duration-300 opacity-70 group-hover:opacity-100 z-10"
        size="lg"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`w-3 h-3 rounded-full border-2 border-white/50 backdrop-blur-sm transition-all duration-300 ${
              index === currentIndex ? "bg-white scale-110" : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Image Counter */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm border border-white/20 z-10">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}
