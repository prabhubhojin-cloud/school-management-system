# Free Deployment Guide

Deploy your School Management System completely FREE using:
- **Frontend**: Vercel (Free forever)
- **Backend**: Render.com (Free tier)
- **Database**: MongoDB Atlas (Free 512MB)

## Prerequisites

1. Create accounts (all free):
   - [GitHub](https://github.com) - for code hosting
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) - for database
   - [Render.com](https://render.com) - for backend
   - [Vercel](https://vercel.com) - for frontend

## Step 1: Set Up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account and log in
3. Click "Build a Database" → Choose "M0 FREE" tier
4. Select your preferred region (choose closest to your users)
5. Click "Create Cluster"
6. **Create Database User:**
   - Click "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `schooladmin` (or any name)
   - Password: Create a strong password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"
7. **Whitelist IP Address:**
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
8. **Get Connection String:**
   - Click "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://schooladmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
   - Replace `<password>` with your actual password
   - Add database name before the `?`: `mongodb+srv://schooladmin:yourpassword@cluster0.xxxxx.mongodb.net/school_management?retryWrites=true&w=majority`
   - **Save this connection string - you'll need it later!**

## Step 2: Push Code to GitHub

1. Open terminal in your project folder
2. Run these commands:

```bash
# Initialize git repository
cd /Users/arvind-gn/Arvind\ Work/projects/school-management-system
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - School Management System with Attendance"

# Create repository on GitHub (follow these steps):
# - Go to https://github.com/new
# - Repository name: school-management-system
# - Choose Public or Private
# - DO NOT initialize with README
# - Click "Create repository"

# After creating, run these commands (replace YOUR_USERNAME):
git remote add origin https://github.com/YOUR_USERNAME/school-management-system.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy Backend to Render.com

1. Go to [Render.com](https://render.com) and sign up (use GitHub to sign in)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `school-management-backend` (or any name)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click "Advanced" and add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=<your MongoDB Atlas connection string from Step 1>
   JWT_SECRET=your_super_secret_random_string_here_make_it_long_and_random
   ALLOWED_ORIGINS=https://your-app-name.vercel.app
   ```
   (Note: We'll update ALLOWED_ORIGINS after deploying frontend)
6. Click "Create Web Service"
7. Wait 5-10 minutes for deployment
8. **Save your backend URL**: It will be like `https://school-management-backend.onrender.com`

**Important Notes about Render Free Tier:**
- Your backend will sleep after 15 minutes of inactivity
- First request after sleeping takes 30-60 seconds to wake up
- This is normal for free tier!

## Step 4: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com) and sign up (use GitHub)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   ```
   VITE_API_URL=<your Render backend URL from Step 3>/api
   ```
   Example: `VITE_API_URL=https://school-management-backend.onrender.com/api`
6. Click "Deploy"
7. Wait 2-3 minutes
8. **Your app is live!** URL will be like: `https://your-app-name.vercel.app`

## Step 5: Update Backend CORS Settings

1. Go back to Render.com dashboard
2. Click on your backend service
3. Go to "Environment" tab
4. Update `ALLOWED_ORIGINS` variable with your Vercel URL:
   ```
   ALLOWED_ORIGINS=https://your-app-name.vercel.app
   ```
5. Save changes (this will redeploy)

## Step 6: Create Admin Account

Your database is empty, so create an admin account:

```bash
# Method 1: Using curl
curl -X POST https://your-backend-url.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.com",
    "password": "Admin@123",
    "role": "admin"
  }'

# Method 2: Using your browser
# Go to: https://your-frontend-url.vercel.app
# Wait for backend to wake up (first load may take 30-60 seconds)
# The registration endpoint should create the admin
```

## Step 7: Access Your Application

1. Open your Vercel URL: `https://your-app-name.vercel.app`
2. Login with:
   - Email: `admin@school.com`
   - Password: `Admin@123`
3. Start using your school management system!

## Important: Custom Domain (Optional - Free)

**Vercel** provides free custom domains:
1. Buy a domain from Namecheap/GoDaddy (~$10/year)
2. In Vercel dashboard → Settings → Domains
3. Add your custom domain
4. Update DNS records as shown by Vercel
5. Done! Your app will be at: `https://yourdomain.com`

## Costs Summary

- **MongoDB Atlas Free**: 512MB storage (sufficient for small schools)
- **Render.com Free**: Backend hosting with sleep after inactivity
- **Vercel Free**: Unlimited frontend hosting with CDN
- **Total Monthly Cost**: $0

## Upgrading (Optional)

If your school grows larger:

**Render.com Paid Plans:**
- Starter ($7/month): No sleep, faster server
- Standard ($25/month): Better performance

**MongoDB Atlas Paid:**
- Shared ($9/month): 2-5GB storage
- Dedicated ($57/month): Better performance

## Maintenance

**Automatic Updates:**
- When you push to GitHub, both Vercel and Render auto-deploy
- No manual deployment needed!

**Backup Database:**
- MongoDB Atlas has automatic daily backups
- Can restore anytime from dashboard

## Troubleshooting

### Backend takes long to respond
- First request wakes up the server (30-60 seconds)
- Subsequent requests are fast
- Upgrade to paid plan to avoid sleep

### Can't connect to backend
- Check backend logs in Render dashboard
- Verify CORS settings include your frontend URL
- Check MongoDB connection string is correct

### Database connection error
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check database user credentials
- Ensure connection string has database name

## Security Recommendations

1. Change default admin password immediately
2. Use strong JWT_SECRET (random 64+ characters)
3. Enable 2FA on MongoDB Atlas
4. Regularly update dependencies: `npm audit fix`
5. Monitor Render logs for suspicious activity

## Need Help?

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Docs: https://docs.mongodb.com/

---

**Congratulations!** Your School Management System is now live and accessible worldwide! 🎉
