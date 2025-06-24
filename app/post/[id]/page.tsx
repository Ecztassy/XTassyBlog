import { notFound } from "next/navigation"
import { promises as fs } from "fs"
import path from "path"
import { PostContent } from "@/components/post-content"

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

async function getPost(id: string): Promise<Post | null> {
  try {
    const filePath = path.join(process.cwd(), "data", "posts.json")
    const fileContents = await fs.readFile(filePath, "utf8")
    const data = JSON.parse(fileContents)
    const post = data.posts?.find((p: Post) => p.id === id && p.published)
    return post || null
  } catch (error) {
    console.error("Error reading posts:", error)
    return null
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id)

  if (!post) {
    notFound()
  }

  // Prepare images array for slideshow
  const images = []
  if (post.coverImage) {
    images.push(post.coverImage)
  }
  if (post.images && post.images.length > 0) {
    images.push(...post.images.filter((img) => img !== post.coverImage))
  }

  // Fallback if no images
  if (images.length === 0) {
    images.push("/placeholder.svg?height=600&width=1200&text=Blog+Post")
  }

  return <PostContent post={post} images={images} />
}
