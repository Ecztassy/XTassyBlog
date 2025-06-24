"use client"

import { useState, useEffect } from "react"

interface TypewriterTextProps {
  text: string
  delay?: number
  className?: string
  repeat?: boolean
  pauseTime?: number
}

export function TypewriterText({
  text,
  delay = 100,
  className = "",
  repeat = true,
  pauseTime = 3000,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isPaused) {
      timeout = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, pauseTime)
      return () => clearTimeout(timeout)
    }

    if (isDeleting) {
      if (displayText.length === 0) {
        setIsDeleting(false)
        setCurrentIndex(0)
        return
      }

      timeout = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1))
      }, delay / 2)
    } else {
      if (currentIndex === text.length) {
        if (repeat) {
          setIsPaused(true)
        }
        return
      }

      timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, delay)
    }

    return () => clearTimeout(timeout)
  }, [currentIndex, delay, displayText, isDeleting, isPaused, pauseTime, repeat, text])

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}
