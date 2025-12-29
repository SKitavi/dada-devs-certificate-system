"use client"

import { Layout } from "@/components/layout"
import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <Layout>
      <div className="container py-20">
        <div className="max-w-md mx-auto">
          <LoginForm />
        </div>
      </div>
    </Layout>
  )
}