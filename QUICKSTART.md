# Quick Start Guide

Get the School Management System up and running in 5 minutes!

## Prerequisites

- Node.js v16+ installed
- MongoDB installed and running (or MongoDB Atlas account)

## Step 1: Install Backend

```bash
cd backend
npm install
```

## Step 2: Configure Backend

```bash
# Copy environment file
cp .env.example .env

# Edit .env and update these minimum required values:
# JWT_SECRET=your_random_secret_key_here
# MONGODB_URI=mongodb://localhost:27017/school_management
```

## Step 3: Start Backend

```bash
npm run dev
```

Backend will start on http://localhost:5000

## Step 4: Install Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

## Step 5: Configure Frontend

```bash
# Copy environment file
cp .env.example .env

# The default values should work:
# VITE_API_URL=http://localhost:5000/api
```

## Step 6: Start Frontend

```bash
npm run dev
```

Frontend will start on http://localhost:5173

## Step 7: Create Admin Account

Open a new terminal and use curl or Postman to create an admin account:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.com",
    "password": "Admin@123",
    "role": "admin"
  }'
```

## Step 8: Login

1. Open http://localhost:5173 in your browser
2. Login with:
   - Email: admin@school.com
   - Password: Admin@123

## What's Next?

After logging in, you can:

1. **Create Academic Year**
   - Go to Academic Years
   - Create a new year (e.g., "2024-2025")
   - Set it as active

2. **Add Classes**
   - Go to Classes
   - Create classes for the academic year
   - Add sections (A, B, C, etc.)

3. **Add Teachers**
   - Go to Teachers
   - Add teacher records
   - They'll get automatic login credentials

4. **Add Students**
   - Go to Students
   - Add student records
   - Enroll them in classes

5. **Manage Fees**
   - Go to Fees
   - Create fee records for students
   - Process payments

6. **Create Report Cards**
   - Go to Report Cards
   - Create report cards for students
   - Add marks and publish

## Default Passwords

When you create users (teachers/students), their default passwords are:
- Teachers: Their employee ID
- Students: Their date of birth in YYYYMMDD format

**Important**: Users should change their password after first login!

## Troubleshooting

### Backend won't start
- Make sure MongoDB is running: `mongod --version`
- Check if port 5000 is available
- Verify .env file exists with correct values

### Frontend won't start
- Make sure backend is running first
- Check if port 5173 is available
- Verify .env file exists in frontend directory

### Can't login
- Make sure you created the admin account
- Check browser console for errors
- Verify backend is running and accessible

### MongoDB connection error
- Start MongoDB: `mongod` or `brew services start mongodb-community`
- Or use MongoDB Atlas connection string in .env

## Need Help?

- Check the main README.md for detailed documentation
- Check DEPLOYMENT.md for production deployment
- Review the API documentation in README.md

## Sample Data

For testing, you can use these sample credentials after creating them:

**Admin**
- Email: admin@school.com
- Password: Admin@123

**Teacher** (after creating)
- Email: teacher@school.com
- Password: (their employee ID)

**Student** (after creating)
- Email: student@school.com
- Password: (their DOB in YYYYMMDD format)

---

**You're all set!** Start managing your school efficiently.
