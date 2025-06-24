"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)

    // Load theme from cookie
    const savedTheme = document.cookie
      .split("; ")
      .find((row) => row.startsWith("theme="))
      ?.split("=")[1]

    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      setTheme(savedTheme)
    }
  }, [setTheme])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)

    // Save theme to cookie (expires in 1 year)
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    document.cookie = `theme=${newTheme}; expires=${expires.toUTCString()}; path=/`
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="backdrop-blur-xl border transition-all duration-300"
        style={{
          backgroundColor: "rgba(0,0,0,0.3)",
          borderColor: "rgba(255,255,255,0.2)",
          color: "white",
          textShadow: "0 2px 8px rgba(0,0,0,0.8)",
        }}
      >
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="backdrop-blur-xl border transition-all duration-300 hover:scale-105"
      style={{
        backgroundColor: "rgba(0,0,0,0.3)",
        borderColor: "rgba(255,255,255,0.2)",
        color: "white",
        textShadow: "0 2px 8px rgba(0,0,0,0.8)",
      }}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
