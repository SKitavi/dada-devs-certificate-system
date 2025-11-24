"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, CheckCircle, Download } from "lucide-react";
import { certificateService, Certificate } from "@/utils/blockchain";
import { IPFSService } from "@/utils/ipfsService";
import { CERTIFICATE_SYSTEM_ADDRESS, NFT_CERTIFICATE_ADDRESS, AVALANCHE_FUJI_CONFIG } from "@/utils/contractConfig";
import { ethers } from "ethers";
import {
  generateCertificateId,
  generateSignature,
  generateCertificatePDF,
  storeCertificateHash,
  type CertificateData,
  type CertificateWithSignature,
} from "@/utils/certificateGenerator";

interface UploadState {
    isUploading: boolean;
    documentHash: string;
    metadataHash: string;
    documentUrl: string;
}

interface WalletState {
    address: string | null;
    isConnecting: boolean;
    isConnected: boolean;
}

export default function AdminPage() {
    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        documentHash: "",
        metadataHash: "",
        documentUrl: "",
    });
    const [isIssuing, setIsIssuing] = useState(false);
    const [isNFT, setIsNFT] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [walletState, setWalletState] = useState<WalletState>({
        address: null,
        isConnecting: false,
        isConnected: false,
    });
    const [formData, setFormData] = useState({
        recipientAddress: "",
        recipientName: "",
        cohort: "",
        email: "",
        certificateType: "",
        courseTitle: "",
        issueDate: "",
        institutionName: "Dada Devs",
        logoUrl: "",
        brandColor: "#FF6B35",
    });
    const [previewCert, setPreviewCert] = useState<CertificateWithSignature | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [bulkData, setBulkData] = useState("");
    const [isBulkGenerating, setIsBulkGenerating] = useState(false);
    const [bulkResults, setBulkResults] = useState<CertificateWithSignature[]>([]);
    const { toast } = useToast();
    const [ipfsService] = useState(() => {
        try {
            return new IPFSService();
        } catch (error) {
            console.warn("IPFS service not available:", error);
            return null;
        }
    });

    useEffect(() => {
        const checkExistingConnection = async () => {
            try {
                await certificateService.init();
                const address = await certificateService.getConnectedAddress();
                if (address) {
                    await checkNetwork();
                    setWalletState({
                        address,
                        isConnecting: false,
                        isConnected: true,
                    });
                    const registered = await certificateService.isOrganizationRegistered();
                    setIsRegistered(registered);
                    toast({
                        title: "Connected",
                        description: `Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
                    });
                }
            } catch (error) {
                console.error("Init error:", error);
                toast({
                    title: "Initialization Error",
                    description: error instanceof Error ? error.message : "Failed to initialize blockchain service",
                    variant: "destructive",
                });
            }
        };

        checkExistingConnection();
    }, []);

    const checkNetwork = async () => {
        const network = await certificateService.getNetwork();
        if (!network || network.chainId !== BigInt(parseInt(AVALANCHE_FUJI_CONFIG.chainId, 16))) {
            throw new Error("Please connect to Avalanche Fuji Testnet");
        }
    };

    const connectWallet = async () => {
        if (walletState.isConnecting) {
            toast({
                title: "Connection In Progress",
                description: "Please wait for the current connection attempt to complete",
                variant: "destructive",
            });
            return;
        }

        setWalletState((prev) => ({ ...prev, isConnecting: true }));

        try {
            const address = await certificateService.connectWallet();
            await checkNetwork();
            setWalletState({
                address,
                isConnecting: false,
                isConnected: true,
            });
            const registered = await certificateService.isOrganizationRegistered();
            setIsRegistered(registered);
            toast({
                title: "Wallet Connected",
                description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
            });
        } catch (error: any) {
            setWalletState((prev) => ({
                ...prev,
                isConnecting: false,
                isConnected: false,
            }));
            toast({
                title: "Connection Failed",
                description: error.message || "Failed to connect wallet",
                variant: "destructive",
            });
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            toast({
                title: "Invalid File Type",
                description: "Please upload a PDF or image file (JPG, PNG)",
                variant: "destructive",
            });
            return;
        }

        if (file.size > maxSize) {
            toast({
                title: "File Too Large",
                description: "File size must be less than 5MB",
                variant: "destructive",
            });
            return;
        }

        setUploadState((prev) => ({ ...prev, isUploading: true }));

        if (!ipfsService) {
            toast({
                title: "IPFS Not Available",
                description: "IPFS service is not configured. File upload is disabled.",
                variant: "destructive",
            });
            setUploadState((prev) => ({ ...prev, isUploading: false }));
            return;
        }

        try {
            const documentHash = await ipfsService.uploadFile(file);
            const documentUrl = ipfsService.getGatewayUrl(documentHash);
            const metadata = ipfsService.generateMetadata(
                formData.certificateType || "Certificate",
                "Certificate issued by Dada Devs",
                documentHash,
                formData.brandColor,
                formData.institutionName
            );
            const metadataHash = await ipfsService.uploadJSON(metadata);

            setUploadState((prev) => ({
                ...prev,
                isUploading: false,
                documentHash,
                metadataHash,
                documentUrl,
            }));

            toast({
                title: "File Uploaded",
                description: "Document and metadata successfully uploaded to IPFS",
            });
        } catch (error: any) {
            setUploadState((prev) => ({ ...prev, isUploading: false }));
            toast({
                title: "Upload Failed",
                description: error.message || "Failed to upload file to IPFS",
                variant: "destructive",
            });
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleRegisterOrganization = async () => {
        if (!formData.logoUrl || !formData.brandColor) {
            toast({
                title: "Missing Information",
                description: "Please provide logo URL and brand color",
                variant: "destructive",
            });
            return;
        }

        try {
            await certificateService.registerOrganization(formData.logoUrl, formData.brandColor);
            setIsRegistered(true);
            toast({
                title: "Organization Registered",
                description: "Successfully registered organization for NFT certificates",
            });
        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.message || "Failed to register organization",
                variant: "destructive",
            });
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsGenerating(true);

        try {
            if (!walletState.isConnected) {
                toast({
                    title: "Wallet Not Connected",
                    description: "Please connect your wallet before issuing a certificate",
                    variant: "destructive",
                });
                return;
            }

            if (!formData.recipientName || !formData.cohort || !formData.email) {
                toast({
                    title: "Missing Information",
                    description: "Please fill in all required fields",
                    variant: "destructive",
                });
                return;
            }

            // Generate certificate ID
            const certId = generateCertificateId();

            // Create certificate data
            const certData: CertificateData = {
                certificateId: certId,
                studentName: formData.recipientName,
                cohort: formData.cohort,
                email: formData.email,
                issueDate: new Date(),
                issuerName: 'Dada Devs',
                courseTitle: formData.courseTitle || undefined,
            };

            // Generate digital signature
            const signature = generateSignature(certData);

            // Issue certificate on blockchain
            toast({
                title: "Transaction Pending",
                description: "Please confirm the transaction in your wallet",
            });

            const blockchainId = await certificateService.issueCertificate(
                formData.recipientName, 
                formData.recipientAddress || walletState.address || ""
            );
            
            if (!blockchainId) {
                throw new Error("Failed to issue certificate on blockchain");
            }

            toast({
                title: "Certificate Issued",
                description: "Certificate issued on blockchain successfully!",
            });

            // Create full certificate with signature
            const fullCert: CertificateWithSignature = {
                ...certData,
                digitalSignature: signature,
                qrCodeData: `${window.location.origin}/verify/certificate?id=${certId}`,
                isValid: true,
                blockchainTxHash: blockchainId,
            };

            // Store certificate hash locally
            storeCertificateHash(certId, signature, certData);

            // Set preview
            setPreviewCert(fullCert);

            toast({
                title: "Certificate Generated",
                description: `Certificate ${certId} generated successfully!`,
            });

            // Reset form
            setFormData({
                recipientAddress: "",
                recipientName: "",
                cohort: "",
                email: "",
                certificateType: "",
                courseTitle: "",
                issueDate: "",
                institutionName: "Dada Devs",
                logoUrl: "",
                brandColor: "#FF6B35",
            });
        } catch (error: any) {
            let message = "Failed to issue certificate";
            if (error.code === "ACTION_REJECTED" || error.code === 4001) {
                message = "User rejected the transaction";
            } else if (error.message?.includes("insufficient funds")) {
                message = "Insufficient AVAX for gas fees. Get test AVAX from faucet.";
            } else if (error.message?.includes("network")) {
                message = "Please ensure you're connected to the Avalanche Fuji Testnet";
            }
            toast({
                title: "Error",
                description: error.message || message,
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!previewCert) return;

        try {
            toast({
                title: "Generating PDF",
                description: "Creating certificate PDF...",
            });
            
            const pdfBlob = await generateCertificatePDF(previewCert);
            
            // Create download link
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `DadaDevs_Certificate_${previewCert.studentName.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast({
                title: "PDF Downloaded",
                description: "Certificate PDF downloaded successfully!",
            });
        } catch (error) {
            toast({
                title: "Download Failed",
                description: "Failed to generate PDF certificate",
                variant: "destructive",
            });
            console.error(error);
        }
    };

    const handleBulkGeneration = async () => {
        if (!bulkData.trim()) {
            toast({
                title: "No Data",
                description: "Please enter student data for bulk generation",
                variant: "destructive",
            });
            return;
        }

        if (!walletState.isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet before bulk generating certificates",
                variant: "destructive",
            });
            return;
        }

        setIsBulkGenerating(true);
        const results: CertificateWithSignature[] = [];

        try {
            const lines = bulkData.trim().split('\n');
            const students = lines.map(line => {
                const [name, email, cohort, courseTitle] = line.split(',').map(s => s.trim());
                return { name, email, cohort, courseTitle };
            }).filter(student => student.name && student.email && student.cohort);

            if (students.length === 0) {
                throw new Error("No valid student data found. Please check the format.");
            }

            toast({
                title: "Bulk Generation Started",
                description: `Processing ${students.length} certificates...`,
            });

            for (let i = 0; i < students.length; i++) {
                const student = students[i];
                
                try {
                    // Generate certificate ID
                    const certId = generateCertificateId();

                    // Create certificate data
                    const certData: CertificateData = {
                        certificateId: certId,
                        studentName: student.name,
                        cohort: student.cohort,
                        email: student.email,
                        issueDate: new Date(),
                        issuerName: 'Dada Devs',
                        courseTitle: student.courseTitle || undefined,
                    };

                    // Generate digital signature
                    const signature = generateSignature(certData);

                    // Issue certificate on blockchain
                    const blockchainId = await certificateService.issueCertificate(
                        student.name, 
                        walletState.address || ""
                    );
                    
                    if (!blockchainId) {
                        throw new Error(`Failed to issue certificate for ${student.name}`);
                    }

                    // Create full certificate with signature
                    const fullCert: CertificateWithSignature = {
                        ...certData,
                        digitalSignature: signature,
                        qrCodeData: `${window.location.origin}/verify/certificate?id=${certId}`,
                        isValid: true,
                        blockchainTxHash: blockchainId,
                    };

                    // Store certificate hash locally
                    storeCertificateHash(certId, signature, certData);
                    results.push(fullCert);

                    toast({
                        title: `Progress: ${i + 1}/${students.length}`,
                        description: `Certificate generated for ${student.name}`,
                    });

                } catch (error: any) {
                    console.error(`Failed to generate certificate for ${student.name}:`, error);
                    toast({
                        title: `Failed: ${student.name}`,
                        description: error.message || "Certificate generation failed",
                        variant: "destructive",
                    });
                }
            }

            setBulkResults(results);
            toast({
                title: "Bulk Generation Complete",
                description: `Successfully generated ${results.length} out of ${students.length} certificates`,
            });

        } catch (error: any) {
            toast({
                title: "Bulk Generation Failed",
                description: error.message || "Failed to process bulk certificates",
                variant: "destructive",
            });
        } finally {
            setIsBulkGenerating(false);
        }
    };

    const downloadAllPDFs = async () => {
        if (bulkResults.length === 0) return;

        toast({
            title: "Generating PDFs",
            description: `Creating ${bulkResults.length} PDF certificates...`,
        });

        for (const cert of bulkResults) {
            try {
                const pdfBlob = await generateCertificatePDF(cert);
                const url = URL.createObjectURL(pdfBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `DadaDevs_Certificate_${cert.studentName.replace(/\s+/g, '_')}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                // Small delay to prevent browser blocking
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Failed to generate PDF for ${cert.studentName}:`, error);
            }
        }

        toast({
            title: "PDFs Downloaded",
            description: "All certificate PDFs have been downloaded!",
        });
    };

    return (
        <Layout>
            <div className="container py-10">
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

                <div className="space-y-6 max-w-2xl mx-auto">
                    {!walletState.isConnected && (
                        <Button onClick={connectWallet} disabled={walletState.isConnecting} className="w-full">
                            {walletState.isConnecting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                "Connect Wallet"
                            )}
                        </Button>
                    )}

                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-2">Contract Information</h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p>Certificate System: {CERTIFICATE_SYSTEM_ADDRESS.slice(0, 6)}...{CERTIFICATE_SYSTEM_ADDRESS.slice(-4)}</p>
                                <p>NFT Certificate: {NFT_CERTIFICATE_ADDRESS.slice(0, 6)}...{NFT_CERTIFICATE_ADDRESS.slice(-4)}</p>
                                <p className="text-xs mt-2">Network: Avalanche Fuji Testnet (Chain ID: 43113)</p>
                            </div>
                        </CardContent>
                    </Card>

                    {isNFT && !isRegistered && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Register Organization for NFT Certificates</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="logoUrl">Logo URL *</Label>
                                        <Input
                                            id="logoUrl"
                                            value={formData.logoUrl}
                                            onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                                            placeholder="https://example.com/logo.png"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="brandColor">Brand Color *</Label>
                                        <Input
                                            id="brandColor"
                                            type="color"
                                            value={formData.brandColor}
                                            onChange={(e) => handleInputChange("brandColor", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button onClick={handleRegisterOrganization} className="w-full">
                                        Register Organization
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>🎓 Issue Dada Devs Certificate</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Simple form to generate tamper-proof certificates with QR codes
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="recipientName">Student Name *</Label>
                                    <Input
                                        id="recipientName"
                                        value={formData.recipientName}
                                        onChange={(e) => handleInputChange("recipientName", e.target.value)}
                                        placeholder="e.g., Jane Doe"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        placeholder="e.g., jane@example.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cohort">Cohort *</Label>
                                    <Input
                                        id="cohort"
                                        value={formData.cohort}
                                        onChange={(e) => handleInputChange("cohort", e.target.value)}
                                        placeholder="e.g., Bitcoin Development Bootcamp 2024"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="courseTitle">Course Title (Optional)</Label>
                                    <Input
                                        id="courseTitle"
                                        value={formData.courseTitle}
                                        onChange={(e) => handleInputChange("courseTitle", e.target.value)}
                                        placeholder="e.g., Bitcoin Core Development"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="recipientAddress">Recipient Wallet Address (Optional)</Label>
                                    <Input
                                        id="recipientAddress"
                                        value={formData.recipientAddress}
                                        onChange={(e) => handleInputChange("recipientAddress", e.target.value)}
                                        placeholder="0x... (defaults to connected wallet if empty)"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Leave empty to use your connected wallet address
                                    </p>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-blue-800 mb-2">What happens when you click "Issue Certificate":</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>✅ Unique certificate ID generated (dd-cert-xxxxx)</li>
                                        <li>✅ SHA-256 digital signature created</li>
                                        <li>✅ Certificate recorded on Avalanche blockchain</li>
                                        <li>✅ QR code generated for verification</li>
                                        <li>✅ PDF certificate with embedded signature created</li>
                                    </ul>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isGenerating || !walletState.isConnected || walletState.isConnecting}
                                    className="w-full bg-dada-orange hover:bg-dada-orange-light"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating Certificate...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Issue Certificate
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Certificate Preview */}
                    {previewCert && (
                        <Card className="border-green-500 border-2">
                            <CardHeader>
                                <CardTitle className="text-green-700">✅ Certificate Successfully Generated!</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    All MVP requirements have been fulfilled for this certificate
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* MVP Requirements Checklist */}
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <h4 className="font-semibold text-green-800 mb-3">MVP Requirements ✅</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center text-green-700">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Unique Certificate ID
                                            </div>
                                            <div className="flex items-center text-green-700">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                SHA-256 Digital Signature
                                            </div>
                                            <div className="flex items-center text-green-700">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Signature Attached to PDF
                                            </div>
                                            <div className="flex items-center text-green-700">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                QR Code for Verification
                                            </div>
                                            <div className="flex items-center text-green-700">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Blockchain Record
                                            </div>
                                            <div className="flex items-center text-green-700">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Admin Issuance Flow
                                            </div>
                                        </div>
                                    </div>

                                    {/* Certificate Details */}
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="font-semibold">Student:</span>{' '}
                                            <span className="text-muted-foreground">{previewCert.studentName}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">Cohort:</span>{' '}
                                            <span className="text-muted-foreground">{previewCert.cohort}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">Email:</span>{' '}
                                            <span className="text-muted-foreground">{previewCert.email}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">Certificate ID:</span>{' '}
                                            <span className="text-muted-foreground text-xs break-all font-mono bg-gray-100 px-2 py-1 rounded">
                                                {previewCert.certificateId}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">Issue Date:</span>{' '}
                                            <span className="text-muted-foreground">{previewCert.issueDate.toLocaleDateString()}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">Blockchain TX:</span>{' '}
                                            <span className="text-muted-foreground text-xs break-all font-mono bg-gray-100 px-2 py-1 rounded">
                                                {previewCert.blockchainTxHash}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">Digital Signature (SHA-256):</span>{' '}
                                            <span className="text-muted-foreground text-xs break-all font-mono bg-gray-100 px-2 py-1 rounded">
                                                {previewCert.digitalSignature.substring(0, 40)}...
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">QR Code Verification URL:</span>{' '}
                                            <span className="text-muted-foreground text-xs break-all">
                                                {previewCert.qrCodeData}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-6 space-y-3">
                                        <Button
                                            onClick={handleDownloadPDF}
                                            className="w-full bg-dada-orange hover:bg-dada-orange-light"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download PDF Certificate (with QR Code)
                                        </Button>
                                        <Button
                                            onClick={() => window.open(previewCert.qrCodeData, '_blank')}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            🔍 Test QR Code Verification
                                        </Button>
                                        <Button
                                            onClick={() => setPreviewCert(null)}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            Clear Preview
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Certificate Dashboard - Bonus Feature */}
                    <Card className="border-purple-200">
                        <CardHeader>
                            <CardTitle className="text-purple-700">📊 Certificate Dashboard (Bonus)</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                View all issued certificates from local storage
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(() => {
                                    // Check if we're on the client side
                                    if (typeof window === 'undefined') {
                                        return <p className="text-muted-foreground text-sm">Loading certificates...</p>;
                                    }
                                    
                                    const stored = localStorage.getItem('dadaDevsCertificates');
                                    if (!stored) {
                                        return <p className="text-muted-foreground text-sm">No certificates issued yet.</p>;
                                    }
                                    
                                    const certificates = JSON.parse(stored);
                                    const certList = Object.entries(certificates).map(([id, cert]: [string, any]) => ({
                                        id,
                                        ...cert
                                    }));

                                    if (certList.length === 0) {
                                        return <p className="text-muted-foreground text-sm">No certificates issued yet.</p>;
                                    }

                                    return (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Total Certificates: {certList.length}</p>
                                            {certList.slice(0, 5).map((cert: any) => (
                                                <div key={cert.id} className="p-3 border rounded-lg bg-gray-50">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium text-sm">{cert.studentName}</p>
                                                            <p className="text-xs text-muted-foreground">{cert.cohort}</p>
                                                            <p className="text-xs text-muted-foreground font-mono">{cert.id}</p>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => window.open(`/verify/certificate?id=${cert.id}`, '_blank')}
                                                        >
                                                            Verify
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {certList.length > 5 && (
                                                <p className="text-xs text-muted-foreground">
                                                    ... and {certList.length - 5} more certificates
                                                </p>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bulk Certificate Generation - Bonus Feature */}
                    <Card className="border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-blue-700">🚀 Bulk Certificate Generation (Bonus)</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Generate multiple certificates at once using CSV format
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bulkData">Student Data (CSV Format)</Label>
                                    <textarea
                                        id="bulkData"
                                        className="w-full h-32 p-3 border rounded-md text-sm font-mono"
                                        value={bulkData}
                                        onChange={(e) => setBulkData(e.target.value)}
                                        placeholder="Name, Email, Cohort, Course Title (optional)
Jane Doe, jane@example.com, Bitcoin Dev 2024, Core Development
John Smith, john@example.com, Bitcoin Dev 2024, Lightning Network
Alice Johnson, alice@example.com, Bitcoin Dev 2024"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Format: Name, Email, Cohort, Course Title (one per line)
                                    </p>
                                </div>

                                <Button
                                    onClick={handleBulkGeneration}
                                    disabled={isBulkGenerating || !walletState.isConnected}
                                    className="w-full"
                                    variant="outline"
                                >
                                    {isBulkGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating Bulk Certificates...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Generate Bulk Certificates
                                        </>
                                    )}
                                </Button>

                                {bulkResults.length > 0 && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <h4 className="font-semibold text-green-800 mb-2">
                                            ✅ Bulk Generation Complete: {bulkResults.length} certificates
                                        </h4>
                                        <div className="space-y-2">
                                            {bulkResults.map((cert, index) => (
                                                <div key={index} className="text-sm text-green-700">
                                                    • {cert.studentName} - {cert.certificateId}
                                                </div>
                                            ))}
                                        </div>
                                        <Button
                                            onClick={downloadAllPDFs}
                                            className="w-full mt-3"
                                            size="sm"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download All PDFs
                                        </Button>
                                        <Button
                                            onClick={() => setBulkResults([])}
                                            variant="outline"
                                            className="w-full mt-2"
                                            size="sm"
                                        >
                                            Clear Results
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}