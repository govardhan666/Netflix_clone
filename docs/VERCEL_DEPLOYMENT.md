# Vercel Deployment Guide for Netflix Clone

Complete guide to deploy your Netflix Clone to production using Vercel and complementary services.

## Architecture Overview

- **Frontend**: Vercel (React app)
- **Backend API**: Railway or Render (Node.js/Express)
- **Database**: MongoDB Atlas (free tier)
- **Cache**: Upstash Redis (free tier)
- **ML Service**: Railway (Python/FastAPI)

---

## Part 1: Deploy Frontend to Vercel

### Step 1: Prepare Your Repository

Your code is already pushed to GitHub. Make sure you're on the main branch or merge your PR first.

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `govardhan666/Netflix_clone`
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app
   GENERATE_SOURCEMAP=false
   CI=false
   ```
6. Click "Deploy"

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd Netflix_clone/frontend
vercel --prod
```

---

## Part 2: Deploy Backend to Railway

Railway offers free tier with $5/month credit (enough for small projects).

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project: "Netflix Clone Backend"

### Step 2: Deploy Backend

#### Via Railway Dashboard:

1. Click "New Project" → "Deploy from GitHub repo"
2. Select your repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add Environment Variables:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_change_this
   JWT_EXPIRE=7d
   REDIS_URL=your_upstash_redis_url
   ML_SERVICE_URL=https://your-ml-service.railway.app
   ```

#### Via Railway CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Deploy
railway up

# Get deployment URL
railway domain
```

### Step 3: Deploy ML Service to Railway

1. Create another Railway project: "Netflix Clone ML"
2. Deploy from same GitHub repo
3. Configure:
   - **Root Directory**: `ml-service`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   ```
   PORT=8000
   MONGODB_URI=your_mongodb_atlas_connection_string
   ```

---

## Part 3: Set Up MongoDB Atlas (Free Database)

### Step 1: Create MongoDB Atlas Account

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free
3. Create a free M0 cluster (512MB storage)
4. Choose AWS / Region closest to you

### Step 2: Configure Database

1. **Create Database User**:
   - Database Access → Add New User
   - Username: `netflixadmin`
   - Password: (generate strong password)
   - Permissions: Atlas Admin

2. **Whitelist IP Addresses**:
   - Network Access → Add IP Address
   - Add: `0.0.0.0/0` (allow from anywhere)
   - Note: In production, restrict to Railway IPs

3. **Get Connection String**:
   - Cluster → Connect → Connect your application
   - Copy connection string:
   ```
   mongodb+srv://netflixadmin:<password>@cluster0.xxxxx.mongodb.net/netflix_clone?retryWrites=true&w=majority
   ```

### Step 3: Seed Database

```bash
# Install MongoDB tools locally or use Railway shell
# Set environment variable
export MONGODB_URI="your_connection_string"

# Run seed script
node backend/seedData.js
```

---

## Part 4: Set Up Upstash Redis (Free Cache)

### Step 1: Create Upstash Account

1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub
3. Create database:
   - Name: `netflix-clone-cache`
   - Region: Choose closest region
   - Type: Regional

### Step 2: Get Connection Details

1. Go to your database
2. Copy Redis URL:
   ```
   redis://:your_password@your-endpoint.upstash.io:6379
   ```
3. Add to Railway environment variables

---

## Part 5: Update Environment Variables

### Backend (Railway)

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://netflixadmin:PASSWORD@cluster0.xxxxx.mongodb.net/netflix_clone
JWT_SECRET=generate_random_256_bit_secret_key
JWT_EXPIRE=7d
REDIS_URL=redis://:PASSWORD@endpoint.upstash.io:6379
ML_SERVICE_URL=https://netflix-ml.up.railway.app
```

### Frontend (Vercel)

```env
REACT_APP_API_URL=https://netflix-backend.up.railway.app
GENERATE_SOURCEMAP=false
CI=false
```

### ML Service (Railway)

```env
PORT=8000
MONGODB_URI=mongodb+srv://netflixadmin:PASSWORD@cluster0.xxxxx.mongodb.net/netflix_clone
MLFLOW_TRACKING_URI=sqlite:///mlflow/mlflow.db
```

---

## Part 6: Configure CORS

Update `backend/server.js` to allow Vercel domain:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app',
    'https://netflix-clone.vercel.app'
  ],
  credentials: true
}));
```

