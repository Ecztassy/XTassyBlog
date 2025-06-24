import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const DATA_FILE = path.join(process.cwd(), "data", "posts.json")

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
  images?: string[]
}

async function ensureDataFile() {
  try {
    const dataDir = path.dirname(DATA_FILE)
    await fs.mkdir(dataDir, { recursive: true })

    try {
      await fs.access(DATA_FILE)
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify({ posts: [] }, null, 2))
    }
  } catch (error) {
    console.error("Error ensuring data file:", error)
  }
}

async function readPosts(): Promise<Post[]> {
  try {
    await ensureDataFile()
    const fileContents = await fs.readFile(DATA_FILE, "utf8")
    const data = JSON.parse(fileContents)
    return data.posts || []
  } catch (error) {
    console.error("Error reading posts:", error)
    return []
  }
}

async function writePosts(posts: Post[]) {
  try {
    await ensureDataFile()
    await fs.writeFile(DATA_FILE, JSON.stringify({ posts }, null, 2))
  } catch (error) {
    console.error("Error writing posts:", error)
    throw error
  }
}

export async function GET() {
  try {
    const posts = await readPosts()
    return NextResponse.json({ posts })
  } catch (error) {
    return NextResponse.json({ error: "Failed to read posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, excerpt, tags, published, coverImage, images } = body

    const posts = await readPosts()
    const newPost: Post = {
      id: Date.now().toString(),
      title,
      content,
      excerpt: excerpt || content.substring(0, 150) + "...",
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: published || false,
      coverImage: coverImage || undefined,
      images: images || [],
    }

    posts.push(newPost)
    await writePosts(posts)

    return NextResponse.json({ post: newPost })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, content, excerpt, tags, published, coverImage, images } = body

    const posts = await readPosts()
    const postIndex = posts.findIndex((p) => p.id === id)

    if (postIndex === -1) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    posts[postIndex] = {
      ...posts[postIndex],
      title,
      content,
      excerpt: excerpt || content.substring(0, 150) + "...",
      tags: tags || [],
      published: published || false,
      updatedAt: new Date().toISOString(),
      coverImage: coverImage || undefined,
      images: images || [],
    }

    await writePosts(posts)

    return NextResponse.json({ post: posts[postIndex] })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    const posts = await readPosts()
    const filteredPosts = posts.filter((p) => p.id !== id)

    if (filteredPosts.length === posts.length) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    await writePosts(filteredPosts)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
