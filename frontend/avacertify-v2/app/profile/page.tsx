"use client"

import { useState, useEffect } from 'react'
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { User, Mail, Building, Award, Calendar, Download, Share2, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import Link from "next/link"

interface Certificate {
  id: number
  name: string
  issuer: string
  date: string
  verified: boolean
}

const certificates: Certificate[] = [
  {
    id: 1,
    name: "Bachelor of Computer Science",
    issuer: "Tech University",
    date: "2023-06-15",
    verified: true,
  },
  {
    id: 2,
    name: "Advanced Web Development",
    issuer: "Code Academy",
    date: "2023-08-01",
    verified: true,
  },
]

export default function ProfilePage() {
  const { toast } = useToast()
  const { user, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateProfile(formData)
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    toast({
      title: "Certificate Shared",
      description: "Share link copied to clipboard!",
    });
  };

  if (!user) {
    return null // ProtectedRoute will handle redirect
  }

  return (
    <ProtectedRoute requireAuth>
      <Layout>
        <div className="container py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Profile</h1>
              <div className="flex items-center gap-2">
                {user.emailVerified ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Email Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-yellow-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Email Not Verified
                  </span>
                )}
              </div>
            </div>

            {/* Profile Completion Notice */}
            {!user.profileCompleted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Complete Your Profile</h3>
                    <p className="text-sm text-yellow-700">
                      Please complete your profile information to access all features.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CTA for completed profiles */}
            {user.profileCompleted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="font-medium text-green-800">Profile Complete!</h3>
                      <p className="text-sm text-green-700">
                        You can now verify certificates and access all features.
                      </p>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href="/verify">
                      Verify Certificates
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )}

            <Tabs defaultValue="info" className="space-y-6">
              <TabsList>
                <TabsTrigger value="info">Personal Info</TabsTrigger>
                <TabsTrigger value="certificates">Certificates</TabsTrigger>
                {user.institutionId && (
                  <TabsTrigger value="institution">Institution</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        First Name
                      </label>
                      <Input
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Last Name
                      </label>
                      <Input
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </label>
                      <Input
                        type="email"
                        value={user.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Role
                      </label>
                      <Input
                        value={user.role}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    {user.institution && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Institution
                        </label>
                        <Input
                          value={user.institution.name}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    )}

                    <Button onClick={handleSave} disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="certificates">
                <div className="grid gap-6">
                  {certificates.map((cert) => (
                    <motion.div
                      key={cert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold flex items-center gap-2">
                                <Award className="h-5 w-5 text-primary" />
                                {cert.name}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                {cert.issuer}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {cert.date}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              <Button variant="outline" size="sm" onClick={handleShare}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {user.institutionId && (
                <TabsContent value="institution">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Institution Details</span>
                        <Button asChild variant="outline">
                          <Link href="/institution-profile">
                            Manage Institution
                          </Link>
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user.institution ? (
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium">{user.institution.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Code: {user.institution.slug}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            You are associated with this institution as a {user.role.toLowerCase()}.
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          Loading institution details...
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </motion.div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}