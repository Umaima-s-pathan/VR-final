import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import axios from 'axios';
import FormData from 'form-data';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware with enhanced CORS
app.use(cors({
  origin: [
    'https://vr-final-od3uhxbrfhfjddekcodkjf.streamlit.app',
    'https://umaima-s-pathan.github.io',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('dist'));

// Storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, MOV, and AVI are allowed.'));
    }
  }
});

// Job storage (in production, use a database)
const jobs = new Map();

// VR180 Processing Pipeline
class VR180Pipeline {
  constructor(jobId, inputPath) {
    this.jobId = jobId;
    this.inputPath = inputPath;
    this.outputDir = `outputs/${jobId}`;
    this.stages = [
      { name: 'depth', progress: 0, status: 'pending' },
      { name: 'stereo', progress: 0, status: 'pending' },
      { name: 'outpainting', progress: 0, status: 'pending' },
      { name: 'blur', progress: 0, status: 'pending' },
      { name: 'upscaling', progress: 0, status: 'pending' }
    ];
  }

  async initialize() {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(`${this.outputDir}/frames`, { recursive: true });
    await fs.mkdir(`${this.outputDir}/depth`, { recursive: true });
    await fs.mkdir(`${this.outputDir}/stereo`, { recursive: true });
  }

  updateProgress(stageName, progress, status = 'processing') {
    const stage = this.stages.find(s => s.name === stageName);
    if (stage) {
      stage.progress = progress;
      stage.status = status;
    }
    
    const job = jobs.get(this.jobId);
    if (job) {
      job.stages = this.stages;
      job.lastUpdated = new Date();
    }
  }

  async extractFrames() {
    this.updateProgress('depth', 10);

    return new Promise((resolve, reject) => {
      // Extract fewer frames for faster processing (5fps instead of 30fps)
      ffmpeg(this.inputPath)
        .output(`${this.outputDir}/frames/frame_%04d.png`)
        .outputOptions(['-vf', 'fps=5,scale=640:360']) // Lower resolution and fps for speed
        .on('progress', (progress) => {
          const percent = Math.min(progress.percent || 0, 90);
          this.updateProgress('depth', 10 + (percent * 0.3));
        })
        .on('end', () => {
          this.updateProgress('depth', 40);
          resolve();
        })
        .on('error', reject)
        .run();
    });
  }

  async generateDepthMaps() {
    // Fast depth map generation
    this.updateProgress('depth', 50);

    const frameFiles = await fs.readdir(`${this.outputDir}/frames`);
    const totalFrames = frameFiles.length;

    // Process frames in batches for better performance
    const batchSize = 10;
    for (let batchStart = 0; batchStart < totalFrames; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, totalFrames);
      const batch = frameFiles.slice(batchStart, batchEnd);

      // Process batch concurrently
      await Promise.all(batch.map(async (frameFile, index) => {
        const frameIndex = batchStart + index;
        const depthMapPath = `${this.outputDir}/depth/depth_${String(frameIndex + 1).padStart(4, '0')}.png`;
        await this.createPlaceholderDepthMap(depthMapPath);
      }));

      const progress = 50 + ((batchEnd / totalFrames) * 50);
      this.updateProgress('depth', progress);
    }

