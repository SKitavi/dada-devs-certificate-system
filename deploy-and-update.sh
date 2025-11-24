#!/bin/bash

echo "🚀 Deploying contracts to Avalanche Fuji..."

# Deploy contracts
forge script script/Deploy.s.sol --rpc-url fuji --broadcast

# Extract addresses from the deployment output
# Note: You'll need to manually update the frontend config with the actual addresses
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the contract addresses from the output above"
echo "2. Update frontend/avacertify-v2/utils/contractConfig.ts with the new addresses"
echo "3. Start the frontend with: cd frontend/avacertify-v2 && npm run dev"
echo ""
echo "🎯 Then test at http://localhost:3000/admin"