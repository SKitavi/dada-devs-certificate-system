# Authentication System Implementation

This document outlines the complete authentication and role-based access system implemented for the Dada Devs Certificate System.

## 🚀 Quick Start

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Setup**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

4. **Start Backend**
```bash
npm run dev
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend/avacertify-v2
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Start Frontend**
```bash
npm run dev
```

## 📋 Features Implemented

### ✅ Authentication System
- **JWT-based authentication** with access and refresh tokens
- **Secure password hashing** using bcrypt (12 rounds)
- **Email verification** token system
- **Rate limiting** on auth endpoints (5 attempts per 15 minutes)
- **Authentication logging** for all auth events

### ✅ Role-Based Access Control
- **Two roles**: USER and ADMIN
- **Role-based navigation** visibility
- **Protected routes** with role requirements
- **Redirect logic** based on user role after login

### ✅ User Management
- **User signup/login** with validation
- **Profile management** with completion tracking
- **Institution association** for users
- **Email verification** status tracking

### ✅ Institution Management
- **Institution CRUD** operations
- **Institution profile page** with comprehensive fields
- **Document management** for institutions
- **User association** with institutions
- **Verification status** tracking

### ✅ Security Features
- **Input validation** using Joi schemas
- **CSRF protection** via helmet
- **Rate limiting** on all endpoints
- **Secure headers** configuration
- **Token expiration** and refresh handling

## 🗄️ Database Schema

### Users Table
```sql
- id (String, Primary Key)
- email (String, Unique)
- password (String, Hashed)
- firstName (String, Optional)
- lastName (String, Optional)
- role (Enum: USER, ADMIN)
- emailVerified (Boolean)
- emailVerifyToken (String, Optional)
- profileCompleted (Boolean)
- institutionId (String, Optional, Foreign Key)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### Institutions Table
```sql
- id (String, Primary Key)
- slug (String, Unique)
- name (String)
- registrationNumber (String, Optional)
- accreditationStatus (String, Optional)
- address fields (addressLine1, addressLine2, city, state, country, postalCode)
- contact fields (contactPersonName, contactPersonRole, contactEmail, contactPhone)
- website (String, Optional)
- logoUrl (String, Optional)
- verificationStatus (String, Default: "pending")
- createdAt (DateTime)
- updatedAt (DateTime)
```

### Authentication Logs Table
```sql
- id (String, Primary Key)
- userId (String, Optional, Foreign Key)
- event (String: signup, login_success, login_failure, logout, password_reset, email_verification)
- ipAddress (String, Optional)
- userAgent (String, Optional)
- metadata (String, JSON, Optional)
- createdAt (DateTime)
```

## 🔌 API Endpoints

### Authentication Endpoints
```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
PUT  /api/auth/profile
POST /api/auth/verify-email
GET  /api/auth/logs (Admin only)
```

### Institution Endpoints
```
POST   /api/institutions (Admin only)
GET    /api/institutions
GET    /api/institutions/:id
PUT    /api/institutions/:id
DELETE /api/institutions/:id (Admin only)
POST   /api/institutions/:id/documents
DELETE /api/institutions/:id/documents/:documentId
```

## 🎯 User Flows

### Regular User Flow
1. **Signup** → Email verification → **Profile completion**
2. **Login** → Redirect to `/profile`
3. **Complete profile** → Access to `/verify` and other features
4. **Navigation**: Home, Verify, About, Profile (Dashboard and Admin hidden)

### Admin User Flow
1. **Login** → Redirect to `/admin`
2. **Full access** to all pages including Dashboard and Admin
3. **Institution management** capabilities
4. **Authentication logs** access

### Navigation Visibility Rules
- **Guest users**: Home, About, Login/Signup buttons
- **Regular users**: Home, Verify, About, Profile
- **Admin users**: All pages including Dashboard and Admin

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend/avacertify-v2
npm test
```

### Manual Testing with cURL

**Signup:**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Profile:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔐 Security Considerations

### Implemented Security Measures
- **Password hashing** with bcrypt (12 rounds)
- **JWT tokens** with expiration (7 days access, 30 days refresh)
- **Rate limiting** (5 auth attempts per 15 minutes, 100 general requests per 15 minutes)
- **Input validation** with Joi schemas
- **CORS configuration** with specific origin
- **Helmet** for security headers
- **Authentication logging** for audit trails

### Production Recommendations
- Use environment variables for all secrets
- Implement HTTPS in production
- Set up proper database backups
- Configure monitoring and alerting
- Implement email verification SMTP
- Add password reset functionality
- Set up proper logging infrastructure

## 📝 Sample Data

### Default Admin User
```
Email: admin@dadadevs.org
Password: admin123
Role: ADMIN
```

### Default Regular User
```
Email: student@example.com
Password: user123
Role: USER
```

### Sample Institution
```
Name: Dada Devs
Slug: dada-devs
Status: Verified
```

## 🎯 Acceptance Criteria

### ✅ Authentication
- [x] Users can sign up with email and password
- [x] Users can log in with valid credentials
- [x] Invalid login attempts are blocked and logged
- [x] JWT tokens are issued and validated correctly
- [x] Rate limiting prevents brute force attacks

### ✅ Role-Based Access
- [x] Regular users see limited navigation (no Dashboard/Admin)
- [x] Admin users see full navigation
- [x] Users are redirected based on role after login
- [x] Protected routes enforce authentication and role requirements

### ✅ User Interface
- [x] Home page shows Login/Signup CTAs for guests
- [x] Navigation adapts based on authentication status and role
- [x] Profile page shows completion status and next steps
- [x] Institution profile page exists with full CRUD functionality

### ✅ Institution Management
- [x] Admins can create, read, update, delete institutions
- [x] Institution profile page has all required fields
- [x] Document management for institutions
- [x] User association with institutions

### ✅ Security & Logging
- [x] All authentication events are logged
- [x] Admins can view authentication logs
- [x] Input validation prevents malicious data
- [x] Error handling provides appropriate feedback

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Run database migrations: `npm run db:migrate`
3. Build application: `npm run build`
4. Start production server: `npm start`

### Frontend Deployment
1. Set production environment variables
2. Build application: `npm run build`
3. Deploy to hosting platform (Vercel, Netlify, etc.)

## 📞 Support

For questions or issues with the authentication system:
1. Check the logs in `/api/auth/logs` (admin access required)
2. Review the authentication events in the database
3. Verify environment configuration
4. Check rate limiting status

## 🔄 Future Enhancements

### Planned Features
- [ ] Email verification SMTP integration
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, GitHub)
- [ ] Advanced role permissions system
- [ ] Institution invitation system
- [ ] Bulk user management
- [ ] Advanced audit logging dashboard