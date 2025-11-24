# Dada Devs Digital Certificate Issuance System

A blockchain-based digital certificate issuance and verification system built for Dada Devs. This MVP provides secure, tamper-proof certificates with QR code verification, digital signatures, and on-chain validation.

## 🎯 Features

- ✅ **Blockchain-Verified**: All certificates recorded on Avalanche blockchain
- ✅ **Digital Signatures**: SHA-256 hash-based tamper-proof signatures
- ✅ **QR Code Verification**: Instant verification via QR code scanning
- ✅ **PDF Generation**: Professional certificate PDFs with Dada Devs branding
- ✅ **Admin Dashboard**: Easy-to-use interface for issuing certificates
- ✅ **Public Verification**: Anyone can verify certificate authenticity

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Avalanche Fuji Testnet, Solidity 0.8.30
- **Smart Contracts**: Foundry framework
- **Libraries**: ethers.js, jsPDF, qrcode, crypto-js

### Security Model
- **On-Chain Storage**: Certificate records stored on Avalanche blockchain
- **Digital Signatures**: SHA-256 hash of certificate data
- **Local Hash Storage**: Certificate hashes stored in browser localStorage
- **Tamper Detection**: Any modification invalidates the signature

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MetaMask wallet extension
- AVAX tokens on Fuji testnet (for gas fees)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Certificate-Issuance-System
   ```

2. **Install dependencies**
   ```bash
   cd frontend/avacertify-app
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Get Testnet AVAX
1. Visit [Avalanche Fuji Faucet](https://faucet.avax.network/)
2. Enter your wallet address
3. Request test AVAX tokens

## 📋 How to Issue a Certificate

### Step 1: Connect Wallet
1. Navigate to the Issuer Dashboard
2. Click "Connect Wallet" in the navigation bar
3. Approve the MetaMask connection
4. Switch to Avalanche Fuji Testnet when prompted

### Step 2: Fill Certificate Details
1. Enter the student's full name
2. Enter the student's email address
3. Enter the cohort name (e.g., "Web3 Bootcamp 2024")
4. Optionally, enter a course title
5. Click "Issue Certificate"

### Step 3: Blockchain Transaction
1. MetaMask will prompt you to approve the transaction
2. Confirm the transaction (requires small gas fee)
3. Wait for blockchain confirmation (~2-3 seconds)

### Step 4: Download Certificate
1. Once issued, the certificate preview appears
2. Review the certificate details
3. Click "Download PDF Certificate"
4. The PDF will download automatically

### Step 5: Share with Student
1. Send the PDF certificate to the student
2. The QR code on the certificate links to verification page
3. Share the certificate ID for manual verification

## 🔍 How to Verify a Certificate

### Method 1: QR Code (Recommended)
1. Open any QR code scanner app on your phone
2. Scan the QR code on the certificate
3. The verification page opens automatically
4. View certificate details and authenticity status

### Method 2: Manual Verification
1. Navigate to `https://your-domain.com/verify/[certificate-id]`
2. Or use the "Verify Certificate" form on the Issuer Dashboard
3. Enter the certificate ID
4. Click "Verify Certificate"

### Verification Results
- **✓ AUTHENTIC**: Certificate is valid and unmodified
- **✗ INVALID**: Certificate has been tampered with
- **NOT FOUND**: Certificate ID doesn't exist

## 🔐 Security & How It Works

### Threat Model
This system protects against:
- ✅ **Forgery**: Cannot create valid certificates without issuer access
- ✅ **Tampering**: Any modification invalidates the digital signature
- ✅ **Replay Attacks**: Unique IDs prevent certificate duplication
- ✅ **Unauthorized Issuance**: Only authorized wallets can issue certificates

### Security Implementation

#### 1. Unique Certificate IDs
- Format: `dd-cert-[UUID-v4]`
- Example: `dd-cert-a3f2b1c4-5678-90ab-cdef-1234567890ab`
- Globally unique, collision-resistant

#### 2. Digital Signatures
```
Certificate Data → Canonical JSON → SHA-256 Hash → Digital Signature
```
- All certificate fields are hashed together
- Any change to data produces different hash
- Signature stored locally and verified on demand

#### 3. Blockchain Verification
- Certificate issuance recorded on Avalanche blockchain
- Immutable record of certificate ID and recipient
- Transaction hash included in certificate

#### 4. QR Code Security
- QR code contains verification URL only
- No sensitive data embedded in QR code
- Links to public verification endpoint

### Why This Approach?
- **Simple**: No complex key management for MVP
- **Secure**: Cryptographically sound (SHA-256)
- **Fast**: Instant verification
- **Upgradeable**: Can add PKI later if needed
- **Transparent**: Blockchain provides audit trail

## 📊 Certificate Data Model

```typescript
interface Certificate {
  certificateId: string;        // Unique ID (UUID format)
  studentName: string;          // Full name
  cohort: string;               // Cohort/program name
  email: string;                // Student email
  issueDate: Date;              // Issue timestamp
  issuerName: string;           // "Dada Devs"
  courseTitle?: string;         // Optional course name
  digitalSignature: string;     // SHA-256 hash
  blockchainTxHash: string;     // Blockchain transaction ID
  qrCodeData: string;           // Verification URL
  isValid: boolean;             // Validity status
}
```

## 🎨 Branding

### Color Palette
- **Primary Orange**: `#FF6B35` - Buttons, headers, accents
- **Secondary Orange**: `#FF8C42` - Hover states
- **Light Orange**: `#FFB88C` - Backgrounds
- **Warm White**: `#FFF8F0` - Page background
- **Dark Text**: `#2C2C2C` - Body text

### Typography
- **Headings**: Helvetica Bold
- **Body**: Helvetica Regular

## 🛠️ Development

### Project Structure
```
frontend/avacertify-app/
├── app/
│   ├── issuer-dashboard/     # Certificate issuance UI
│   ├── verify/[id]/          # Verification page
│   ├── page.tsx              # Homepage
│   └── globals.css           # Global styles
├── components/
│   └── Navbar.tsx            # Navigation component
├── utils/
│   ├── blockchain.ts         # Blockchain integration
│   └── certificateGenerator.ts  # Certificate generation
└── public/                   # Static assets
```

### Smart Contracts
Located in `src/`:
- `CertificateIssuanceSystem.sol` - Main certificate contract
- Deployed on Avalanche Fuji Testnet

### Running Tests
```bash
# Smart contract tests
forge test

# Frontend tests
cd frontend/avacertify-app
npm run test
```

## 📱 Demo Instructions

### Quick Demo Flow (5 minutes)

1. **Setup** (1 min)
   - Open `http://localhost:3000`
   - Connect MetaMask wallet
   - Ensure you have Fuji testnet AVAX

2. **Issue Certificate** (2 min)
   - Navigate to Issuer Dashboard
   - Fill form:
     - Name: "John Doe"
     - Email: "john@example.com"
     - Cohort: "Web3 Bootcamp 2024"
     - Course: "Blockchain Fundamentals"
   - Click "Issue Certificate"
   - Approve MetaMask transaction
   - Wait for confirmation

3. **Download & View** (1 min)
   - Review certificate preview
   - Click "Download PDF Certificate"
   - Open PDF and view certificate

4. **Verify Certificate** (1 min)
   - Copy certificate ID from preview
   - Navigate to verification page or scan QR code
   - View verification results

### Demo Video Script

**Introduction** (30 sec)
"Welcome to Dada Devs Digital Certificate System. This is a blockchain-based solution for issuing and verifying tamper-proof digital credentials."

**Issuance** (60 sec)
"Let me show you how easy it is to issue a certificate. I'll connect my wallet, fill in the student details, and issue the certificate on the blockchain. The transaction takes just a few seconds."

**Certificate** (45 sec)
"Here's the generated certificate with Dada Devs branding. It includes a QR code for instant verification, a unique certificate ID, and a digital signature. I can download this as a PDF."

**Verification** (45 sec)
"Anyone can verify this certificate by scanning the QR code or entering the certificate ID. The system checks the digital signature and blockchain record to confirm authenticity."

**Conclusion** (30 sec)
"This system provides secure, verifiable credentials that can't be forged or tampered with. Perfect for bootcamps, training programs, and educational institutions."

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
cd frontend/avacertify-app
vercel deploy
```

### Environment Variables
No environment variables required for MVP (uses public testnet)

### Production Considerations
- [ ] Move to Avalanche Mainnet
- [ ] Implement backend API for hash storage
- [ ] Add email notifications
- [ ] Implement batch issuance
- [ ] Add certificate templates
- [ ] Implement role-based access control

## 🐛 Troubleshooting

### MetaMask Connection Issues
- Ensure MetaMask is installed
- Check you're on Avalanche Fuji Testnet
- Try refreshing the page

### Transaction Failures
- Ensure you have enough AVAX for gas
- Check network congestion
- Try increasing gas limit

### Certificate Not Found
- Verify certificate ID is correct
- Check localStorage is enabled
- Ensure certificate was successfully issued

### PDF Generation Issues
- Check browser console for errors
- Ensure all required libraries are installed
- Try clearing browser cache

## 📞 Support

For issues or questions:
- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)
- Email: support@dadadevs.com

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Avalanche Network for blockchain infrastructure
- OpenZeppelin for smart contract libraries
- Foundry for development tools
- Next.js team for the framework

---

**Built with ❤️ by Dada Devs**

*Empowering developers with blockchain-verified credentials*
