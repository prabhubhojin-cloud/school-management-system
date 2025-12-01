# Quick Deployment Reference Card

## 📋 Checklist

### 1. MongoDB Atlas Setup
- [ ] Create free account at mongodb.com/cloud/atlas
- [ ] Create M0 FREE cluster
- [ ] Create database user
- [ ] Whitelist IP: 0.0.0.0/0 (all IPs)
- [ ] Copy connection string
- [ ] Save connection string securely

**Your MongoDB Connection String Template:**
```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/school_management?retryWrites=true&w=majority
```

### 2. GitHub Setup
- [ ] Create GitHub account (if needed)
- [ ] Create new repository: school-management-system
- [ ] Push code to GitHub

**Commands:**
```bash
cd /Users/arvind-gn/Arvind\ Work/projects/school-management-system
git add .
git commit -m "Initial commit with attendance feature"
git remote add origin https://github.com/YOUR_USERNAME/school-management-system.git
git push -u origin main
```

### 3. Render.com (Backend)
- [ ] Sign up at render.com (use GitHub)
- [ ] Create New Web Service
- [ ] Connect GitHub repo
- [ ] Configure:
  - Root Directory: `backend`
  - Build: `npm install`
  - Start: `npm start`
  - Instance: Free

**Environment Variables for Render:**
```
NODE_ENV=production
PORT=5001
MONGODB_URI=<paste your MongoDB connection string>
JWT_SECRET=<generate random 64+ char string>
ALLOWED_ORIGINS=<will add Vercel URL after Step 4>
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

- [ ] Deploy and save backend URL

### 4. Vercel (Frontend)
- [ ] Sign up at vercel.com (use GitHub)
- [ ] Import GitHub repository
- [ ] Configure:
  - Framework: Vite
  - Root Directory: `frontend`
  - Build: `npm run build`
  - Output: `dist`

**Environment Variable for Vercel:**
```
VITE_API_URL=https://your-backend.onrender.com/api
```

- [ ] Deploy and save frontend URL

### 5. Update Backend CORS
- [ ] Go back to Render dashboard
- [ ] Update ALLOWED_ORIGINS with your Vercel URL
- [ ] Save (triggers redeploy)

### 6. Create Admin Account
```bash
curl -X POST https://your-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@school.com", "password": "Admin@123", "role": "admin"}'
```

### 7. Test Your App
- [ ] Open your Vercel URL
- [ ] Wait 30-60 seconds for backend to wake up (first time)
- [ ] Login with admin@school.com / Admin@123
- [ ] Change admin password
- [ ] Start using!

## 🔗 Your URLs (Fill these in)

**MongoDB Connection String:**
```
_____________________________________________
```

**Backend URL (Render):**
```
https://_______________.onrender.com
```

**Frontend URL (Vercel):**
```
https://_______________.vercel.app
```

**GitHub Repository:**
```
https://github.com/_______________/school-management-system
```

## 💰 Costs

- MongoDB Atlas: $0/month (512MB free)
- Render.com: $0/month (with sleep)
- Vercel: $0/month (unlimited)
- **Total: $0/month**

## ⚠️ Important Notes

1. **Backend Sleep**: Free tier sleeps after 15 min inactivity
   - First request takes 30-60 seconds to wake up
   - This is NORMAL for free tier
   - Upgrade to $7/month for no sleep

2. **Database Limits**: 512MB storage
   - Good for ~5000 students
   - Upgrade if you need more

3. **Security**:
   - Change default admin password immediately
   - Use strong JWT secret
   - Never commit .env files

## 🆘 Quick Fixes

**Backend won't connect:**
- Check MongoDB IP whitelist
- Verify connection string
- Check Render logs

**Frontend can't reach backend:**
- Verify VITE_API_URL is correct
- Check CORS settings in Render
- Wait for backend to wake up

**Deployment fails:**
- Check build logs in Render/Vercel
- Verify all dependencies are in package.json
- Check Node version compatibility

## 📞 Support Resources

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Docs: https://docs.mongodb.com/atlas

## 🎉 Success!

Once deployed, share your app URL with anyone worldwide!
No server maintenance, automatic backups, and auto-deploy on every git push.
