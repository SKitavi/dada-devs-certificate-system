'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import { Toaster, toast } from 'react-hot-toast'
import { certificateService } from '../../utils/blockchain'
import {
  generateCertificateId,
  generateSignature,
  generateCertificatePDF,
  storeCertificateHash,
  type CertificateData,
  type CertificateWithSignature,
} from '../../utils/certificateGenerator'

export default function IssuerDashboard() {
  const router = useRouter()
  const [certificateId, setCertificateId] = useState('')
  const [connectedAddress, setConnectedAddress] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewCert, setPreviewCert] = useState<CertificateWithSignature | null>(null)

  const isWaitlisted = true

  useEffect(() => {
    // Connect wallet on mount
    certificateService.connectWallet()
      .then(address => setConnectedAddress(address))
      .catch((error) => toast.error(error.message))
  }, [])

  if (!isWaitlisted) {
    router.push('/')
    return null
  }

  const handleIssueCertificate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      const form = e.currentTarget
      const recipientName = (form.elements.namedItem('recipientName') as HTMLInputElement).value
      const recipientEmail = (form.elements.namedItem('recipientEmail') as HTMLInputElement).value
      const cohort = (form.elements.namedItem('cohort') as HTMLInputElement).value
      const courseTitle = (form.elements.namedItem('courseTitle') as HTMLInputElement).value

      // Generate certificate ID
      const certId = generateCertificateId()

      // Create certificate data
      const certData: CertificateData = {
        certificateId: certId,
        studentName: recipientName,
        cohort: cohort,
        email: recipientEmail,
        issueDate: new Date(),
        issuerName: 'Dada Devs',
        courseTitle: courseTitle || undefined,
      }

      // Generate digital signature
      const signature = generateSignature(certData)

      // Issue certificate on blockchain
      toast.loading('Issuing certificate on blockchain...')
      const blockchainId = await certificateService.issueCertificate(recipientName, connectedAddress)
      
      if (!blockchainId) {
        toast.dismiss()
        toast.error('Failed to issue certificate on blockchain')
        setIsGenerating(false)
        return
      }

      toast.dismiss()
      toast.success('Certificate issued on blockchain!')

      // Create full certificate with signature
      const fullCert: CertificateWithSignature = {
        ...certData,
        digitalSignature: signature,
        qrCodeData: `${window.location.origin}/verify/${certId}`,
        isValid: true,
        blockchainTxHash: blockchainId,
      }

      // Store certificate hash locally
      storeCertificateHash(certId, signature, certData)

      // Set preview
      setPreviewCert(fullCert)

      toast.success(`Certificate generated! ID: ${certId}`)
      form.reset()
    } catch (error: any) {
      console.error('Error issuing certificate:', error)
      toast.error(error.message || 'Failed to issue certificate')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!previewCert) return

    try {
      toast.loading('Generating PDF...')
      const pdfBlob = await generateCertificatePDF(previewCert)
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `DadaDevs_Certificate_${previewCert.studentName.replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.dismiss()
      toast.success('Certificate downloaded!')
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to generate PDF')
      console.error(error)
    }
  }

  const handleVerifyCertificate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const certId = (form.elements.namedItem('certificateId') as HTMLInputElement).value
    const valid = await certificateService.verifyCertificate(certId)
    if (valid === null) {
      toast.error('Error verifying certificate')
    } else {
      toast.success(`Certificate is ${valid ? 'valid' : 'invalid'}`)
    }
  }

  const handleRevokeCertificate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const certId = (form.elements.namedItem('revokeCertificateId') as HTMLInputElement).value
    await certificateService.revokeCertificate(certId)
    toast.success('Certificate revoked successfully!')
  }

  return (
    <div className="min-h-screen bg-dada-white">
      <Navbar isWaitlisted={isWaitlisted} />
      <Toaster position="top-right" />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-dada-orange">Issuer Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Issue Certificate Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-dada-orange">
            <h2 className="text-2xl font-bold mb-4 text-dada-orange">Issue Certificate</h2>
            <form onSubmit={handleIssueCertificate} className="space-y-4">
              <div>
                <label htmlFor="recipientName" className="block mb-1 font-medium text-dada-dark">
                  Student Name *
                </label>
                <input
                  type="text"
                  id="recipientName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-dada-orange focus:ring-1 focus:ring-dada-orange"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="recipientEmail" className="block mb-1 font-medium text-dada-dark">
                  Email *
                </label>
                <input
                  type="email"
                  id="recipientEmail"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-dada-orange focus:ring-1 focus:ring-dada-orange"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="cohort" className="block mb-1 font-medium text-dada-dark">
                  Cohort *
                </label>
                <input
                  type="text"
                  id="cohort"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-dada-orange focus:ring-1 focus:ring-dada-orange"
                  placeholder="Web3 Bootcamp 2024"
                />
              </div>
              <div>
                <label htmlFor="courseTitle" className="block mb-1 font-medium text-dada-dark">
                  Course Title (Optional)
                </label>
                <input
                  type="text"
                  id="courseTitle"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-dada-orange focus:ring-1 focus:ring-dada-orange"
                  placeholder="Blockchain Development Fundamentals"
                />
              </div>
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-dada-orange text-white py-2 rounded hover:bg-dada-orange-light transition-colors disabled:bg-dada-orange-lighter disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Issue Certificate'}
              </button>
            </form>
          </div>

          {/* Certificate Preview */}
          {previewCert && (
            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-dada-orange">
              <h2 className="text-2xl font-bold mb-4 text-dada-orange">Certificate Preview</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-dada-dark">Student:</span>{' '}
                  <span className="text-gray-700">{previewCert.studentName}</span>
                </div>
                <div>
                  <span className="font-semibold text-dada-dark">Cohort:</span>{' '}
                  <span className="text-gray-700">{previewCert.cohort}</span>
                </div>
                <div>
                  <span className="font-semibold text-dada-dark">Email:</span>{' '}
                  <span className="text-gray-700">{previewCert.email}</span>
                </div>
                <div>
                  <span className="font-semibold text-dada-dark">Certificate ID:</span>{' '}
                  <span className="text-gray-700 text-xs break-all">{previewCert.certificateId}</span>
                </div>
                <div>
                  <span className="font-semibold text-dada-dark">Issue Date:</span>{' '}
                  <span className="text-gray-700">{previewCert.issueDate.toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-semibold text-dada-dark">Blockchain TX:</span>{' '}
                  <span className="text-gray-700 text-xs break-all">{previewCert.blockchainTxHash}</span>
                </div>
                <div>
                  <span className="font-semibold text-dada-dark">Digital Signature:</span>{' '}
                  <span className="text-gray-700 text-xs break-all">
                    {previewCert.digitalSignature.substring(0, 40)}...
                  </span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full bg-dada-orange text-white py-2 rounded hover:bg-dada-orange-light transition-colors"
                >
                  Download PDF Certificate
                </button>
                <button
                  onClick={() => setPreviewCert(null)}
                  className="w-full bg-gray-200 text-dada-dark py-2 rounded hover:bg-gray-300 transition-colors"
                >
                  Clear Preview
                </button>
              </div>
            </div>
          )}

          {/* Verify Certificate */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-dada-orange">
            <h2 className="text-2xl font-bold mb-4 text-dada-orange">Verify Certificate</h2>
            <form onSubmit={handleVerifyCertificate} className="space-y-4">
              <div>
                <label htmlFor="certificateId" className="block mb-1 font-medium text-dada-dark">
                  Certificate ID
                </label>
                <input
                  type="text"
                  id="certificateId"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-dada-orange focus:ring-1 focus:ring-dada-orange"
                  placeholder="dd-cert-..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-dada-orange text-white py-2 rounded hover:bg-dada-orange-light transition-colors"
              >
                Verify Certificate
              </button>
            </form>
          </div>

          {/* Revoke Certificate */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-red-500">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Revoke Certificate</h2>
            <form onSubmit={handleRevokeCertificate} className="space-y-4">
              <div>
                <label htmlFor="revokeCertificateId" className="block mb-1 font-medium text-dada-dark">
                  Certificate ID
                </label>
                <input
                  type="text"
                  id="revokeCertificateId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="dd-cert-..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
              >
                Revoke Certificate
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
