# Dada Devs Certificate System - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies (2 minutes)
```bash
cd frontend/avacertify-app
npm install
```

### Step 2: Start Development Server (30 seconds)
```bash
npm run dev
```

### Step 3: Open Browser (10 seconds)
Navigate to: `http://localhost:3000`

### Step 4: Setup MetaMask (1 minute)
1. Install MetaMask browser extension if not already installed
2. Create or import a wallet
3. Add Avalanche Fuji Testnet:
   - Network Name: `Avalanche Fuji Testnet`
   - RPC URL: `https://api.avax-test.network/ext/bc/C/rpc`
   - Chain ID: `43113`
   - Symbol: `AVAX`
   - Explorer: `https://testnet.snowtrace.io/`

### Step 5: Get Test AVAX (1 minute)
1. Visit: https://faucet.avax.network/
2. Enter your wallet address
3. Request test tokens
4. Wait for confirmation

### Step 6: Issue Your First Certificate (1 minute)
1. Click "Connect Wallet" in the navbar
2. Navigate to "Issuer Dashboard"
3. Fill in the form:
   - Student Name: `John Doe`
   - Email: `john@example.com`
   - Cohort: `Web3 Bootcamp 2024`
   - Course: `Blockchain Fundamentals` (optional)
4. Click "Issue Certificate"
5. Approve the MetaMask transaction
6. Wait for confirmation (~3 seconds)
7. Click "Download PDF Certificate"

### Step 7: Verify Certificate (30 seconds)
1. Copy the certificate ID from the preview
2. Scroll to "Verify Certificate" section
3. Paste the ID and click "Verify"
4. Or scan the QR code on the PDF

## 🎯 You're Done!

You now have:
- ✅ A working certificate issuance system
- ✅ Blockchain-verified credentials
- ✅ Professional PDF certificates
- ✅ QR code verification

## 📚 Next Steps

- Read [DADA_DEVS_README.md](./DADA_DEVS_README.md) for full documentation
- Check [DEMO_INSTRUCTIONS.md](./DEMO_INSTRUCTIONS.md) for demo guide
- Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for technical details

## 🐛 Troubleshooting

**Problem**: npm install fails
**Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Problem**: MetaMask not connecting
**Solution**: Refresh page, ensure MetaMask is unlocked

**Problem**: Transaction fails
**Solution**: Ensure you have test AVAX, check network is Fuji

**Problem**: Certificate not found
**Solution**: Ensure certificate was successfully issued, check localStorage is enabled

## 💡 Tips

- Keep your MetaMask unlocked while using the app
- Each certificate issuance costs ~0.001 AVAX in gas
- Certificates are stored in browser localStorage
- QR codes link to verification page
- All certificates are recorded on blockchain

## 🎥 Demo Video

Record a 3-minute demo showing:
1. Connecting wallet
2. Issuing a certificate
3. Downloading the PDF
4. Verifying via QR code

## 📞 Need Help?

- Check the troubleshooting section in DADA_DEVS_README.md
- Review browser console for errors
- Ensure all dependencies are installed
- Verify you're on the correct network

---

**Happy Certifying! 🎓**
