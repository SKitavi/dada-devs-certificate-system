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
                qrCodeData: `${window.location.origin}/verify/${certId}`,
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
                            <CardTitle>Issue Dada Devs Certificate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="recipientName">Student Name *</Label>
                                    <Input
                                        id="recipientName"
                                        value={formData.recipientName}
                                        onChange={(e) => handleInputChange("recipientName", e.target.value)}
                                        placeholder="John Doe"
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
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cohort">Cohort *</Label>
                                    <Input
                                        id="cohort"
                                        value={formData.cohort}
                                        onChange={(e) => handleInputChange("cohort", e.target.value)}
                                        placeholder="Web3 Bootcamp 2024"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="courseTitle">Course Title (Optional)</Label>
                                    <Input
                                        id="courseTitle"
                                        value={formData.courseTitle}
                                        onChange={(e) => handleInputChange("courseTitle", e.target.value)}
                                        placeholder="Blockchain Development Fundamentals"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="recipientAddress">Recipient Address (Optional)</Label>
                                    <Input
                                        id="recipientAddress"
                                        value={formData.recipientAddress}
                                        onChange={(e) => handleInputChange("recipientAddress", e.target.value)}
                                        placeholder="0x... (defaults to connected wallet)"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isGenerating || !walletState.isConnected || walletState.isConnecting}
                                    className="w-full"
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
                        <Card>
                            <CardHeader>
                                <CardTitle>Certificate Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
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
                                        <span className="text-muted-foreground text-xs break-all">{previewCert.certificateId}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Issue Date:</span>{' '}
                                        <span className="text-muted-foreground">{previewCert.issueDate.toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Blockchain TX:</span>{' '}
                                        <span className="text-muted-foreground text-xs break-all">{previewCert.blockchainTxHash}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Digital Signature:</span>{' '}
                                        <span className="text-muted-foreground text-xs break-all">
                                            {previewCert.digitalSignature.substring(0, 40)}...
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-3">
                                    <Button
                                        onClick={handleDownloadPDF}
                                        className="w-full"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download PDF Certificate
                                    </Button>
                                    <Button
                                        onClick={() => setPreviewCert(null)}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Clear Preview
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </Layout>
    );
}