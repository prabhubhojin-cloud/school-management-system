# School Management System - Backend

Backend API for the School Management System built with Node.js, Express, and MongoDB.

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/school_management
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/school_management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@school.com
ADMIN_PASSWORD=Admin@123
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Structure

- `/api/auth` - Authentication endpoints
- `/api/students` - Student management
- `/api/teachers` - Teacher management
- `/api/classes` - Class management
- `/api/fees` - Fee management
- `/api/reportcards` - Report card management
- `/api/academicyears` - Academic year management

## Database Models

### User
- Email and password authentication
- Role-based access (admin, teacher, student)
- Reference to role-specific documents

### Student
- Personal information
- Guardian details
- Year-wise enrollment tracking
- Current class and academic year

### Teacher
- Personal information
- Qualification and specialization
- Employment details

### Class
- Class name and section
- Academic year reference
- Class teacher and subjects
- Student capacity

### Fee
- Student and class reference
- Fee structure breakdown
- Payment history
- Due tracking

### ReportCard
- Student and class reference
- Subject-wise marks
- Attendance tracking
- Grade calculation
- Performance analytics

### AcademicYear
- Year range (e.g., 2023-2024)
- Start and end dates
- Active status
- Promotion tracking

## Key Features

### Student Promotion Service
Located in `src/services/promotionService.js`, this service handles:
- Bulk student promotion
- Enrollment history tracking
- Status updates
- Error handling for individual promotions

### Authentication Middleware
- JWT token verification
- Role-based authorization
- Protected routes

### Error Handling
- Centralized error handling middleware
- Mongoose error handling
- Production-safe error messages

## Testing

```bash
npm test
```

## Security

- JWT authentication
- Password hashing with bcrypt (10 rounds)
- Helmet for security headers
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Input validation

## Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure production MongoDB URI
- [ ] Set NODE_ENV=production
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS
- [ ] Configure proper logging
- [ ] Set up monitoring
- [ ] Regular backups