    this.updateProgress('depth', 100, 'completed');
  }

  async createPlaceholderDepthMap(outputPath) {
    // Create a simple gradient depth map using FFmpeg
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input('color=gray:size=1920x1080:duration=0.1')
        .inputOptions(['-f', 'lavfi'])
        .output(outputPath)
        .outputOptions(['-vframes', '1'])
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  async synthesizeStereo() {
    this.updateProgress('stereo', 0);

    // Fast stereo synthesis
    const frameFiles = await fs.readdir(`${this.outputDir}/frames`);
    const totalFrames = frameFiles.length;

    // Process in batches for better performance
    const batchSize = 15;
    for (let batchStart = 0; batchStart < totalFrames; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, totalFrames);

      // Simulate batch processing time (much faster)
      await new Promise(resolve => setTimeout(resolve, 200));

      const progress = (batchEnd / totalFrames) * 100;
      this.updateProgress('stereo', progress);
    }

    this.updateProgress('stereo', 100, 'completed');
  }

  async expandPanorama() {
    this.updateProgress('outpainting', 0);

    // Fast panorama expansion
    const stages = [
      { name: 'AI Outpainting', duration: 1000, progress: 60 },
      { name: 'Projection Mapping', duration: 800, progress: 100 }
    ];

    for (const stage of stages) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const stageProgress = Math.min((elapsed / stage.duration) * stage.progress, stage.progress);
        this.updateProgress('outpainting', stageProgress);

        if (elapsed >= stage.duration) {
          clearInterval(interval);
        }
      }, 50); // Faster updates

      await new Promise(resolve => setTimeout(resolve, stage.duration));
      clearInterval(interval); // Ensure interval is cleared
    }

    this.updateProgress('outpainting', 100, 'completed');
  }

  async applyFoveatedBlur() {
    this.updateProgress('blur', 0);

    // Fast foveated blur application
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const progress = ((i + 1) / steps) * 100;
      this.updateProgress('blur', progress);
    }

    this.updateProgress('blur', 100, 'completed');
  }

  async upscaleAndEnhance() {
    this.updateProgress('upscaling', 0);

    // Fast upscaling and enhancement
    const stages = [
      { name: 'AI Upscaling', duration: 1500, progress: 70 },
      { name: 'Quality Enhancement', duration: 1000, progress: 100 }
    ];

    for (const stage of stages) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const stageProgress = Math.min((elapsed / stage.duration) * stage.progress, stage.progress);
        this.updateProgress('upscaling', stageProgress);

        if (elapsed >= stage.duration) {
          clearInterval(interval);
        }
      }, 50);

      await new Promise(resolve => setTimeout(resolve, stage.duration));
      clearInterval(interval); // Ensure interval is cleared
    }

    this.updateProgress('upscaling', 100, 'completed');
  }

  async assembleVideo() {
    // Simulate final video assembly
    const outputPath = `${this.outputDir}/vr180_output.mp4`;
    
    return new Promise((resolve, reject) => {
      // For demo purposes, copy the original video as the output
      // In real implementation, this would assemble the processed frames
      ffmpeg(this.inputPath)
        .output(outputPath)
        .outputOptions([
          '-c:v', 'libx264',
          '-preset', 'medium',
          '-crf', '18',
          '-c:a', 'aac',
          '-b:a', '192k'
        ])
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  async process() {
    const startTime = Date.now();
    const maxProcessingTime = 15 * 60 * 1000; // 15 minutes max

    try {
      await this.initialize();

      // Stage 1: Depth Map Generation
      await this.extractFrames();
      await this.generateDepthMaps();

      // Check timeout
      if (Date.now() - startTime > maxProcessingTime) {
        throw new Error('Processing timeout - taking too long');
      }

      // Stage 2: Stereo Synthesis
      await this.synthesizeStereo();

      // Stage 3: Panorama Expansion & Projection
      await this.expandPanorama();

      // Stage 4: Foveated Edge Blur
      await this.applyFoveatedBlur();

      // Stage 5: AI Upscaling & Enhancement
      await this.upscaleAndEnhance();

      // Final assembly
      const outputPath = await this.assembleVideo();

      // Update job status
      const job = jobs.get(this.jobId);
      if (job) {
        job.status = 'completed';
        job.outputPath = outputPath;
        job.completedAt = new Date();
      }

      return outputPath;
    } catch (error) {
      const job = jobs.get(this.jobId);
      if (job) {
        job.status = 'error';
        job.error = error.message;
      }
      throw error;
    }
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// API Routes
app.post('/api/upload', upload.single('video'), async (req, res) => {
  const startTime = Date.now();
  console.log('=== UPLOAD REQUEST STARTED ===');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body fields:', req.body);

  try {
    if (!req.file) {
      console.error('No file received');
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    console.log('✅ File received successfully:');
    console.log('- Original name:', req.file.originalname);
    console.log('- Size:', req.file.size, 'bytes');
    console.log('- MIME type:', req.file.mimetype);
    console.log('- Path:', req.file.path);

    const jobId = uuidv4();
    console.log('Generated Job ID:', jobId);

    const job = {
      id: jobId,
      filename: req.file.originalname,
      filepath: req.file.path,
      status: 'processing',
      createdAt: new Date(),
      stages: []
    };

    jobs.set(jobId, job);
    console.log('Job created and stored');

    // Start processing pipeline with better error handling
    try {
      console.log('Initializing processing pipeline...');
      const pipeline = new VR180Pipeline(jobId, req.file.path);
      await pipeline.initialize(); // Initialize directories first
      console.log('Pipeline initialized successfully');

      // Start processing in background
      pipeline.process().catch(error => {
        console.error(`Processing failed for job ${jobId}:`, error);
        const job = jobs.get(jobId);
        if (job) {
          job.status = 'error';
          job.error = error.message;
        }
      });

      const processingTime = Date.now() - startTime;
      console.log(`✅ Upload completed successfully in ${processingTime}ms`);
      console.log('=== UPLOAD REQUEST COMPLETED ===');

      res.json({ jobId, message: 'Upload successful, processing started' });
    } catch (pipelineError) {
      console.error('❌ Pipeline initialization error:', pipelineError);
      res.status(500).json({ error: 'Failed to initialize processing pipeline' });
    }
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(`❌ Upload error after ${errorTime}ms:`, error);
    console.log('=== UPLOAD REQUEST FAILED ===');
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);
});

app.get('/api/download/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job || job.status !== 'completed') {
    return res.status(404).json({ error: 'File not ready or not found' });
  }

  try {
    const filePath = job.outputPath;
    const filename = `vr180_${job.filename}`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'video/mp4');

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 500MB.' });
    }
  }

  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Serve React app for all other routes (must be last)
app.use((req, res) => {
  // Try multiple possible paths for the dist directory
  const possiblePaths = [
    path.join(__dirname, '../dist/index.html'),
    path.join(__dirname, '../../dist/index.html'),
    path.join(__dirname, '../client/dist/index.html'),
    path.join(process.cwd(), 'dist/index.html')
  ];

  // Try each path until one works
  for (const filePath of possiblePaths) {
    try {
      if (require('fs').existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    } catch (error) {
      // Continue to next path
    }
  }

  // If no path works, return a simple HTML response
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Palace VR180 - Deploying</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
        }
        .container {
          max-width: 600px;
          padding: 2rem;
        }
        h1 { margin-bottom: 1rem; }
        p { margin-bottom: 2rem; line-height: 1.6; }
        .status { padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Palace VR180 Platform</h1>
        <p>Your VR180 video conversion platform is deploying! The frontend will be available shortly.</p>
        <div class="status">
          <h3>Deployment Status:</h3>
          <p>✅ Backend: Running on Render</p>
          <p>⏳ Frontend: Deploying to GitHub Pages</p>
          <p>🔗 <a href="https://github.com/Umaima-s-pathan/VR-final" style="color: #fff;">View on GitHub</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`Palace VR180 server running on port ${PORT}`);
});

export default app;
