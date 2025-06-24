import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { Resend } from "resend"

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json")
const resend = new Resend(process.env.RESEND_API_KEY)

interface Subscriber {
  id: string
  email: string
  subscribedAt: string
  isActive: boolean
}

async function ensureSubscribersFile() {
  try {
    const dataDir = path.dirname(SUBSCRIBERS_FILE)
    await fs.mkdir(dataDir, { recursive: true })

    try {
      await fs.access(SUBSCRIBERS_FILE)
    } catch {
      await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify({ subscribers: [] }, null, 2))
    }
  } catch (error) {
    console.error("Error ensuring subscribers file:", error)
  }
}

async function readSubscribers(): Promise<Subscriber[]> {
  try {
    await ensureSubscribersFile()
    const fileContents = await fs.readFile(SUBSCRIBERS_FILE, "utf8")
    const data = JSON.parse(fileContents)
    return data.subscribers || []
  } catch (error) {
    console.error("Error reading subscribers:", error)
    return []
  }
}

async function writeSubscribers(subscribers: Subscriber[]) {
  try {
    await ensureSubscribersFile()
    await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify({ subscribers }, null, 2))
  } catch (error) {
    console.error("Error writing subscribers:", error)
    throw error
  }
}

async function sendWelcomeEmail(email: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    await resend.emails.send({
      from: "Blog <noreply@onboarding.resend.dev>", // Use your verified domain
      to: email,
      subject: "Welcome to Our Blog!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Our Blog</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Our Blog! 🎉</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="color: #2d3748; margin-top: 0;">Thanks for subscribing!</h2>
              <p style="color: #4a5568; font-size: 16px;">You'll now receive notifications whenever we publish new articles and insights.</p>
              
              <a href="${baseUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin-top: 15px;">
                Visit Our Blog
              </a>
            </div>
            
            <div style="text-align: center; color: #718096; font-size: 14px;">
              <p>We promise to only send you quality content, no spam!</p>
            </div>
          </body>
        </html>
      `,
    })

    console.log(`✅ Welcome email sent to ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${email}:`, error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    const subscribers = await readSubscribers()

    // Check if email already exists
    const existingSubscriber = subscribers.find((sub) => sub.email.toLowerCase() === email.toLowerCase())

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json({ error: "Email already subscribed" }, { status: 400 })
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true
        existingSubscriber.subscribedAt = new Date().toISOString()
        await writeSubscribers(subscribers)

        // Send welcome email if Resend is configured
        if (process.env.RESEND_API_KEY) {
          await sendWelcomeEmail(email)
        }

        return NextResponse.json({ message: "Subscription reactivated successfully" })
      }
    }

    // Add new subscriber
    const newSubscriber: Subscriber = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      subscribedAt: new Date().toISOString(),
      isActive: true,
    }

    subscribers.push(newSubscriber)
    await writeSubscribers(subscribers)

    // Send welcome email if Resend is configured
    if (process.env.RESEND_API_KEY) {
      await sendWelcomeEmail(email)
    }

    console.log(`New subscriber: ${email}`)

    return NextResponse.json({ message: "Subscribed successfully" })
  } catch (error) {
    console.error("Subscription error:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const subscribers = await readSubscribers()
    const activeSubscribers = subscribers.filter((sub) => sub.isActive)
    return NextResponse.json({ count: activeSubscribers.length, subscribers: activeSubscribers })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get subscribers" }, { status: 500 })
  }
}
