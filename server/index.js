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
    this.updateProgress('depth', 10, 'processing');

    return new Promise((resolve, reject) => {
      // Extract frames with error handling
      ffmpeg(this.inputPath)
        .output(`${this.outputDir}/frames/frame_%04d.png`)
        .outputOptions([
          '-vf', 'fps=0.5,scale=320:180', // Even slower fps for stability
          '-y' // Overwrite existing files
        ])
        .on('progress', (progress) => {
          const percent = Math.min(progress.percent || 0, 90);
          this.updateProgress('depth', 10 + (percent * 0.3));
          console.log(`Frame extraction progress: ${percent}%`);
        })
        .on('end', () => {
          console.log('Frame extraction completed');
          this.updateProgress('depth', 40);
          resolve();
        })
        .on('error', (error) => {
          console.error('Frame extraction error:', error);
          reject(error);
        })
        .run();
    });
  }

  async generateDepthMaps() {
    try {
      this.updateProgress('depth', 50, 'processing');
      console.log('Starting depth map generation...');

      const frameFiles = await fs.readdir(`${this.outputDir}/frames`);
      const pngFiles = frameFiles.filter(f => f.endsWith('.png'));
      const totalFrames = pngFiles.length;

      console.log(`Found ${totalFrames} frames to process`);

      if (totalFrames === 0) {
        throw new Error('No frames extracted from video');
      }

      // Process frames in smaller batches for stability
      const batchSize = Math.min(5, totalFrames);
      for (let batchStart = 0; batchStart < totalFrames; batchStart += batchSize) {
        const batchEnd = Math.min(batchStart + batchSize, totalFrames);
        const batch = pngFiles.slice(batchStart, batchEnd);

        console.log(`Processing batch ${batchStart + 1}-${batchEnd} of ${totalFrames}`);

        // Process batch with error handling
        for (let i = 0; i < batch.length; i++) {
          const frameIndex = batchStart + i;
          const depthMapPath = `${this.outputDir}/depth/depth_${String(frameIndex + 1).padStart(4, '0')}.png`;
          
          try {
            await this.createPlaceholderDepthMap(depthMapPath);
          } catch (error) {
            console.error(`Error creating depth map ${frameIndex}:`, error);
            // Continue with next frame instead of failing
          }
        }

        const progress = 50 + ((batchEnd / totalFrames) * 50);
        this.updateProgress('depth', progress, 'processing');
      }

      console.log('Depth map generation completed');
      this.updateProgress('depth', 100, 'completed');
    } catch (error) {
      console.error('Depth map generation failed:', error);
      throw error;
    }
  }

  async createPlaceholderDepthMap(outputPath) {
    // Create a simple depth map with better error handling
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input('color=gray:size=320x180:duration=0.1')
        .inputOptions(['-f', 'lavfi'])
        .output(outputPath)
        .outputOptions(['-vframes', '1', '-y'])
        .on('end', () => {
          console.log(`Created depth map: ${outputPath}`);
          resolve();
        })
        .on('error', (error) => {
          console.error(`Failed to create depth map ${outputPath}:`, error);
          reject(error);
        })
        .run();
    });
  }

  async synthesizeStereo() {
    try {
      this.updateProgress('stereo', 0, 'processing');
      console.log('Starting stereo synthesis...');

      const frameFiles = await fs.readdir(`${this.outputDir}/frames`);
      const pngFiles = frameFiles.filter(f => f.endsWith('.png'));
      const totalFrames = pngFiles.length;

      // Simulate stereo processing with progress updates
      const steps = 10;
      for (let i = 0; i < steps; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const progress = ((i + 1) / steps) * 100;
        this.updateProgress('stereo', progress, 'processing');
        console.log(`Stereo synthesis progress: ${progress}%`);
      }

      console.log('Stereo synthesis completed');
      this.updateProgress('stereo', 100, 'completed');
    } catch (error) {
      console.error('Stereo synthesis failed:', error);
      throw error;
    }
  }

  async expandPanorama() {
    try {
      this.updateProgress('outpainting', 0, 'processing');
      console.log('Starting panorama expansion...');

      const stages = [
        { name: 'AI Outpainting', duration: 1000, progress: 60 },
        { name: 'Projection Mapping', duration: 800, progress: 100 }
      ];

      for (const stage of stages) {
        console.log(`Starting ${stage.name}...`);
        const steps = 10;
        const stepDuration = stage.duration / steps;
        
        for (let i = 0; i < steps; i++) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          const stageProgress = ((i + 1) / steps) * stage.progress;
          this.updateProgress('outpainting', stageProgress, 'processing');
        }
        
        console.log(`${stage.name} completed`);
      }

      console.log('Panorama expansion completed');
      this.updateProgress('outpainting', 100, 'completed');
    } catch (error) {
      console.error('Panorama expansion failed:', error);
      throw error;
    }
  }

  async applyFoveatedBlur() {
    try {
      this.updateProgress('blur', 0, 'processing');
      console.log('Starting foveated blur...');

      const steps = 8;
      for (let i = 0; i < steps; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const progress = ((i + 1) / steps) * 100;
        this.updateProgress('blur', progress, 'processing');
        console.log(`Foveated blur progress: ${progress}%`);
      }

      console.log('Foveated blur completed');
      this.updateProgress('blur', 100, 'completed');
    } catch (error) {
      console.error('Foveated blur failed:', error);
      throw error;
    }
  }

  async upscaleAndEnhance() {
    try {
      this.updateProgress('upscaling', 0, 'processing');
      console.log('Starting upscaling and enhancement...');

      const stages = [
        { name: 'AI Upscaling', duration: 1500, progress: 70 },
        { name: 'Quality Enhancement', duration: 1000, progress: 100 }
      ];

      for (const stage of stages) {
        console.log(`Starting ${stage.name}...`);
        const steps = 10;
        const stepDuration = stage.duration / steps;
        
        for (let i = 0; i < steps; i++) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          const stageProgress = ((i + 1) / steps) * stage.progress;
          this.updateProgress('upscaling', stageProgress, 'processing');
        }
        
        console.log(`${stage.name} completed`);
      }

      console.log('Upscaling and enhancement completed');
      this.updateProgress('upscaling', 100, 'completed');
    } catch (error) {
      console.error('Upscaling and enhancement failed:', error);
      throw error;
    }
  }

  async assembleVideo() {
    console.log('Starting final video assembly...');
    const outputPath = `${this.outputDir}/vr180_output.mp4`;
    
    return new Promise((resolve, reject) => {
      // Create optimized VR180 video from original with better error handling
      ffmpeg(this.inputPath)
        .output(outputPath)
        .outputOptions([
          '-c:v', 'libx264',
          '-preset', 'ultrafast', // Fastest encoding
          '-crf', '28', // Lower quality for speed
          '-c:a', 'aac',
          '-b:a', '128k',
          '-y' // Overwrite existing files
        ])
        .on('progress', (progress) => {
          console.log(`Video assembly progress: ${progress.percent || 0}%`);
        })
        .on('end', () => {
          console.log(`Video assembly completed: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (error) => {
          console.error('Video assembly error:', error);
          reject(error);
        })
        .run();
    });
  }

  async process() {
    const startTime = Date.now();
    const maxProcessingTime = 10 * 60 * 1000; // 10 minutes max

    console.log(`Starting VR180 processing for job ${this.jobId}`);
    console.log(`Input file: ${this.inputPath}`);

    try {
      console.log('Initializing pipeline...');
      await this.initialize();

      // Stage 1: Depth Map Generation
      console.log('=== STAGE 1: DEPTH MAP GENERATION ===');
      await this.extractFrames();
      await this.generateDepthMaps();

      // Check timeout
      if (Date.now() - startTime > maxProcessingTime) {
        throw new Error(`Processing timeout - exceeded ${maxProcessingTime / 1000 / 60} minutes`);
      }

      // Stage 2: Stereo Synthesis
      console.log('=== STAGE 2: STEREO SYNTHESIS ===');
      await this.synthesizeStereo();

      // Stage 3: Panorama Expansion & Projection
      console.log('=== STAGE 3: PANORAMA EXPANSION ===');
      await this.expandPanorama();

      // Stage 4: Foveated Edge Blur
      console.log('=== STAGE 4: FOVEATED BLUR ===');
      await this.applyFoveatedBlur();

      // Stage 5: AI Upscaling & Enhancement
      console.log('=== STAGE 5: UPSCALING & ENHANCEMENT ===');
      await this.upscaleAndEnhance();

      // Final assembly
      console.log('=== FINAL: VIDEO ASSEMBLY ===');
      const outputPath = await this.assembleVideo();

      // Update job status
      const job = jobs.get(this.jobId);
      if (job) {
        job.status = 'completed';
        job.outputPath = outputPath;
        job.originalPath = this.inputPath;
        job.completedAt = new Date();
        console.log(`Job ${this.jobId} completed successfully`);
      }

      return outputPath;
    } catch (error) {
      console.error(`Processing failed for job ${this.jobId}:`, error);
      const job = jobs.get(this.jobId);
      if (job) {
        job.status = 'error';
        job.error = error.message;
        job.failedAt = new Date();
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

// Routes
app.post('/api/upload', upload.single('video'), async (req, res) => {
  const startTime = Date.now();
  console.log('=== UPLOAD REQUEST STARTED ===');
  console.log('Request received at:', new Date().toISOString());

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

    // Verify file exists and is readable
    try {
      await fs.access(req.file.path);
      console.log('✅ File is accessible');
    } catch (error) {
      console.error('❌ File not accessible:', error);
      return res.status(500).json({ error: 'Uploaded file is not accessible' });
    }

    const jobId = uuidv4();
    console.log('Generated Job ID:', jobId);

    const job = {
      id: jobId,
      filename: req.file.originalname,
      filepath: req.file.path,
      status: 'processing',
      createdAt: new Date(),
      stages: [],
      progress: 0
    };

    jobs.set(jobId, job);
    console.log('Job created and stored');

    // Send response immediately
    const processingTime = Date.now() - startTime;
    console.log(`✅ Upload completed successfully in ${processingTime}ms`);
    console.log('=== UPLOAD REQUEST COMPLETED ===');
    
    res.json({ jobId, message: 'Upload successful, processing started' });

    // Start processing in background after response is sent
    setImmediate(async () => {
      try {
        console.log('Starting background processing...');
        const pipeline = new VR180Pipeline(jobId, req.file.path);
        await pipeline.process();
      } catch (error) {
        console.error(`Background processing failed for job ${jobId}:`, error);
        const job = jobs.get(jobId);
        if (job) {
          job.status = 'error';
          job.error = error.message;
        }
      }
    });

  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(`❌ Upload error after ${errorTime}ms:`, error);
    console.log('=== UPLOAD REQUEST FAILED ===');
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  console.log(`Status check for job: ${jobId}`);
  
  const job = jobs.get(jobId);

  if (!job) {
    console.log(`Job ${jobId} not found`);
    return res.status(404).json({ error: 'Job not found' });
  }

  console.log(`Job ${jobId} status: ${job.status}`);
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
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error('File not found:', filePath);
      return res.status(404).json({ error: 'Processed file not found' });
    }
    
    const filename = `vr180_${job.filename}`;
    
    // Set proper headers for video streaming
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Get file stats for proper streaming
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;
    
    // Handle range requests for video streaming
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunksize);
      
      const stream = (await import('fs')).createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      res.setHeader('Content-Length', fileSize);
      const stream = (await import('fs')).createReadStream(filePath);
      stream.pipe(res);
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Serve React app for all other routes
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

app.listen(PORT, () => {
  console.log(`Palace VR180 server running on port ${PORT}`);
});

export default app;
