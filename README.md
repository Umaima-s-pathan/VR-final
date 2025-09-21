# Palace - AI-Powered VR180 Conversion Platform

A revolutionary full-stack platform that transforms any 2D video into immersive VR180 experiences using cutting-edge AI technology and sophisticated processing pipelines.

## 🌟 Project Overview

Palace is a comprehensive VR180 conversion platform that leverages advanced AI models and geometric transformations to convert standard 2D videos into high-quality, immersive VR180 experiences. The platform features a sophisticated 5-stage processing pipeline that includes depth map generation, stereo synthesis, AI outpainting, foveated blur, and quality enhancement.

## ✨ Features

### Core Functionality
- **AI-Powered Video Conversion**: Transform 2D videos into immersive VR180 experiences
- **5-Stage Processing Pipeline**: Depth generation, stereo synthesis, outpainting, blur, and upscaling
- **Real-time Progress Tracking**: Live updates on processing stages with detailed progress indicators
- **High-Quality Output**: 4K+ resolution with professional-grade enhancement
- **Cross-Platform Compatibility**: Works on desktop, mobile, and VR headsets

### Processing Pipeline
1. **Depth Map Generation**: MiDaS AI-powered monocular depth estimation
2. **Stereo Synthesis**: DIBR (Depth-Image-Based Rendering) for stereoscopic 3D
3. **AI Outpainting & Projection**: Panoramic expansion with geometric projection mapping
4. **Foveated Edge Blur**: Natural peripheral vision simulation
5. **AI Upscaling**: Real-ESRGAN enhancement to 4K+ resolution

### User Experience
- **Drag & Drop Upload**: Intuitive file upload with validation
- **Real-time Processing Updates**: Live progress tracking with stage descriptions
- **Professional UI/UX**: Modern glass morphism design with smooth animations
- **Download & Preview**: Direct download and VR preview capabilities

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript for robust component architecture
- **Tailwind CSS** for responsive styling and design system
- **React Router DOM** for client-side navigation
- **Lucide React** for consistent iconography
- **A-Frame** for VR experience rendering

### Backend
- **Node.js** with Express.js for robust server architecture
- **Multer** for file upload handling
- **FFmpeg** for video processing and frame extraction
- **UUID** for unique job identification
- **CORS** for cross-origin resource sharing

### AI Integration (Planned)
- **MiDaS** for depth map generation
- **Stable Diffusion** for AI outpainting
- **Real-ESRGAN** for AI upscaling
- **Custom DIBR algorithms** for stereo synthesis

### Development Tools
- **Vite** for fast development and building
- **ESLint** for code quality
- **TypeScript** for type safety
- **Concurrently** for running frontend and backend simultaneously

## 🚀 Setup Instructions

### Prerequisites
- Node.js (16.0 or higher)
- npm or yarn package manager
- FFmpeg (automatically included via ffmpeg-static)
- Modern web browser with WebGL support for VR

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd palace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start individually:
   npm run dev          # Frontend only
   npm run dev:server   # Backend only
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`
   - Backend API runs on `http://localhost:3001`

### Building for Production

```bash
# Build the application
npm run build

# Preview the built application
npm run preview
```

## 🎯 Usage Guide

### Upload Process
1. Navigate to the Upload page
2. Drag and drop your video file or click to browse
3. Supported formats: MP4, MOV, AVI (max 500MB)
4. Click "Start AI Conversion" to begin processing

### Processing Pipeline
The system will automatically process your video through 5 stages:
- **Stage 1**: Depth map generation using AI
- **Stage 2**: Stereo synthesis for 3D effect
- **Stage 3**: AI outpainting and projection mapping
- **Stage 4**: Foveated edge blur application
- **Stage 5**: AI upscaling to 4K+ resolution

### Download & Preview
Once processing is complete:
- Download the converted VR180 video file
- Preview the result in the integrated VR viewer
- Share or use the video in any VR180-compatible player

## 🏗 Architecture

### File Structure
```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation component
│   ├── Hero.tsx        # Landing page hero
│   ├── About.tsx       # Platform explanation
│   ├── WhyVR.tsx       # Benefits section
│   ├── Contact.tsx     # Contact form
│   └── Footer.tsx      # Site footer
├── pages/              # Page components
│   ├── HomePage.tsx    # Main landing page
│   ├── UploadPage.tsx  # Video upload interface
│   ├── ProcessingPage.tsx # Processing status
│   └── VRExperience.tsx # VR viewer
server/
├── index.js            # Express server
└── pipeline/           # Processing pipeline classes
```

### Processing Pipeline Architecture
The VR180Pipeline class handles the complete conversion process:
- **Modular Design**: Each stage is independent and can be modified
- **Progress Tracking**: Real-time updates for each processing stage
- **Error Handling**: Comprehensive error management and recovery
- **Async Processing**: Non-blocking background processing

## 🔧 API Endpoints

### Upload Video
```
POST /api/upload
Content-Type: multipart/form-data
Body: video file
Response: { jobId, message }
```

### Check Processing Status
```
GET /api/status/:jobId
Response: { id, status, stages, progress, ... }
```

### Download Processed Video
```
GET /api/download/:jobId
Response: VR180 video file
```

## 🚀 Deployment

### Quick Start with Streamlit Launcher (Recommended)
```bash
# Install Python dependencies
pip install -r requirements.txt

# Test deployment setup
python test_deployment.py

# Run Streamlit launcher
python run_streamlit.py
```

### GitHub Pages (Frontend Only)
```bash
npm run build
npm run deploy
```

### Full-Stack Deployment
For production deployment with backend processing:
1. Deploy backend to cloud service (Railway, Render, or Heroku)
2. Configure environment variables
3. Set up file storage and processing queues
4. Deploy frontend with API endpoint configuration

### Hybrid Deployment (Streamlit + GitHub Pages + Cloud Backend)
1. **Deploy Frontend**: Push to GitHub → GitHub Pages (automatic)
2. **Deploy Backend**: Railway/Render/Heroku
3. **Run Streamlit Launcher**: Local or cloud deployment
4. **Access via Streamlit**: Single entry point to all services

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🎯 Performance Optimizations

- **Async Processing**: Background video processing with job queues
- **Progress Streaming**: Real-time updates without polling
- **Optimized Uploads**: Chunked upload for large files
- **Caching Strategy**: Processed video caching and CDN integration
- **Resource Management**: Automatic cleanup of temporary files

## 🔮 Future Enhancements

### AI Model Integration
- Real MiDaS depth estimation integration
- Stable Diffusion outpainting implementation
- Real-ESRGAN upscaling integration
- Custom DIBR algorithm optimization

### Platform Features
- User accounts and processing history
- Batch processing capabilities
- Custom processing presets
- Social sharing and collaboration
- Mobile app development

### Technical Improvements
- GPU acceleration for processing
- Distributed processing clusters
- Advanced quality metrics
- Real-time preview during processing

## 📄 Credits & Acknowledgments

- **MiDaS Team** for depth estimation research
- **Stability AI** for Stable Diffusion technology
- **Real-ESRGAN** for super-resolution algorithms
- **A-Frame Community** for VR web framework
- **React Team** for frontend architecture
- **FFmpeg** for video processing capabilities

---

**Built with ❤️ for the future of immersive content creation**

*Transform your videos into immersive VR180 experiences with Palace - where AI meets creativity.*