// Certificate generation utilities for Dada Devs
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';

export interface CertificateData {
  certificateId: string;
  studentName: string;
  cohort: string;
  email: string;
  issueDate: Date;
  issuerName: string;
  courseTitle?: string;
  blockchainTxHash?: string;
}

export interface CertificateWithSignature extends CertificateData {
  digitalSignature: string;
  qrCodeData: string;
  isValid: boolean;
}

/**
 * Generate a unique certificate ID
 */
export function generateCertificateId(): string {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return `dd-cert-${uuid}`;
}

/**
 * Create canonical JSON string for hashing
 */
function createCanonicalData(cert: CertificateData): string {
  return JSON.stringify({
    certificateId: cert.certificateId,
    studentName: cert.studentName,
    cohort: cert.cohort,
    email: cert.email,
    issueDate: cert.issueDate.toISOString(),
    issuerName: cert.issuerName,
    courseTitle: cert.courseTitle || '',
  });
}

/**
 * Generate SHA-256 hash signature
 */
export function generateSignature(cert: CertificateData): string {
  const canonical = createCanonicalData(cert);
  return CryptoJS.SHA256(canonical).toString();
}

/**
 * Verify certificate signature
 */
export function verifySignature(cert: CertificateData, signature: string): boolean {
  const computedSignature = generateSignature(cert);
  return computedSignature === signature;
}

/**
 * Generate QR code as data URL
 */
export async function generateQRCode(certificateId: string): Promise<string> {
  const verificationUrl = `${window.location.origin}/verify/certificate?id=${certificateId}`;
  try {
    return await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#FF6B35',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

/**
 * Generate certificate PDF
 */
export async function generateCertificatePDF(
  cert: CertificateWithSignature
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(255, 248, 240); // dada-white
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Border
  doc.setDrawColor(255, 107, 53); // dada-orange
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Header
  doc.setFillColor(255, 107, 53);
  doc.rect(10, 10, pageWidth - 20, 30, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('DADA DEVS', pageWidth / 2, 25, { align: 'center' });
  doc.setFontSize(18);
  doc.text('Certificate of Completion', pageWidth / 2, 33, { align: 'center' });

  // Body
  doc.setTextColor(44, 44, 44); // dada-dark
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('This certifies that', pageWidth / 2, 60, { align: 'center' });

  // Student name
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 107, 53);
  doc.text(cert.studentName, pageWidth / 2, 75, { align: 'center' });

  // Completion text
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(44, 44, 44);
  doc.text('has successfully completed', pageWidth / 2, 90, { align: 'center' });

  // Cohort
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 107, 53);
  doc.text(cert.cohort, pageWidth / 2, 105, { align: 'center' });

  // Course title (if provided)
  if (cert.courseTitle) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(44, 44, 44);
    doc.text(cert.courseTitle, pageWidth / 2, 115, { align: 'center' });
  }

  // Date
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const dateStr = cert.issueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Issued on: ${dateStr}`, pageWidth / 2, 130, { align: 'center' });

  // Certificate ID
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Certificate ID: ${cert.certificateId}`, pageWidth / 2, 140, {
    align: 'center',
  });

  // QR Code
  try {
    const qrCodeDataUrl = await generateQRCode(cert.certificateId);
    doc.addImage(qrCodeDataUrl, 'PNG', 30, pageHeight - 70, 40, 40);
    doc.setFontSize(8);
    doc.text('Scan to verify', 50, pageHeight - 25, { align: 'center' });
  } catch (error) {
    console.error('Failed to add QR code to PDF:', error);
  }

  // Signature seal (decorative circle)
  doc.setDrawColor(255, 107, 53);
  doc.setFillColor(255, 140, 66);
  doc.circle(pageWidth - 50, pageHeight - 50, 20, 'FD');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('VERIFIED', pageWidth - 50, pageHeight - 52, { align: 'center' });
  doc.text('DADA DEVS', pageWidth - 50, pageHeight - 45, { align: 'center' });

  // Digital signature (truncated)
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Digital Signature: ${cert.digitalSignature.substring(0, 40)}...`,
    pageWidth / 2,
    pageHeight - 15,
    { align: 'center' }
  );

  return doc.output('blob');
}

/**
 * Store certificate hash locally (simple JSON storage)
 */
export function storeCertificateHash(
  certificateId: string,
  signature: string,
  certData: CertificateData
): void {
  const stored = localStorage.getItem('dadaDevsCertificates');
  const certificates = stored ? JSON.parse(stored) : {};
  
  certificates[certificateId] = {
    signature,
    studentName: certData.studentName,
    cohort: certData.cohort,
    email: certData.email,
    issueDate: certData.issueDate.toISOString(),
    issuerName: certData.issuerName,
    courseTitle: certData.courseTitle,
    blockchainTxHash: certData.blockchainTxHash,
  };
  
  localStorage.setItem('dadaDevsCertificates', JSON.stringify(certificates));
}

/**
 * Retrieve certificate hash from storage
 */
export function getCertificateHash(certificateId: string): {
  signature: string;
  data: CertificateData;
} | null {
  const stored = localStorage.getItem('dadaDevsCertificates');
  if (!stored) return null;
  
  const certificates = JSON.parse(stored);
  const cert = certificates[certificateId];
  
  if (!cert) return null;
  
  return {
    signature: cert.signature,
    data: {
      certificateId,
      studentName: cert.studentName,
      cohort: cert.cohort,
      email: cert.email,
      issueDate: new Date(cert.issueDate),
      issuerName: cert.issuerName,
      courseTitle: cert.courseTitle,
      blockchainTxHash: cert.blockchainTxHash,
    },
  };
}