import { PenTool, Coffee, BookOpen } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { TypewriterText } from "@/components/typewriter-text"

export function BlogHeader() {
  return (
    <header className="text-center space-y-8 relative px-4 py-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex justify-center items-center gap-4 mt-12">
        <div className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-full border border-purple-200/30 dark:border-white/10">
          <PenTool className="h-10 w-10 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent leading-tight">
          <TypewriterText text="Xtassy Thoughts" delay={150} repeat={true} pauseTime={5000} />
        </h1>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed animate-fade-in-up">
          Welcome to my personal space where I share thoughts, experiences, and insights. Grab a{" "}
          <Coffee className="inline h-6 w-6 mx-1 text-amber-500 dark:text-amber-400" /> and explore my latest posts!
        </p>

        <div className="flex justify-center gap-4 pt-6">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200/50 dark:border-slate-700/50 hover:border-purple-300/50 dark:hover:border-purple-500/30 transition-all duration-300 hover:scale-105">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">Personal Blog</span>
          </div>
        </div>
      </div>
    </header>
  )
}
