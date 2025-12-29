"use client"

import { useState, useEffect } from 'react'
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  FileText, 
  Users, 
  Shield,
  Upload,
  Trash2,
  Plus
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { institutionAPI } from "@/utils/api"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Institution {
  id: string
  slug: string
  name: string
  registrationNumber?: string
  accreditationStatus?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  contactPersonName?: string
  contactPersonRole?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  logoUrl?: string
  verificationStatus: string
  users?: Array<{
    id: string
    email: string
    firstName?: string
    lastName?: string
    role: string
    createdAt: string
  }>
  documents?: Array<{
    id: string
    name: string
    type: string
    url: string
    uploadedAt: string
  }>
}

export default function InstitutionProfilePage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Institution>>({})

  useEffect(() => {
    if (user?.institutionId) {
      fetchInstitution()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchInstitution = async () => {
    try {
      if (!user?.institutionId) return
      
      const response = await institutionAPI.getById(user.institutionId)
      const institutionData = response.data.institution
      setInstitution(institutionData)
      setFormData(institutionData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load institution",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!institution?.id) return
    
    setSaving(true)
    try {
      await institutionAPI.update(institution.id, formData)
      setInstitution(prev => prev ? { ...prev, ...formData } : null)
      toast({
        title: "Success",
        description: "Institution profile updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update institution",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAddDocument = async () => {
    // This would typically open a file upload dialog
    toast({
      title: "Feature Coming Soon",
      description: "Document upload functionality will be available soon",
    })
  }

  const handleRemoveDocument = async (documentId: string) => {
    if (!institution?.id) return
    
    try {
      await institutionAPI.removeDocument(institution.id, documentId)
      setInstitution(prev => prev ? {
        ...prev,
        documents: prev.documents?.filter(doc => doc.id !== documentId)
      } : null)
      toast({
        title: "Success",
        description: "Document removed successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to remove document",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  if (!user?.institutionId) {
    return (
      <Layout>
        <div className="container py-10">
          <Card>
            <CardContent className="p-6 text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Institution Associated</h2>
              <p className="text-muted-foreground">
                You are not currently associated with any institution. Contact an administrator to be added to an institution.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <ProtectedRoute requireAuth>
      <Layout>
        <div className="container py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Institution Profile</h1>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  institution?.verificationStatus === 'verified' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {institution?.verificationStatus || 'pending'}
                </span>
              </div>
            </div>

            <Tabs defaultValue="info" className="space-y-6">
              <TabsList>
                <TabsTrigger value="info">Institution Info</TabsTrigger>
                <TabsTrigger value="contact">Contact Details</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>

              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Institution Name</label>
                        <Input
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Institution Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Slug/Code</label>
                        <Input
                          value={formData.slug || ''}
                          onChange={(e) => handleInputChange('slug', e.target.value)}
                          placeholder="institution-code"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Registration Number</label>
                        <Input
                          value={formData.registrationNumber || ''}
                          onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                          placeholder="REG-12345"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Accreditation Status</label>
                        <Select
                          value={formData.accreditationStatus || ''}
                          onValueChange={(value) => handleInputChange('accreditationStatus', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accredited">Accredited</SelectItem>
                            <SelectItem value="not_accredited">Not Accredited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Website</label>
                      <Input
                        type="url"
                        value={formData.website || ''}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://institution.edu"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Logo URL</label>
                      <Input
                        type="url"
                        value={formData.logoUrl || ''}
                        onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>

                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Contact & Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Address Line 1</label>
                      <Input
                        value={formData.addressLine1 || ''}
                        onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Address Line 2</label>
                      <Input
                        value={formData.addressLine2 || ''}
                        onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                        placeholder="Suite 100"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">City</label>
                        <Input
                          value={formData.city || ''}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="Lagos"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">State</label>
                        <Input
                          value={formData.state || ''}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          placeholder="Lagos"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Country</label>
                        <Input
                          value={formData.country || ''}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          placeholder="Nigeria"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Postal Code</label>
                      <Input
                        value={formData.postalCode || ''}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        placeholder="100001"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Contact Person Name</label>
                        <Input
                          value={formData.contactPersonName || ''}
                          onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Contact Person Role</label>
                        <Input
                          value={formData.contactPersonRole || ''}
                          onChange={(e) => handleInputChange('contactPersonRole', e.target.value)}
                          placeholder="Director"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Contact Email
                        </label>
                        <Input
                          type="email"
                          value={formData.contactEmail || ''}
                          onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                          placeholder="contact@institution.edu"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Contact Phone
                        </label>
                        <Input
                          type="tel"
                          value={formData.contactPhone || ''}
                          onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                          placeholder="+234-800-123-4567"
                        />
                      </div>
                    </div>

                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Documents
                      </div>
                      <Button onClick={handleAddDocument} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Document
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {institution?.documents && institution.documents.length > 0 ? (
                      <div className="space-y-4">
                        {institution.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{doc.name}</h4>
                              <p className="text-sm text-muted-foreground">{doc.type}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                  View
                                </a>
                              </Button>
                              {user?.role === 'ADMIN' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveDocument(doc.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No documents uploaded yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Institution Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {institution?.users && institution.users.length > 0 ? (
                      <div className="space-y-4">
                        {institution.users.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName}`
                                  : user.email
                                }
                              </h4>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <p className="text-xs text-muted-foreground">
                                Joined: {new Date(user.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No users found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}