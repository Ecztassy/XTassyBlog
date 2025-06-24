import { Suspense } from "react"
import { BlogHeader } from "@/components/blog-header"
import { PostList } from "@/components/post-list"
import { SearchAndFilter } from "@/components/search-and-filter"
import { NewsletterSubscription } from "@/components/newsletter-subscription"
import { SmoothScroll } from "@/components/smooth-scroll"

export default function HomePage() {
  return (
    <>
      <SmoothScroll />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
        <div className="container mx-auto px-4 py-4">
          <BlogHeader />

          <div className="mt-16 max-w-4xl mx-auto space-y-8">
            <Suspense fallback={<div className="text-center text-slate-400">Loading...</div>}>
              <SearchAndFilter />
              <PostList />
            </Suspense>

            {/* Newsletter Subscription */}
            <div className="mt-12">
              <NewsletterSubscription />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
