# Deployment Guide

This guide covers deploying the Microphone Equalizer & Transcription application to various cloud platforms.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
5. [Docker Deployment](#docker-deployment)
6. [Alternative Platforms](#alternative-platforms)

---

## Prerequisites

- GitHub account
- Google Gemini API key ([Get one here](https://ai.google.dev/))
- Vercel account (for frontend)
- Render account (for backend)
- MongoDB Atlas account (for database)

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Repository
```bash
# Ensure all code is committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. **Visit [Vercel](https://vercel.com)** and sign in with GitHub
2. **Click "Add New Project"**
3. **Import your GitHub repository**
4. **Configure Project:**
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Add Environment Variables:**
   ```
   VITE_BACKEND_URL=https://your-backend.onrender.com
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```

6. **Click Deploy**

### Step 3: Custom Domain (Optional)
- Go to Project Settings → Domains
- Add your custom domain
- Update DNS records as instructed

---

## Backend Deployment (Render)

### Step 1: Create Web Service

1. **Visit [Render](https://render.com)** and sign in
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**

### Step 2: Configure Service

**Settings:**
- Name: `microphone-backend`
- Region: Choose closest to your users
- Branch: `main`
- Root Directory: `backend`
- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`

**Environment Variables:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/microphone
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
FRONTEND_URL=https://your-frontend.vercel.app
```

### Step 3: Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Copy the service URL (e.g., `https://microphone-backend.onrender.com`)

### Step 4: Update Frontend
- Go back to Vercel
- Update environment variables with the backend URL
- Redeploy frontend

---

## Database Setup (MongoDB Atlas)

### Step 1: Create Cluster

1. **Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**
2. **Sign up/Sign in**
3. **Create a free cluster:**
   - Provider: AWS, GCP, or Azure
   - Region: Choose closest to your backend
   - Cluster Tier: M0 Sandbox (Free)
   - Cluster Name: `microphone-cluster`

### Step 2: Configure Access

1. **Database Access:**
   - Click "Database Access" → "Add New Database User"
   - Create username and password
   - Set privileges to "Read and write to any database"

2. **Network Access:**
   - Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (or add specific IPs)
   - Confirm

### Step 3: Get Connection String

1. **Click "Connect"** on your cluster
2. **Choose "Connect your application"**
3. **Copy the connection string:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/microphone?retryWrites=true&w=majority
   ```
4. **Replace `<password>` with your database user password**

### Step 4: Update Backend
- Update `MONGODB_URI` in Render environment variables
- Redeploy backend service

---

## Docker Deployment

### Option 1: Local Docker Development

```bash
# Build and run all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

Access the application:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: mongodb://localhost:27017

### Option 2: Deploy to Cloud with Docker

#### Railway.app

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy:**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Add Environment Variables** in Railway dashboard

#### DigitalOcean App Platform

1. **Create App** in DigitalOcean dashboard
2. **Connect GitHub repository**
3. **Select Dockerfile** deployment method
4. **Configure environment variables**
5. **Deploy**

---

## Alternative Platforms

### Frontend Alternatives

#### Netlify
1. Connect GitHub repository
2. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. Add environment variables
4. Deploy

#### Cloudflare Pages
1. Connect GitHub
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend Alternatives

#### Railway
- Simpler than Render
- Automatic deployments
- Better free tier

#### Heroku
- Classic PaaS
- Easy to use
- Free tier with limitations

#### AWS Elastic Beanstalk
- More control
- Scalable
- Requires AWS knowledge

---

## Environment Variables Summary

### Frontend (.env)
```env
VITE_BACKEND_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-backend-url.com
```

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/microphone
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
FRONTEND_URL=https://your-frontend-url.com
```

---

## Post-Deployment Checklist

- [ ] Frontend is accessible and loads correctly
- [ ] Backend API responds to health check: `https://backend-url.com/health`
- [ ] Socket.io connection works (check browser console)
- [ ] Microphone permission is requested
- [ ] Equalizer visualizes audio correctly
- [ ] Transcription works with Gemini API
- [ ] Transcripts save to MongoDB
- [ ] API endpoints return data
- [ ] No CORS errors in console
- [ ] HTTPS is enabled on both frontend and backend
- [ ] Environment variables are set correctly
- [ ] Custom domains work (if configured)

---

## Monitoring & Maintenance

### Logs
- **Vercel**: Project → Deployments → Click deployment → Function Logs
- **Render**: Dashboard → Service → Logs tab
- **MongoDB Atlas**: Cluster → Metrics

### Scaling
- **Vercel**: Automatic scaling
- **Render**: Upgrade plan for more instances
- **MongoDB**: Upgrade cluster tier

### Backups
- **MongoDB Atlas**: Automatic backups on paid tiers
- **Code**: Regular Git commits and tags

---

## Troubleshooting

### Frontend Issues
- Check browser console for errors
- Verify environment variables in Vercel
- Ensure build succeeds
- Check network requests in DevTools

### Backend Issues
- Check Render logs for errors
- Verify MongoDB connection string
- Test API endpoints with curl/Postman
- Check CORS configuration

### Database Issues
- Verify IP whitelist in MongoDB Atlas
- Check username/password
- Ensure connection string is correct
- Monitor connection limits

---

## Security Best Practices

1. **Never commit `.env` files**
2. **Use environment variables** for all secrets
3. **Enable HTTPS** everywhere
4. **Rotate API keys** regularly
5. **Limit MongoDB IP access** to specific IPs
6. **Use strong passwords** for database users
7. **Enable rate limiting** on backend API
8. **Validate all user inputs**

---

## Cost Estimation (Free Tier)

- **Vercel**: Free (100GB bandwidth/month)
- **Render**: Free (750 hours/month)
- **MongoDB Atlas**: Free (512MB storage)
- **Total**: $0/month

**Paid Upgrades:**
- Vercel Pro: $20/month
- Render Starter: $7/month
- MongoDB M10: $10/month

---

## Support

For deployment issues:
1. Check service status pages
2. Review platform documentation
3. Search community forums
4. Contact support if needed

---

**Happy Deploying! 🚀**
