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

interface Post {
  id: string
  title: string
  excerpt: string
  createdAt: string
}

async function readSubscribers(): Promise<Subscriber[]> {
  try {
    const fileContents = await fs.readFile(SUBSCRIBERS_FILE, "utf8")
    const data = JSON.parse(fileContents)
    return data.subscribers || []
  } catch (error) {
    console.error("Error reading subscribers:", error)
    return []
  }
}

async function sendNotificationEmail(subscriber: Subscriber, post: Post) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    await resend.emails.send({
      from: "Blog <noreply@onboarding.resend.dev>", // Use your verified domain
      to: subscriber.email,
      subject: `New Article: ${post.title}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Blog Post</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">New Article Published!</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="color: #2d3748; margin-top: 0; font-size: 24px;">${post.title}</h2>
              <p style="color: #4a5568; font-size: 16px; margin-bottom: 20px;">${post.excerpt}</p>
              
              <a href="${baseUrl}/post/${post.id}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Read Full Article
              </a>
            </div>
            
            <div style="text-align: center; color: #718096; font-size: 14px;">
              <p>You're receiving this because you subscribed to our blog updates.</p>
              <p>
                <a href="${baseUrl}/unsubscribe?id=${subscriber.id}" 
                   style="color: #667eea; text-decoration: none;">
                  Unsubscribe
                </a>
              </p>
            </div>
          </body>
        </html>
      `,
    })

    console.log(`✅ Email sent to ${subscriber.email}`)
  } catch (error) {
    console.error(`❌ Failed to send email to ${subscriber.email}:`, error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { postId, title, excerpt } = await request.json()

    if (!postId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Resend API key not configured" }, { status: 500 })
    }

    const subscribers = await readSubscribers()
    const activeSubscribers = subscribers.filter((sub) => sub.isActive)

    if (activeSubscribers.length === 0) {
      return NextResponse.json({ message: "No active subscribers to notify" })
    }

    const post: Post = {
      id: postId,
      title,
      excerpt: excerpt || "",
      createdAt: new Date().toISOString(),
    }

    // Send notifications to all active subscribers
    const notifications = activeSubscribers.map((subscriber) => sendNotificationEmail(subscriber, post))

    await Promise.all(notifications)

    return NextResponse.json({
      message: `Notifications sent to ${activeSubscribers.length} subscribers`,
      count: activeSubscribers.length,
    })
  } catch (error) {
    console.error("Notification error:", error)
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 })
  }
}
