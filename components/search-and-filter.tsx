"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

export function SearchAndFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "recent")

  const updateURL = (newSearch: string, newSort: string) => {
    const params = new URLSearchParams()
    if (newSearch) params.set("search", newSearch)
    if (newSort && newSort !== "recent") params.set("sort", newSort)

    const queryString = params.toString()
    const newURL = queryString ? `${pathname}?${queryString}` : pathname
    router.push(newURL)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    updateURL(value, sortBy)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    updateURL(search, value)
  }

  return (
    <div className="mb-8 space-y-4 animate-slide-in-left">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 h-4 w-4 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors duration-300" />
          <Input
            placeholder="Search posts by title..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-purple-400/50 dark:focus:border-purple-500/50 focus:ring-purple-400/20 dark:focus:ring-purple-500/20 transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70"
          />
        </div>

        <div className="flex items-center gap-2 animate-slide-in-right">
          <Filter className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="alphabetic">A-Z</SelectItem>
              <SelectItem value="alphabetic-desc">Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
