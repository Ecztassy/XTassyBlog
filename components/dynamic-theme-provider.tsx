"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useTheme } from "next-themes"
import { extractColorsFromImage, type ColorPalette } from "@/lib/color-extractor"

interface DynamicThemeContextType {
  palette: ColorPalette
  updatePalette: (imageUrl: string) => Promise<void>
  resetPalette: () => void
}

const DynamicThemeContext = createContext<DynamicThemeContextType | undefined>(undefined)

export function DynamicThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme()
  const [palette, setPalette] = useState<ColorPalette>({
    primary: "#8b5cf6",
    secondary: "#3b82f6",
    background: "#0f172a",
    surface: "#1e293b",
    text: "#f8fafc",
    textSecondary: "#cbd5e1",
    accent: "#ec4899",
    isDark: true,
  })

  const updatePalette = async (imageUrl: string) => {
    try {
      const extractedPalette = await extractColorsFromImage(imageUrl)

      // Adjust palette based on current theme preference
      if (theme === "light" && extractedPalette.isDark) {
        // Convert dark palette to light version
        const lightPalette: ColorPalette = {
          ...extractedPalette,
          background: "#ffffff",
          surface: "#f8fafc",
          text: "#1e293b",
          textSecondary: "#475569",
          primary: extractedPalette.accent,
          accent: extractedPalette.primary,
          isDark: false,
        }
        setPalette(lightPalette)
      } else if (theme === "dark" && !extractedPalette.isDark) {
        // Convert light palette to dark version
        const darkPalette: ColorPalette = {
          ...extractedPalette,
          background: "#0f172a",
          surface: "#1e293b",
          text: "#f8fafc",
          textSecondary: "#cbd5e1",
          isDark: true,
        }
        setPalette(darkPalette)
      } else {
        setPalette(extractedPalette)
      }
    } catch (error) {
      console.error("Failed to extract colors:", error)
    }
  }

  const resetPalette = () => {
    setPalette({
      primary: "#8b5cf6",
      secondary: "#3b82f6",
      background: theme === "light" ? "#ffffff" : "#0f172a",
      surface: theme === "light" ? "#f8fafc" : "#1e293b",
      text: theme === "light" ? "#1e293b" : "#f8fafc",
      textSecondary: theme === "light" ? "#475569" : "#cbd5e1",
      accent: "#ec4899",
      isDark: theme !== "light",
    })
  }

  // Update palette when theme changes
  useEffect(() => {
    if (theme) {
      resetPalette()
    }
  }, [theme])

  return (
    <DynamicThemeContext.Provider value={{ palette, updatePalette, resetPalette }}>
      {children}
    </DynamicThemeContext.Provider>
  )
}

export function useDynamicTheme() {
  const context = useContext(DynamicThemeContext)
  if (context === undefined) {
    throw new Error("useDynamicTheme must be used within a DynamicThemeProvider")
  }
  return context
}
