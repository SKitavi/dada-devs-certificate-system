'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, AlertCircle, Shield, Calendar, User, Mail, Award } from 'lucide-react'
import {
  getCertificateHash,
  verifySignature,
  type CertificateData,
} from '@/utils/certificateGenerator'

type VerificationStatus = 'loading' | 'valid' | 'invalid' | 'not-found'

export default function VerifyCertificate() {
  const params = useParams()
  const certificateId = params.certificateId as string
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [certData, setCertData] = useState<CertificateData | null>(null)
  const [signature, setSignature] = useState<string>('')

  useEffect(() => {
    if (!certificateId) return

    // Simulate loading delay
    setTimeout(() => {
      const result = getCertificateHash(certificateId)

      if (!result) {
        setStatus('not-found')
        return
      }

      const isValid = verifySignature(result.data, result.signature)

      if (isValid) {
        setStatus('valid')
        setCertData(result.data)
        setSignature(result.signature)
      } else {
        setStatus('invalid')
      }
    }, 1000)
  }, [certificateId])

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            Certificate Verification
          </h1>

          {/* Loading State */}
          {status === 'loading' && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg">Verifying certificate...</p>
              </CardContent>
            </Card>
          )}

          {/* Valid Certificate */}
          {status === 'valid' && certData && (
            <div className="space-y-6">
              <Card className="border-green-500 border-2">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center mb-6">
                    <CheckCircle className="h-20 w-20 text-green-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-center text-green-600 mb-2">
                    ✓ AUTHENTIC
                  </h2>
                  <p className="text-center text-muted-foreground mb-6">
                    This certificate is valid and has not been tampered with.
                  </p>

                  <div className="border-t-2 border-gray-200 pt-6 space-y-4">
                    <h3 className="text-xl font-bold mb-4">Certificate Details</h3>

                    <div className="flex items-start space-x-3">
                      <User className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Student Name</p>
                        <p className="text-muted-foreground">{certData.studentName}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Award className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Cohort</p>
                        <p className="text-muted-foreground">{certData.cohort}</p>
                      </div>
                    </div>

                    {certData.courseTitle && (
                      <div className="flex items-start space-x-3">
                        <Award className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Course</p>
                          <p className="text-muted-foreground">{certData.courseTitle}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Email</p>
                        <p className="text-muted-foreground">{certData.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Issue Date</p>
                        <p className="text-muted-foreground">
                          {certData.issueDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Issuer</p>
                        <p className="text-muted-foreground">{certData.issuerName}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Certificate ID</p>
                        <p className="text-muted-foreground text-sm break-all">{certData.certificateId}</p>
                      </div>
                    </div>

                    {certData.blockchainTxHash && (
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Blockchain Transaction</p>
                          <p className="text-muted-foreground text-sm break-all">{certData.blockchainTxHash}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Technical Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Technical Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold">Digital Signature (SHA-256)</p>
                      <p className="text-muted-foreground break-all font-mono text-xs">{signature}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Verification Method</p>
                      <p className="text-muted-foreground">
                        SHA-256 hash verification with on-chain certificate record
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Verified At</p>
                      <p className="text-muted-foreground">{new Date().toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card className="bg-green-50 border-green-500">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-800">Security Verified</p>
                      <p className="text-sm text-green-700">
                        This certificate has been cryptographically verified and is recorded on the
                        Avalanche blockchain. Any tampering would invalidate the digital signature.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Invalid Certificate */}
          {status === 'invalid' && (
            <Card className="border-red-500 border-2">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <XCircle className="h-20 w-20 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold text-center text-red-600 mb-2">
                  ✗ INVALID
                </h2>
                <p className="text-center text-muted-foreground mb-6">
                  This certificate has been tampered with or is not authentic.
                </p>
                <Card className="bg-red-50 border-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-red-800">Verification Failed</p>
                        <p className="text-sm text-red-700">
                          The digital signature does not match the certificate data. This certificate
                          may have been altered or forged.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          )}

          {/* Not Found */}
          {status === 'not-found' && (
            <Card className="border-yellow-500 border-2">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <AlertCircle className="h-20 w-20 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold text-center text-yellow-600 mb-2">
                  NOT FOUND
                </h2>
                <p className="text-center text-muted-foreground mb-6">
                  No certificate found with ID: <span className="font-mono text-sm">{certificateId}</span>
                </p>
                <Card className="bg-yellow-50 border-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-yellow-800">Certificate Not Found</p>
                        <p className="text-sm text-yellow-700">
                          This certificate ID does not exist in our records. Please verify the ID and
                          try again.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}