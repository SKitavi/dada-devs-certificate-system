"use client"

import { Layout } from "@/components/layout"
import { SignupForm } from "@/components/auth/SignupForm"

export default function SignupPage() {
  return (
    <Layout>
      <div className="container py-20">
        <div className="max-w-md mx-auto">
          <SignupForm />
        </div>
      </div>
    </Layout>
  )
}