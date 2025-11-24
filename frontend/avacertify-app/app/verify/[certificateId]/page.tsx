'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '../../../components/Navbar'
import { CheckCircle, XCircle, AlertCircle, Shield, Calendar, User, Mail, Award } from 'lucide-react'
import {
  getCertificateHash,
  verifySignature,
  type CertificateData,
} from '../../../utils/certificateGenerator'

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
    <div className="min-h-screen bg-dada-white">
      <Navbar isWaitlisted={true} />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-dada-orange">
            Certificate Verification
          </h1>

          {/* Loading State */}
          {status === 'loading' && (
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-dada-orange text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-dada-orange mx-auto mb-4"></div>
              <p className="text-lg text-dada-dark">Verifying certificate...</p>
            </div>
          )}

          {/* Valid Certificate */}
          {status === 'valid' && certData && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-green-500">
                <div className="flex items-center justify-center mb-6">
                  <CheckCircle className="h-20 w-20 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-center text-green-600 mb-2">
                  ✓ AUTHENTIC
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  This certificate is valid and has not been tampered with.
                </p>

                <div className="border-t-2 border-gray-200 pt-6 space-y-4">
                  <h3 className="text-xl font-bold text-dada-orange mb-4">Certificate Details</h3>

                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-dada-orange mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-dada-dark">Student Name</p>
                      <p className="text-gray-700">{certData.studentName}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Award className="h-5 w-5 text-dada-orange mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-dada-dark">Cohort</p>
                      <p className="text-gray-700">{certData.cohort}</p>
                    </div>
                  </div>

                  {certData.courseTitle && (
                    <div className="flex items-start space-x-3">
                      <Award className="h-5 w-5 text-dada-orange mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-dada-dark">Course</p>
                        <p className="text-gray-700">{certData.courseTitle}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-dada-orange mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-dada-dark">Email</p>
                      <p className="text-gray-700">{certData.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-dada-orange mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-dada-dark">Issue Date</p>
                      <p className="text-gray-700">
                        {certData.issueDate.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-dada-orange mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-dada-dark">Issuer</p>
                      <p className="text-gray-700">{certData.issuerName}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-dada-orange mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-dada-dark">Certificate ID</p>
                      <p className="text-gray-700 text-sm break-all">{certData.certificateId}</p>
                    </div>
                  </div>

                  {certData.blockchainTxHash && (
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-dada-orange mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-dada-dark">Blockchain Transaction</p>
                        <p className="text-gray-700 text-sm break-all">{certData.blockchainTxHash}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Details */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-dada-orange">
                <h3 className="text-lg font-bold text-dada-orange mb-4">Technical Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-dada-dark">Digital Signature (SHA-256)</p>
                    <p className="text-gray-600 break-all font-mono text-xs">{signature}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-dada-dark">Verification Method</p>
                    <p className="text-gray-600">
                      SHA-256 hash verification with on-chain certificate record
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-dada-dark">Verified At</p>
                    <p className="text-gray-600">{new Date().toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
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
              </div>
            </div>
          )}

          {/* Invalid Certificate */}
          {status === 'invalid' && (
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-red-500">
              <div className="flex items-center justify-center mb-6">
                <XCircle className="h-20 w-20 text-red-500" />
              </div>
              <h2 className="text-3xl font-bold text-center text-red-600 mb-2">
                ✗ INVALID
              </h2>
              <p className="text-center text-gray-600 mb-6">
                This certificate has been tampered with or is not authentic.
              </p>
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
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
              </div>
            </div>
          )}

          {/* Not Found */}
          {status === 'not-found' && (
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-yellow-500">
              <div className="flex items-center justify-center mb-6">
                <AlertCircle className="h-20 w-20 text-yellow-500" />
              </div>
              <h2 className="text-3xl font-bold text-center text-yellow-600 mb-2">
                NOT FOUND
              </h2>
              <p className="text-center text-gray-600 mb-6">
                No certificate found with ID: <span className="font-mono text-sm">{certificateId}</span>
              </p>
              <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4">
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
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
