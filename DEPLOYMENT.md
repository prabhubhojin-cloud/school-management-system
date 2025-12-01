# Deployment Guide

This guide covers deploying the School Management System to production.

## Prerequisites

- Node.js v16+ installed
- MongoDB database (local or Atlas)
- Domain name (optional)
- SSL certificate (recommended)

## Backend Deployment

### Option 1: Heroku

1. Install Heroku CLI
2. Login to Heroku:
```bash
heroku login
```

3. Create a new Heroku app:
```bash
cd backend
heroku create your-app-name
```

4. Set environment variables:
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI_PROD=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set ALLOWED_ORIGINS=https://your-frontend-domain.com
```

5. Deploy:
```bash
git push heroku main
```

### Option 2: DigitalOcean/AWS/VPS

1. SSH into your server
2. Install Node.js and PM2:
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

3. Clone your repository:
```bash
git clone your-repo-url
cd school-management-system/backend
```

4. Install dependencies:
```bash
npm install --production
```

5. Create `.env` file with production values

6. Start with PM2:
```bash
pm2 start src/server.js --name school-backend
pm2 save
pm2 startup
```

7. Set up Nginx as reverse proxy:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### MongoDB Setup

#### Option 1: MongoDB Atlas (Recommended)
1. Create account at mongodb.com/atlas
2. Create a cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string
6. Update MONGODB_URI_PROD in .env

#### Option 2: Self-hosted MongoDB
1. Install MongoDB on server
2. Configure authentication
3. Set up regular backups
4. Update connection string in .env

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Set environment variables in Vercel dashboard:
- VITE_API_URL=https://your-backend-domain.com/api

### Option 2: Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build the app:
```bash
npm run build
```

3. Deploy:
```bash
netlify deploy --prod
```

4. Set environment variables in Netlify dashboard

### Option 3: Self-hosted with Nginx

1. Build the app:
```bash
npm run build
```

2. Copy `dist` folder to server:
```bash
scp -r dist/* user@server:/var/www/school-management
```

3. Configure Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/school-management;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## SSL Certificate

### Using Let's Encrypt (Free)

1. Install Certbot:
```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. Obtain certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

3. Auto-renewal is configured automatically

## Post-Deployment Checklist

### Security
- [ ] Change all default passwords
- [ ] Set strong JWT_SECRET
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS
- [ ] Set up firewall rules
- [ ] Disable unnecessary ports
- [ ] Set up fail2ban (if using VPS)

### Monitoring
- [ ] Set up error logging (e.g., Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Configure database monitoring

### Backup
- [ ] Set up automatic database backups
- [ ] Test backup restoration
- [ ] Store backups securely off-site

### Performance
- [ ] Enable compression
- [ ] Configure caching
- [ ] Set up CDN for static assets
- [ ] Optimize images
- [ ] Enable HTTP/2

### Testing
- [ ] Test all API endpoints
- [ ] Test authentication flow
- [ ] Test role-based access
- [ ] Test on multiple devices
- [ ] Test error scenarios

## Environment Variables Reference

### Backend (.env)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI_PROD=mongodb+srv://...
JWT_SECRET=strong_random_secret_here
JWT_EXPIRE=7d
ALLOWED_ORIGINS=https://your-frontend.com
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend.com/api
```

## Maintenance

### Regular Updates
```bash
# Backend
cd backend
git pull
npm install
pm2 restart school-backend

# Frontend
cd frontend
git pull
npm install
npm run build
# Deploy new build
```

### Database Backup
```bash
# Manual backup
mongodump --uri="your_mongodb_uri" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="your_mongodb_uri" /backup/20231201
```

### Monitoring Logs
```bash
# PM2 logs
pm2 logs school-backend

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Scaling

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Deploy multiple backend instances
- Use Redis for session storage
- Configure sticky sessions

### Database Scaling
- Set up MongoDB replica set
- Configure sharding for large datasets
- Implement read replicas

## Troubleshooting

### Backend won't start
- Check MongoDB connection
- Verify environment variables
- Check port availability
- Review error logs

### Frontend API errors
- Verify API URL in .env
- Check CORS configuration
- Verify backend is running
- Check network connectivity

### Database connection issues
- Verify MongoDB is running
- Check connection string
- Verify network access
- Check authentication credentials

## Support

For deployment issues, refer to:
- Backend logs: `pm2 logs school-backend`
- Nginx logs: `/var/log/nginx/`
- MongoDB logs: `/var/log/mongodb/`

## Rollback Procedure

If deployment fails:

1. Backend rollback:
```bash
git checkout previous-commit
pm2 restart school-backend
```

2. Frontend rollback:
- Redeploy previous version
- Or revert to previous build

3. Database rollback:
```bash
mongorestore --uri="your_uri" /backup/previous-date
```
