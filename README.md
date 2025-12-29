# Dada Devs Certificate System

A comprehensive digital certificate management system with blockchain verification, built for African female Bitcoin developers. Features secure authentication, role-based access control, and decentralized certificate verification.

## 🎯 **System Overview**

### **Authentication & Access Control**
- **JWT-based authentication** with secure password hashing
- **Role-based access control** (Admin and User roles)
- **Institution management** with comprehensive profiles
- **Audit logging** for all authentication events

### **Blockchain Integration**
- **Smart contracts** deployed on Avalanche Fuji testnet
- **Certificate issuance** and verification on-chain
- **NFT-based certificates** with organization branding
- **Decentralized verification** system

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js v18+
- Git
- Modern web browser

### **Installation & Setup**

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd dada-devs-certificate-system
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run db:generate
   npm run db:push
   npm run db:seed
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend/avacertify-v2
   npm install
   cp .env.example .env.local
   # Edit .env.local with your configuration
   npm run dev
   ```

4. **Access the Application:**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001

## 🔑 **Test Credentials**

- **Admin User**: admin@dadadevs.org / admin123
- **Regular User**: student@example.com / user123

## 🏗️ **System Architecture**

### **Backend (Express.js + TypeScript)**
- **Authentication API** with JWT tokens
- **Institution management** CRUD operations
- **SQLite database** with Prisma ORM
- **Comprehensive audit logging**

### **Frontend (Next.js 15 + TypeScript)**
- **Role-aware navigation** system
- **Authentication flows** (login/signup)
- **Institution profile management**
- **Responsive design** with Tailwind CSS

### **Smart Contracts (Solidity + Foundry)**
- **Certificate issuance** system
- **NFT-based certificates** with metadata
- **Role-based access control**
- **Deployed on Avalanche Fuji**

## 🎯 **User Flows**

### **Guest Users**
```
Home Page → Sign Up/Login → Authentication → Role-based Redirect
```

### **Regular Users (Students)**
```
Login → Profile → Complete Profile → Verify Certificates
```

### **Admin Users (Dada Devs Officials)**
```
Login → Admin Dashboard → Institution Management → Full System Access
```

## 📋 **Key Features**

### **Authentication System**
- ✅ Secure JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Email verification system
- ✅ Role-based access control
- ✅ Authentication event logging

### **Institution Management**
- ✅ Comprehensive institution profiles
- ✅ Document management system
- ✅ User association and permissions
- ✅ Verification status tracking

### **User Experience**
- ✅ Fast login redirections
- ✅ Role-appropriate navigation
- ✅ Automatic page protection
- ✅ Responsive design

### **Security Features**
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Secure headers with Helmet
- ✅ Comprehensive error handling


## 🎥 Project Demo and Pitch

https://github.com/I-Macharia/Certificate-Issuance-System/AvaCertify_Pitch.mp4

## 🚀 **Deployed Contracts (Avalanche Fuji Testnet)**

### **Smart Contracts**
- **CertificateIssuanceSystem**: [`0x6B1c93D5CE36EA700c9d93AF58CC6963FB14Ff30`](https://testnet.snowtrace.io/address/0x6B1c93D5CE36EA700c9d93AF58CC6963FB14Ff30)
- **OrganizationNFTCertificate**: [`0xfdA44196237f9990630E6fFe9304b6D71Db945eb`](https://testnet.snowtrace.io/address/0xfdA44196237f9990630E6fFe9304b6D71Db945eb)

## 🗄️ **Database Schema**

### **Users Table**
- Authentication and profile management
- Role-based access control (USER/ADMIN)
- Institution associations
- Email verification tracking

### **Institutions Table**
- Comprehensive organization profiles
- Contact information and verification status
- Document management capabilities
- User associations and permissions

### **Authentication Logs**
- Complete audit trail of authentication events
- IP address and user agent tracking
- Security monitoring and analysis

## 🛠️ **Development**

### **API Endpoints**

#### **Authentication (`/api/auth/`)**
- `POST /signup` - User registration
- `POST /login` - User authentication  
- `POST /logout` - Secure logout
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `POST /verify-email` - Email verification
- `GET /logs` - Authentication audit logs (admin only)

#### **Institutions (`/api/institutions/`)**
- `POST /` - Create institution (admin only)
- `GET /` - List institutions
- `GET /:id` - Get institution details
- `PUT /:id` - Update institution
- `DELETE /:id` - Delete institution (admin only)
- `POST /:id/documents` - Add document
- `DELETE /:id/documents/:docId` - Remove document

### **Testing**

#### **Backend Testing**
```bash
cd backend
npm test
```

#### **Frontend Testing**
```bash
cd frontend/avacertify-v2
npm test
```

#### **Smart Contract Testing**
```bash
forge test
forge test -vvv  # verbose output
forge coverage   # coverage report
```

## 📊 **Project Structure**

```
dada-devs-certificate-system/
├── backend/                      # Express.js API server
│   ├── src/
│   │   ├── controllers/         # API controllers
│   │   ├── middleware/          # Auth & security middleware
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   └── utils/              # Utilities
│   ├── prisma/                 # Database schema & migrations
│   └── package.json
├── frontend/avacertify-v2/      # Next.js application
│   ├── app/                    # Next.js 15 app router
│   ├── components/             # React components
│   ├── contexts/               # React contexts
│   ├── hooks/                  # Custom hooks
│   └── utils/                  # Utilities
├── src/                        # Smart contracts
├── script/                     # Deployment scripts
├── test/                       # Contract tests
└── foundry.toml               # Foundry configuration
```

## 🤝 **Contributing**

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feat/amazing-feature`
3. **Commit changes**: `git commit -m 'feat: add amazing feature'`
4. **Push to branch**: `git push origin feat/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Use conventional commit messages
- Maintain code coverage above 80%

## 🔐 **Security**

- **JWT authentication** with secure token management
- **Password hashing** with bcrypt (12 rounds)
- **Input validation** with Joi schemas
- **CORS protection** and security headers
- **Audit logging** for security monitoring
- **Role-based access control** throughout the system

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 **Team Members**

- **Ian Macharia** - Smart Contract Developer - macharia.gichoya@gmail.com
- **Sharon Kitavi** - Backend Developer - sharonkmwikali@gmail.com
- **Farhiya Omar** - Backend Developer - farhiyaomar24@gmail.com
- **Salma Adam** - Smart Contract Developer - salmaadambakari@gmail.com
- **Linet Mugwanja** - Frontend Developer - mugwanjalk@gmail.com
- **Stan** - Backend Developer - e.n.ndegwa00@gmail.com
- **Truth** - Frontend Developer - trutherkadi@gmail.com

## 🙏 **Acknowledgments**

- **Avalanche Network** for blockchain infrastructure
- **OpenZeppelin** for security-audited contracts
- **Foundry** for Solidity development tools
- **Next.js** for React framework
- **Prisma** for database management

---

**Built with ❤️ for Africa's first pipeline of female Bitcoin developers**






