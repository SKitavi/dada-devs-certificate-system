"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Shield, Eye, CheckCircle, Clock, FileX, UserPlus, LogIn } from "lucide-react"
import Link from "next/link"
import type { ComponentProps } from "@/types/custom"
import { useAuth } from "@/hooks/useAuth"
import { motion } from "framer-motion"

const FeatureCard = ({ icon: Icon, title, description }: ComponentProps) => (
  <Card className="group hover:shadow-lg transition-all duration-300 dark:hover:shadow-primary/5">
    <CardContent className="p-6 text-center">
      <Icon className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto" />
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
)

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'ADMIN') {
        router.replace('/admin')
      } else {
        router.replace('/profile')
      }
    }
  }, [user, loading, router])

  // Show loading or redirect for authenticated users
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  // If user is authenticated, show redirecting message
  if (user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-lg font-medium text-primary">
              Redirecting to {user.role === 'ADMIN' ? 'Admin Dashboard' : 'Profile'}...
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  // Show home page only for guests
  return (
    <Layout>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/5 py-20 sm:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        </div>
        <div className="container relative z-10 mx-auto text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              <span className="text-dada-orange">Dada Devs</span> Digital Certificates
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Secure, blockchain-verified digital credentials for African female Bitcoin developers
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/signup">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Sign Up
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-primary"
                >
                  <Link href="/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    Log In
                  </Link>
                </Button>
              </motion.div>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full"
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20"
            >
              <p className="text-sm text-muted-foreground">
                Join Africa's first pipeline of female Bitcoin developers and earn verified credentials
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 bg-gradient-to-r from-dada-orange to-yellow-500 bg-clip-text text-transparent">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={Shield}
              title="Unique Certificate IDs"
              description="Every certificate gets a unique ID (dd-cert-xxxxx) that cannot be duplicated or forged."
            />
            <FeatureCard
              icon={Eye}
              title="SHA-256 Digital Signatures"
              description="Tamper-proof cryptographic signatures ensure certificate authenticity and detect any modifications."
            />
            <FeatureCard
              icon={CheckCircle}
              title="QR Code Verification"
              description="Instant verification via QR codes that link to our verification system - scan and verify immediately."
            />
          </div>
        </div>
      </section>

      <section id="problem" className="py-20 bg-gradient-to-br from-primary/10 to-secondary/5">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-white">The Problem We Solve</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div>
              <Card className="group hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800">
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto" />
                  <h3 className="text-xl font-bold mb-2">Time-Consuming Verification</h3>
                  <p className="text-muted-foreground">Manual verification processes are slow and inefficient.</p>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="group hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800">
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto" />
                  <h3 className="text-xl font-bold mb-2">Lack of Trust</h3>
                  <p className="text-muted-foreground">Centralized systems are vulnerable to fraud and manipulation.</p>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="group hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800">
                <CardContent className="p-6 text-center">
                  <FileX className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto" />
                  <h3 className="text-xl font-bold mb-2">Counterfeit Certificates</h3>
                  <p className="text-muted-foreground">
                    Fraudulent certificates undermine the value of genuine credentials.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="py-20 bg-gradient-to-br from-primary/10 to-secondary/5">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl text-dada-orange font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join Africa's first pipeline of female Bitcoin developers and earn verified credentials.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button asChild size="lg" className="rounded-full group">
                <Link href="/signup">
                  Get Started
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing section inserted so footer /pricing anchor has a target */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-dada-orange">Pricing</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Dada Devs certificate platform is currently in development. For partnership opportunities and program enrollment, contact us via the Connect section.
          </p>
        </div>
      </section>
    </Layout>
  )
}