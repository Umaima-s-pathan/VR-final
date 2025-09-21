const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const axios = require('axios');
const FormData = require('form-data');

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
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
      ffmpeg(this.inputPath)
        .output(`${this.outputDir}/frames/frame_%04d.png`)
        .outputOptions(['-vf', 'fps=30'])
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
    // Simulate MiDaS depth estimation
    this.updateProgress('depth', 50);
    
    const frameFiles = await fs.readdir(`${this.outputDir}/frames`);
    const totalFrames = frameFiles.length;
    
    for (let i = 0; i < totalFrames; i++) {
      // Simulate depth map generation processing time
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const progress = 50 + ((i / totalFrames) * 50);
      this.updateProgress('depth', progress);
      
      // In a real implementation, this would call MiDaS or similar depth estimation model
      // For now, we'll create placeholder depth maps
      const depthMapPath = `${this.outputDir}/depth/depth_${String(i + 1).padStart(4, '0')}.png`;
      
      // Create a simple gradient depth map as placeholder
      await this.createPlaceholderDepthMap(depthMapPath);
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
    
    // Simulate DIBR stereo synthesis
    const frameFiles = await fs.readdir(`${this.outputDir}/frames`);
    const totalFrames = frameFiles.length;
    
    for (let i = 0; i < totalFrames; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const progress = (i / totalFrames) * 100;
      this.updateProgress('stereo', progress);
      
      // In real implementation, this would use depth maps to create stereo pairs
      // For now, simulate the process
    }
    
    this.updateProgress('stereo', 100, 'completed');
  }

  async expandPanorama() {
    this.updateProgress('outpainting', 0);
    
    // Simulate AI outpainting and projection mapping
    const stages = [
      { name: 'AI Outpainting', duration: 3000, progress: 60 },
      { name: 'Projection Mapping', duration: 2000, progress: 100 }
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
      }, 100);
      
      await new Promise(resolve => setTimeout(resolve, stage.duration));
    }
    
    this.updateProgress('outpainting', 100, 'completed');
  }

  async applyFoveatedBlur() {
    this.updateProgress('blur', 0);
    
    // Simulate foveated edge blur application
    await new Promise(resolve => {
      const interval = setInterval(() => {
        const currentProgress = this.stages.find(s => s.name === 'blur').progress;
        if (currentProgress < 100) {
          this.updateProgress('blur', currentProgress + 10);
        } else {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
    
    this.updateProgress('blur', 100, 'completed');
  }

  async upscaleAndEnhance() {
    this.updateProgress('upscaling', 0);
    
    // Simulate AI upscaling with Real-ESRGAN
    const stages = [
      { name: 'AI Upscaling', duration: 4000, progress: 70 },
      { name: 'Quality Enhancement', duration: 2000, progress: 100 }
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
      }, 100);
      
      await new Promise(resolve => setTimeout(resolve, stage.duration));
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
    try {
      await this.initialize();
      
      // Stage 1: Depth Map Generation
      await this.extractFrames();
      await this.generateDepthMaps();
      
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

// Routes
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const jobId = uuidv4();
    const job = {
      id: jobId,
      filename: req.file.originalname,
      filepath: req.file.path,
      status: 'processing',
      createdAt: new Date(),
      stages: []
    };

    jobs.set(jobId, job);

    // Start processing pipeline
    const pipeline = new VR180Pipeline(jobId, req.file.path);
    pipeline.process().catch(error => {
      console.error(`Processing failed for job ${jobId}:`, error);
    });

    res.json({ jobId, message: 'Upload successful, processing started' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
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
    
    const fileStream = require('fs').createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
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

module.exports = app;