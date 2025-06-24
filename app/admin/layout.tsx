"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    // Only allow access in development mode
    if (process.env.NODE_ENV !== "development") {
      router.push("/")
      return
    }
  }, [router])

  // Don't render anything in production
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return <>{children}</>
}
