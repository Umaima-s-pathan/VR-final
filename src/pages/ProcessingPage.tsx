import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle, Clock, AlertCircle, Eye, Cpu, Palette, Zap, Sparkles } from 'lucide-react';

const API_BASE = 'https://vr-final.onrender.com/api'; // Absolute Render URL

interface ProcessingStage {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
}

const ProcessingPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [stages, setStages] = useState<ProcessingStage[]>([
    {
      id: 'depth',
      name: 'Depth Map Generation',
      description: 'Analyzing video frames with MiDaS AI to create accurate depth maps',
      icon: Eye,
      status: 'pending',
      progress: 0
    },
    {
      id: 'stereo',
      name: 'Stereo Synthesis',
      description: 'Converting to stereoscopic 3D using depth-image-based rendering',
      icon: Cpu,
      status: 'pending',
      progress: 0
    },
    {
      id: 'outpainting',
      name: 'AI Outpainting & Projection',
      description: 'Expanding panorama and applying geometric projection mapping',
      icon: Palette,
      status: 'pending',
      progress: 0
    },
    {
      id: 'blur',
      name: 'Foveated Edge Blur',
      description: 'Applying natural peripheral vision blur for comfort',
      icon: Sparkles,
      status: 'pending',
      progress: 0
    },
    {
      id: 'upscaling',
      name: 'AI Upscaling & Enhancement',
      description: 'Enhancing to 4K+ resolution with Real-ESRGAN',
      icon: Zap,
      status: 'pending',
      progress: 0
    }
  ]);
  
  const [overallProgress, setOverallProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('queued');

  // Helper: Clamp progress to 0-100% (prevents overflow)
  const clampProgress = (value: number): number => {
    return Math.min(Math.max(value || 0, 0), 100);  // FIX: Double-clamp for safety
  };

  // Polling function with useCallback (avoids stale closures)
  const pollJobStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      console.log(`Fetching status for job: ${jobId}`);
      const response = await fetch(`${API_BASE}/status/${jobId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Status fetch failed: ${response.status} - ${errorText}`);
      }
      const jobData = await response.json();

      // Update stages from backend with CLAMPING
      setStages(prevStages => {
        const updatedStages = prevStages.map(stage => {
          const backendStage = jobData.stages?.find((s: any) => s.name === stage.id);
          if (backendStage) {
            const rawProgress = backendStage.progress || 0;
            const clampedProgress = clampProgress(rawProgress);  // FIX: Clamp here to prevent >100%
            
            // Debug log (remove after testing)
            if (stage.id === 'upscaling') {
              console.log(`Upscaling raw: ${rawProgress}%, clamped: ${clampedProgress}%`);  // FIX: Track values
            }
            
            return {
              ...stage,
              status: backendStage.status,
              progress: clampedProgress  // FIX: Use clamped value
            };
          }
          return stage;
        });
        return updatedStages;
      });

      // Update overall progress (use current snapshot) - already clamped
      setJobStatus(jobData.status || 'processing');
      const currentStages = stages; // Current state snapshot
      const completedStages = currentStages.filter(s => s.status === 'completed').length;
      const processingStages = currentStages.filter(s => s.status === 'processing').length;
      const overall = Math.min(((completedStages * 100 + processingStages * 50) / currentStages.length), 100);
      setOverallProgress(overall);

      // Handle completion
      if (jobData.status === 'completed') {
        setIsCompleted(true);
        setDownloadUrl(`${API_BASE}/download/${jobId}`);
        console.log(`Job ${jobId} completed!`);
      } else if (jobData.status === 'failed') {
        setError(jobData.error || 'Processing failed');
        console.error(`Job ${jobId} failed: ${jobData.error}`);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to connect to processing server';
      setError(errorMsg);
      console.error(`Polling error for job ${jobId}:`, err);
    }
  }, [jobId, stages]);  // FIX: Keep dependency on stages for reactivity

  useEffect(() => {
    if (!jobId) {
      navigate('/upload');
      return;
    }

    pollJobStatus(); // Initial call
    const interval = setInterval(pollJobStatus, 3000);

    return () => clearInterval(interval);
  }, [pollJobStatus, jobId, navigate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'processing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Processing Failed</h2>
            <p className="text-red-200 mb-6">{error}</p>
            <Link
              to="/upload"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to="/"
          className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {isCompleted ? 'Conversion Complete!' : 'Processing Your Video'}
          </h1>
          <p className="text-xl text-gray-300">
            {isCompleted 
              ? 'Your VR180 video is ready for download and viewing'
              : 'Our AI pipeline is transforming your 2D video into an immersive VR180 experience'
            }
          </p>
        </div>

        {/* Overall Progress - Already clamped, add overflow-hidden for safety */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 mb-8 overflow-hidden">  {/* FIX: overflow-hidden */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Overall Progress</h3>
            <span className="text-2xl font-bold text-purple-400">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">  {/* FIX: overflow-hidden on container */}
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${clampProgress(overallProgress)}%` }}  // FIX: Clamp here too
            />
          </div>
        </div>

        {/* Processing Stages */}
        <div className="space-y-4 mb-8">
          {stages.map((stage) => {
            const StageIcon = stage.icon;
            const displayProgress = clampProgress(stage.progress);  // FIX: Clamp for render (double-safety)
            
            return (
              <div
                key={stage.id}
                className={`bg-white/5 backdrop-blur-lg rounded-xl p-6 border transition-all duration-300 ${
                  stage.status === 'processing' 
                    ? 'border-purple-400/50 bg-purple-400/5' 
                    : stage.status === 'completed'
                    ? 'border-green-400/50 bg-green-400/5'
                    : 'border-white/10'
                } overflow-hidden`}  // FIX: overflow-hidden on card
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${
                    stage.status === 'processing' 
                      ? 'bg-purple-500/20' 
                      : stage.status === 'completed'
                      ? 'bg-green-500/20'
                      : 'bg-gray-500/20'
                  }`}>
                    {getStatusIcon(stage.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-white">{stage.name}</h4>
                      {getStatusIcon(stage.status)}
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{stage.description}</p>
                    
                    {stage.status === 'processing' && (
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden relative">  {/* FIX: overflow-hidden + relative for positioning */}
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300 absolute inset-0"  // FIX: absolute for precise width
                          style={{ 
                            width: `${displayProgress}%`,  // FIX: Use clamped displayProgress
                            left: 0,
                            backgroundSize: '200% 100%',  // Optional: Gradient animation
                            animation: displayProgress >= 100 ? 'none' : 'gradient-shift 2s ease infinite'  // Optional: Animate if <100
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Show progress % for processing stages (optional, for clarity) */}
                    {stage.status === 'processing' && (
                      <p className="text-sm text-purple-300 mt-1">{displayProgress}% Complete</p>  // FIX: Show clamped %
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Actions */}
        {isCompleted && (
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-8 border border-green-500/20">
            <div className="text-center space-y-6">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
              <h3 className="text-2xl font-bold text-white">Your VR180 Video is Ready!</h3>
              <p className="text-gray-300">
                Your video has been successfully converted to an immersive VR180 experience with AI-enhanced quality.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download={`vr180_converted_${Date.now()}.mp4`}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download VR180 Video</span>
                  </a>
                )}
                
                <Link
                  to={`/experience?video=${encodeURIComponent(downloadUrl || '')}&jobId=${jobId}`}
                  className="border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:bg-white/10 flex items-center justify-center space-x-2"
                >
                  <Eye className="h-5 w-5" />
                  <span>Preview in VR</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Optional: Custom CSS for gradient animation (add to your global CSS if wanted) */}
      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>  // FIX: Optional animation (remove if not needed)
    </div>
  );
};

export default ProcessingPage;
