export interface ColorPalette {
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
  textSecondary: string
  accent: string
  isDark: boolean
}

export async function extractColorsFromImage(imageUrl: string): Promise<ColorPalette> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          resolve(getDefaultPalette())
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const colors = extractDominantColors(imageData.data)

        const palette = createPaletteFromColors(colors)
        resolve(palette)
      } catch (error) {
        console.error("Error extracting colors:", error)
        resolve(getDefaultPalette())
      }
    }

    img.onerror = () => {
      resolve(getDefaultPalette())
    }

    img.src = imageUrl
  })
}

function extractDominantColors(data: Uint8ClampedArray): number[][] {
  const colorMap = new Map<string, { count: number; rgb: number[] }>()

  // Sample every 10th pixel for performance
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    if (a < 128) continue // Skip transparent pixels

    // Skip very light or very dark pixels for better color extraction
    const brightness = (r + g + b) / 3
    if (brightness < 20 || brightness > 235) continue

    const key = `${Math.floor(r / 10)}-${Math.floor(g / 10)}-${Math.floor(b / 10)}`

    if (colorMap.has(key)) {
      colorMap.get(key)!.count++
    } else {
      colorMap.set(key, { count: 1, rgb: [r, g, b] })
    }
  }

  return Array.from(colorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item) => item.rgb)
}

function createPaletteFromColors(colors: number[][]): ColorPalette {
  if (colors.length === 0) return getDefaultPalette()

  const primary = colors[0]
  const secondary = colors[1] || primary

  // Calculate luminance to determine if the image is dark or light
  const primaryLuminance = calculateLuminance(primary)
  const isDark = primaryLuminance < 0.5

  // Create complementary colors
  const primaryHex = rgbToHex(primary)
  const secondaryHex = rgbToHex(secondary)

  if (isDark) {
    return {
      primary: primaryHex,
      secondary: secondaryHex,
      background: adjustBrightness(primaryHex, -0.8),
      surface: adjustBrightness(primaryHex, -0.6),
      text: "#f8fafc",
      textSecondary: "#cbd5e1",
      accent: adjustBrightness(secondaryHex, 0.3),
      isDark: true,
    }
  } else {
    return {
      primary: adjustBrightness(primaryHex, -0.2),
      secondary: adjustBrightness(secondaryHex, -0.2),
      background: adjustBrightness(primaryHex, 0.8),
      surface: adjustBrightness(primaryHex, 0.9),
      text: "#1e293b",
      textSecondary: "#475569",
      accent: adjustBrightness(secondaryHex, -0.1),
      isDark: false,
    }
  }
}

function calculateLuminance(rgb: number[]): number {
  const [r, g, b] = rgb.map((c) => {
    const channel = c / 255
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function rgbToHex(rgb: number[]): string {
  return "#" + rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")
}

function adjustBrightness(hex: string, amount: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const adjusted = rgb.map((c) => {
    const newValue = c + amount * 255
    return Math.max(0, Math.min(255, Math.round(newValue)))
  })

  return rgbToHex(adjusted)
}

function hexToRgb(hex: string): number[] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [Number.parseInt(result[1], 16), Number.parseInt(result[2], 16), Number.parseInt(result[3], 16)]
    : null
}

function getDefaultPalette(): ColorPalette {
  return {
    primary: "#8b5cf6",
    secondary: "#3b82f6",
    background: "#0f172a",
    surface: "#1e293b",
    text: "#f8fafc",
    textSecondary: "#cbd5e1",
    accent: "#ec4899",
    isDark: true,
  }
}
