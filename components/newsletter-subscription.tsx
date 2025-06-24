"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function NewsletterSubscription() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { toast } = useToast()

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubscribed(true)
        setEmail("")
        toast({
          title: "Successfully subscribed!",
          description: "You'll receive notifications when we publish new articles.",
        })
      } else {
        throw new Error(data.error || "Failed to subscribe")
      }
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <Card
        className="backdrop-blur-sm border-green-200/50 dark:border-green-700/50"
        style={{
          background:
            "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 50%, rgba(4, 120, 87, 0.1) 100%)",
        }}
      >
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center space-y-2">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto" />
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">You're subscribed!</h3>
            <p className="text-sm text-green-600 dark:text-green-300">
              We'll notify you when new articles are published.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:border-purple-300/50 dark:hover:border-purple-500/30 transition-all duration-300 hover:scale-105"
      style={{
        background:
          "linear-gradient(135deg, rgba(148, 163, 184, 0.1) 0%, rgba(139, 92, 246, 0.15) 50%, rgba(59, 130, 246, 0.1) 100%)",
      }}
    >
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-full border border-purple-200/30 dark:border-purple-500/30">
            <Mail className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <CardTitle className="text-xl bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
          Stay Updated
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Get notified when we publish new articles and insights.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubscribe} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-purple-400/50 dark:focus:border-purple-500/50 focus:ring-purple-400/20 dark:focus:ring-purple-500/20"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 transition-all duration-300 hover:scale-105"
            >
              {isLoading ? "Subscribing..." : "Subscribe"}
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">No spam, unsubscribe at any time.</p>
        </form>
      </CardContent>
    </Card>
  )
}
