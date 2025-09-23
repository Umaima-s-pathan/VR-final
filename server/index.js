import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);
const app = express();
const PORT = process.env.PORT || 3001;
// Middleware
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
// Storage configuration (your original)
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
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, MOV, and AVI are allowed.'));
    }
  }
});
// Jobs storage (in-memory for demo; use DB in production)
const jobs = new Map();
// VR180 Processing Pipeline (your original class, but async-ified and optimized for demo speed)
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
      job.progress = Math.round((this.stages.filter(s => s.status === 'completed').length / this.stages.length) * 100);
    }
  }
  // Demo-optimized: Fast frame extraction (low FPS, small scale)
  async extractFrames() {
    this.updateProgress('depth', 10, 'processing');
    return new Promise((resolve, reject) => {
      ffmpeg(this.inputPath)
        .output(`${this.outputDir}/frames/frame_%03d.png`) // Fewer frames for speed
        .outputOptions(['-vf', 'fps=1,scale=320:180', '-y']) // 1 FPS, small size
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
  // Demo-optimized: Placeholder depth maps (fast, no heavy AI)
  async generateDepthMaps() {
    this.updateProgress('depth', 50, 'processing');
    const frameFiles = await fs.readdir(`${this.outputDir}/frames`);
    const pngFiles = frameFiles.filter(f => f.endsWith('.png'));
    const totalFrames = pngFiles.length;
    // Fast batch processing (small batches, placeholder generation)
    const batchSize = 2; // Smaller for speed
    for (let batchStart = 0; batchStart < totalFrames; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, totalFrames);
      const batch = pngFiles.slice(batchStart, batchEnd);
      for (let i = 0; i < batch.length; i++) {
        const frameIndex = batchStart + i;
        const depthMapPath = `${this.outputDir}/depth/depth_${String(frameIndex + 1).padStart(3, '0')}.png`;
        await this.createPlaceholderDepthMap(depthMapPath);
      }

      const progress = 50 + ((batchEnd / totalFrames) * 50);
      this.updateProgress('depth', progress, 'processing');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate fast processing
    }
    this.updateProgress('depth', 100, 'completed');
  }
  async createPlaceholderDepthMap(outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input('color=gray:size=320x180:duration=0.1')
        .inputOptions(['-f', 'lavfi'])
        .output(outputPath)
        .outputOptions(['-vframes', '1', '-y'])
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  // Fast stereo simulation
  async synthesizeStereo() {
    this.updateProgress('stereo', 0, 'processing');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Fast sim
    this.updateProgress('stereo', 100, 'completed');
  }
  // Fast outpainting simulation
  async expandPanorama() {
    this.updateProgress('outpainting', 0, 'processing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.updateProgress('outpainting', 100, 'completed');
  }
  // Fast blur simulation
  async applyFoveatedBlur() {
    this.updateProgress('blur', 0, 'processing');
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.updateProgress('blur', 100, 'completed');
  }

  // Fast upscaling simulation + final output
  async upscaleAndEnhance() {
    this.updateProgress('upscaling', 0, 'processing');
    const outputPath = `${this.outputDir}/final_vr180.mp4`;
    // Quick FFmpeg upscale (demo-optimized)
    await new Promise((resolve, reject) => {
      ffmpeg(this.inputPath)
        .output(outputPath)
        .outputOptions(['-vf', 'scale=1920:1080', '-y']) // Fast upscale
        .on('end', () => {
          this.updateProgress('upscaling', 100, 'completed');
          resolve(outputPath);
        })
        .on('error', reject)
        .run();
    });
  }

   // Full async pipeline (runs in background)
  async run() {
    try {
      await this.initialize();
      await this.extractFrames();
      await this.generateDepthMaps();
      await this.synthesizeStereo();
      await this.expandPanorama();
      await this.applyFoveatedBlur();
      const finalOutput = await this.upscaleAndEnhance();
      const job = jobs.get(this.jobId);
      job.outputPath = finalOutput;
      job.status = 'completed';
    } catch (error) {
      const job = jobs.get(this.jobId);
      job.status = 'failed';
      job.error = error.message;
    }
  }
}

// API Routes (your original, but async-ified)
app.get('/api/health', (req, res) => res.json({ status: 'healthy' }));
app.post('/api/upload', upload.single('video'), async (req, res) => {
  const jobId = uuidv4();
  const inputPath = req.file.path;
  // Create job entry immediately
  jobs.set(jobId, {
    jobId,
    status: 'queued',
    progress: 0,
    stages: [],
    inputPath,
    outputPath: null,
    error: null,
    lastUpdated: new Date()
  });
  // Run pipeline in background (non-blocking)
  const pipeline = new VR180Pipeline(jobId, inputPath);
  setImmediate(() => pipeline.run());
  res.json({ jobId }); // Return immediately – no blocking!
});

app.get('/api/status/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});
app.get('/api/download/:jobId', async (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job || job.status !== 'completed' || !job.outputPath) {
    return res.status(404).json({ error: 'File not ready' });
  }
  res.download(job.outputPath, `vr180_${req.params.jobId}.mp4`);
});
// Cleanup old jobs (optional, for demo)
setInterval(() => {
  const now = new Date();
  for (const [jobId, job] of jobs.entries()) {
    if (now - job.lastUpdated > 3600000) { // 1 hour
      jobs.delete(jobId);
    }
  }
}, 60000); // Check every minute
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

