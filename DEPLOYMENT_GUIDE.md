# 🚀 Palace VR180 Platform - Deployment Guide

This guide will help you deploy your VR180 conversion platform using a hybrid approach with Streamlit as a launcher.

## 📋 Deployment Overview

Your application will be deployed as follows:
- **Frontend (React)**: GitHub Pages
- **Backend (Node.js)**: Railway/Railway/Render (choose one)
- **Launcher**: Streamlit (local or cloud)

## 🛠 Step 1: Deploy Frontend to GitHub Pages

### Prerequisites
1. GitHub repository created
2. Repository name should match your GitHub username

### Deployment Steps
1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Under "Source", select "GitHub Actions"

3. **The deployment will start automatically** using the existing workflow in `.github/workflows/deploy.yml`

4. **Get your deployed URL:**
   - After deployment, GitHub will provide a URL like: `https://your-username.github.io/palace/`
   - Replace `your-username` with your actual GitHub username

## 🛠 Step 2: Deploy Backend

Choose one of the following platforms:

### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Connect your GitHub repository
4. Railway will automatically detect it's a Node.js app
5. Deploy automatically

### Option B: Render
1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Set build command: `npm install && npm run build`
5. Set start command: `node server/index.js`

### Option C: Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Deploy: `git push heroku main`

## 🛠 Step 3: Configure URLs

### Update Streamlit App
1. Open `streamlit_app.py`
2. Find line with GitHub Pages URL and replace with your actual URL:
   ```python
   # Replace this line:
   # "https://your-username.github.io/palace/"
   # With your actual URL:
   "https://your-actual-username.github.io/palace/"
   ```

### Update Frontend for Backend API
1. Open `vite.config.ts`
2. Update the proxy target with your deployed backend URL:
   ```typescript
   server: {
     proxy: {
       '/api': {
         target: 'https://your-backend-url.com', // Replace with your backend URL
         changeOrigin: true
       }
     }
   }
   ```

## 🛠 Step 4: Run Streamlit Launcher

### Local Development
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run Streamlit app
python run_streamlit.py
```

### Cloud Deployment (Optional)
Deploy the Streamlit app to:
- **Streamlit Cloud**: Connect your GitHub repo
- **Heroku**: Use the `streamlit` buildpack
- **Railway**: Deploy as a Python service

## 🌐 Access Your Application

After deployment, you can access your application through:

1. **Streamlit Launcher** (Recommended):
   - Local: `http://localhost:8501`
   - Cloud: Your deployed Streamlit URL

2. **Direct Frontend Access**:
   - `https://your-username.github.io/palace/`

3. **Backend API**:
   - Railway: `https://your-app.railway.app`
   - Render: `https://your-app.onrender.com`
   - Heroku: `https://your-app.herokuapp.com`

## 🔧 Environment Variables

For production deployment, consider setting these environment variables:

### Backend Environment Variables
```bash
PORT=3001
NODE_ENV=production
```

### Frontend Environment Variables
Add to your deployment platform:
```javascript
REACT_APP_API_URL=https://your-backend-url.com
```

## 📊 Testing Your Deployment

1. **Test Frontend**:
   - Open the GitHub Pages URL
   - Navigate through all pages
   - Check if all components load correctly

2. **Test Backend**:
   - Use the Streamlit app to check backend status
   - Try uploading a small test video
   - Monitor the processing pipeline

3. **Test Integration**:
   - Upload a video through the frontend
   - Verify the processing status updates
   - Download the processed VR180 video

## 🐛 Troubleshooting

### Common Issues:

1. **Frontend not loading**:
   - Check if GitHub Pages deployment completed
   - Verify the repository name matches your username

2. **Backend connection failed**:
   - Check if backend is running
   - Verify CORS settings
   - Check firewall settings

3. **Streamlit app not starting**:
   - Install requirements: `pip install -r requirements.txt`
   - Check Python version (3.8+ required)

4. **Video processing fails**:
   - Check backend logs
   - Verify FFmpeg installation
   - Check available disk space

## 📞 Support

If you encounter issues:
1. Check the browser console for frontend errors
2. Check backend logs on your deployment platform
3. Verify all URLs are correctly configured
4. Test each component individually

## 🎯 Next Steps

After successful deployment:
1. Consider adding user authentication
2. Implement video storage solutions (AWS S3, Cloudinary)
3. Add monitoring and analytics
4. Set up CI/CD pipelines for automated deployments

---

**Congratulations!** 🎉 Your Palace VR180 Platform is now deployed and ready to transform videos into immersive VR180 experiences!