---

## Part 7: Deploy Updates

### Update Frontend with Backend URL

1. In Vercel dashboard, go to your project
2. Settings → Environment Variables
3. Add: `REACT_APP_API_URL` = `https://your-backend.railway.app`
4. Redeploy: Deployments → Click "..." → Redeploy

### Update Backend with Frontend URL

1. In Railway dashboard, go to backend project
2. Variables → Add `CORS_ORIGIN` = `https://your-app.vercel.app`
3. Railway auto-redeploys

---

## Part 8: Verify Deployment

### Test Backend

```bash
# Health check
curl https://your-backend.railway.app/health

# Expected response:
# {"status":"healthy","timestamp":"...","service":"netflix-clone-backend"}
```

### Test ML Service

```bash
# Health check
curl https://your-ml-service.railway.app/health

# Expected response:
# {"status":"healthy","service":"ml-service","timestamp":"..."}
```

### Test Frontend

1. Open your Vercel URL: `https://your-app.vercel.app`
2. Create an account
3. Browse content
4. Test streaming

---

## Part 9: Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `netflix-clone.yourdomain.com`
3. Update DNS records as instructed:
   ```
   Type: CNAME
   Name: netflix-clone
   Value: cname.vercel-dns.com
   ```

### SSL Certificate

Vercel automatically provisions SSL certificates for all domains.

---

## Deployment Checklist

- [ ] MongoDB Atlas database created and seeded
- [ ] Upstash Redis created
- [ ] Backend deployed to Railway
- [ ] ML Service deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] All services health checks passing
- [ ] Test user registration
- [ ] Test content browsing
- [ ] Test video streaming
- [ ] Test recommendations

---

## Cost Breakdown (Free Tier)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Vercel** | Free | 100GB bandwidth/month, unlimited deployments |
| **Railway** | $5 credit/month | ~500 hours runtime |
| **MongoDB Atlas** | Free | 512MB storage, shared cluster |
| **Upstash Redis** | Free | 10,000 commands/day |

**Total Monthly Cost**: $0 for small projects!

---

## Alternative: Full Backend on Render

If you prefer Render over Railway:

1. Go to [render.com](https://render.com)
2. Create Web Service from GitHub
3. Configure same as Railway
4. Free tier: 750 hours/month

---

## Troubleshooting

### Frontend can't connect to backend

- Check `REACT_APP_API_URL` in Vercel
- Verify CORS settings in backend
- Check Network tab in browser DevTools

### Database connection fails

- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure password doesn't have special characters (URL encode if needed)

### ML Service not responding

- Check Railway logs
- Verify Python dependencies installed
- Check memory limits (may need to upgrade)

---

## Monitoring

### Vercel Analytics

- Vercel Dashboard → Analytics
- View page views, performance metrics
- Free tier includes basic analytics

### Railway Logs

- Railway Dashboard → Your Service → Logs
- Real-time log streaming
- Error tracking

### MongoDB Atlas Monitoring

- Atlas Dashboard → Metrics
- Database operations
- Connection statistics

---

## Next Steps

1. **Set up CI/CD**: GitHub Actions already configured
2. **Add monitoring**: Integrate Sentry for error tracking
3. **Optimize**: Add CDN for video content
4. **Scale**: Upgrade Railway/Vercel tiers as needed

---

Your Netflix Clone is now live on the internet! 🎉

Access your app at: `https://your-app.vercel.app`
