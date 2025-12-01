# School Management System

A comprehensive, production-ready school management system built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### Core Modules
- **Student Management**: Complete student records with year-wise enrollment tracking
- **Teacher Management**: Teacher profiles with qualification and specialization
- **Class Management**: Class structure with subjects and teacher assignments
- **Attendance Management**: Daily attendance marking and monthly attendance reports with statistics
- **Fee Management**: Comprehensive fee tracking with payment history
- **Report Card System**: Subject-wise marks, grades, and performance analytics
- **Academic Year Management**: Year-wise data organization with student promotion

### Key Highlights
- **Year-wise Management**: Automatic student promotion to next class
- **Role-based Access Control**: Admin, Teacher, and Student roles
- **JWT Authentication**: Secure authentication system
- **Production-ready**: Security, error handling, and validation
- **RESTful API**: Well-structured API endpoints
- **Responsive UI**: Clean and intuitive interface

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT for authentication
- Bcrypt for password hashing
- Helmet for security
- Express Rate Limit
- Morgan for logging
- Compression

### Frontend
- React 19
- React Router for navigation
- Axios for API calls
- React Query for state management
- React Hook Form for forms
- React Toastify for notifications
- Recharts for analytics
- Vite for build tool

## Project Structure

```
school-management-system/
├── backend/
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Auth, error handling
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utility functions
│   │   └── server.js         # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/       # React components
    │   ├── context/          # Context providers
    │   ├── pages/            # Page components
    │   ├── services/         # API services
    │   ├── styles/           # CSS files
    │   └── App.jsx           # Main app
    ├── .env.example
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

#### 1. Clone the repository
```bash
cd school-management-system
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration:
# - Set JWT_SECRET
# - Set MONGODB_URI
# - Set other environment variables

# Start the server
npm run dev
```

The backend will run on `http://localhost:5000`

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your API URL
# VITE_API_URL=http://localhost:5000/api

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### Database Setup

The application will automatically connect to MongoDB. Make sure MongoDB is running locally or provide a MongoDB Atlas connection string in the `.env` file.

### Initial Admin Setup

Create an initial admin user by making a POST request to `/api/auth/register`:

```json
{
  "email": "admin@school.com",
  "password": "Admin@123",
  "role": "admin"
}
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatepassword` - Update password

### Student Endpoints
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get single student
- `POST /api/students` - Create student (Admin only)
- `PUT /api/students/:id` - Update student (Admin only)
- `DELETE /api/students/:id` - Delete student (Admin only)
- `POST /api/students/:id/enroll` - Enroll student in class (Admin only)

### Teacher Endpoints
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get single teacher
- `POST /api/teachers` - Create teacher (Admin only)
- `PUT /api/teachers/:id` - Update teacher (Admin only)
- `DELETE /api/teachers/:id` - Delete teacher (Admin only)

### Class Endpoints
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get single class
- `POST /api/classes` - Create class (Admin only)
- `PUT /api/classes/:id` - Update class (Admin only)
- `DELETE /api/classes/:id` - Delete class (Admin only)

### Fee Endpoints
- `GET /api/fees` - Get all fees
- `GET /api/fees/:id` - Get single fee
- `POST /api/fees` - Create fee record (Admin only)
- `PUT /api/fees/:id` - Update fee (Admin only)
- `DELETE /api/fees/:id` - Delete fee (Admin only)
- `POST /api/fees/:id/payment` - Add payment (Admin only)
- `GET /api/fees/summary/:academicYearId` - Get fee summary (Admin only)

### Report Card Endpoints
- `GET /api/reportcards` - Get all report cards
- `GET /api/reportcards/:id` - Get single report card
- `POST /api/reportcards` - Create report card (Admin, Teacher)
- `PUT /api/reportcards/:id` - Update report card (Admin, Teacher)
- `DELETE /api/reportcards/:id` - Delete report card (Admin only)
- `PUT /api/reportcards/:id/publish` - Publish report card (Admin only)
- `GET /api/reportcards/class/:classId/performance` - Get class performance

### Attendance Endpoints
- `POST /api/attendance/mark-daily` - Mark daily attendance for a class (Admin, Teacher)
- `GET /api/attendance/daily/:classId/:date` - Get attendance for a class on a specific date (Admin, Teacher)
- `GET /api/attendance/student/:studentId/monthly` - Get monthly attendance for a student
- `GET /api/attendance/class/:classId/monthly` - Get monthly attendance summary for a class (Admin, Teacher)
- `GET /api/attendance/student/:studentId/stats` - Get attendance statistics for a student
- `PUT /api/attendance/:id` - Update attendance record (Admin, Teacher)
- `DELETE /api/attendance/:id` - Delete attendance record (Admin only)

### Academic Year Endpoints
- `GET /api/academicyears` - Get all academic years
- `GET /api/academicyears/active` - Get active academic year
- `GET /api/academicyears/:id` - Get single academic year
- `POST /api/academicyears` - Create academic year (Admin only)
- `PUT /api/academicyears/:id` - Update academic year (Admin only)
- `DELETE /api/academicyears/:id` - Delete academic year (Admin only)
- `POST /api/academicyears/:id/promote` - Promote students to next year (Admin only)

## Production Deployment

### Backend

1. Set `NODE_ENV=production` in `.env`
2. Set production MongoDB URI
3. Configure CORS allowed origins
4. Set strong JWT secret
5. Deploy to your preferred platform (Heroku, AWS, DigitalOcean, etc.)

```bash
npm run start
```

### Frontend

1. Update `.env` with production API URL
2. Build the application:

```bash
npm run build
```

3. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Helmet for security headers
- Rate limiting
- CORS configuration
- Input validation
- Role-based access control
- Error handling middleware

## Future Enhancements

- Timetable scheduling
- Library management
- Exam scheduling
- Parent portal
- SMS/Email notifications
- Online payment integration
- Mobile application
- File upload for documents
- Advanced analytics and reporting

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

ISC

## Support

For support, email your-email@example.com or open an issue in the repository.

---

**Note**: This is a production-ready application with proper security measures. Make sure to:
- Change default passwords
- Set strong JWT secrets
- Configure proper CORS origins
- Use HTTPS in production
- Regular security updates
- Backup database regularly
