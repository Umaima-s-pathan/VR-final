import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-videosphere': any;
      'a-camera': any;
      'a-cursor': any;
      'a-assets': any;
      'a-video': any;
      'a-text': any;
      'a-sky': any;
    }
  }
}

const VRExperience = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isVRStarted, setIsVRStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Get video URL from URL parameters
  useEffect(() => {
    const url = searchParams.get('video');
    if (url) {
      setVideoUrl(url);
    } else {
      // Fallback to demo video if no URL provided
      setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    }
  }, [searchParams]);

  useEffect(() => {
    // Load A-Frame script
    const script = document.createElement('script');
    script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
    script.onload = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const startVRExperience = () => {
    setIsVRStarted(true);
    setShowControls(false);
    setTimeout(() => setShowControls(true), 3000);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    const video = document.querySelector('#vrVideo') as HTMLVideoElement;
    if (video) {
      video.muted = !video.muted;
    }
  };

  const resetView = () => {
    // Reset camera position
    const camera = document.querySelector('a-camera');
    if (camera) {
      camera.setAttribute('rotation', '0 0 0');
    }
  };

  const enterFullscreen = () => {
    const scene = document.querySelector('a-scene');
    if (scene) {
      // @ts-ignore
      scene.enterVR();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="w-32 h-32 border-4 border-purple-400/30 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-32 h-32 border-4 border-transparent border-t-purple-400 rounded-full animate-spin"></div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Loading VR Experience</h2>
            <p className="text-gray-300">Preparing your immersive 180° journey...</p>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isVRStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link 
            to="/"
            className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Ready for VR 180°?
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                You're about to experience an immersive 180° video that will transport you to another world. 
                Use your mouse to look around, or put on a VR headset for the full experience.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-white mb-4">Experience Instructions</h3>
              <div className="space-y-3 text-left text-gray-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Desktop: Click and drag to look around</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Mobile: Move your device or touch and drag</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>VR Headset: Look around naturally</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Use controls to adjust volume and view</span>
                </div>
              </div>
            </div>

            <button
              onClick={startVRExperience}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-4 rounded-full text-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25"
            >
              Launch VR Experience
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {/* VR Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
          <Link 
            to="/"
            className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-black/70 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Exit VR</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            
            <button
              onClick={resetView}
              className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            
            <button
              onClick={enterFullscreen}
              className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
              title="Enter VR Mode"
            >
              <Maximize className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* A-Frame VR Scene */}
      <a-scene
        embedded
        style={{ width: '100%', height: '100%' }}
        vr-mode-ui="enabled: true"
        device-orientation-permission-ui="enabled: true"
      >
        <a-assets>
          <video
            id="vrVideo"
            crossOrigin="anonymous"
            loop
            muted={isMuted}
            autoPlay
            playsInline
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        </a-assets>

        {/* 180° Video Sphere */}
        <a-videosphere
          src="#vrVideo"
          rotation="0 180 0"
          radius="100"
          segments-width="64"
          segments-height="32"
        ></a-videosphere>

        {/* Camera with look controls */}
        <a-camera
          look-controls="enabled: true; reverseMouseDrag: false"
          wasd-controls="enabled: false"
          position="0 1.6 0"
        >
          <a-cursor
            animation__click="property: scale; startEvents: click; from: 0.1 0.1 0.1; to: 1 1 1; dur: 150"
            animation__fusing="property: scale; startEvents: fusing; from: 1 1 1; to: 0.1 0.1 0.1; dur: 1500"
            raycaster="objects: .clickable"
            geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
            material="color: white; shader: flat"
          ></a-cursor>
        </a-camera>

        {/* Instructions text */}
        <a-text
          value="Look around to explore the 180° experience"
          position="0 -2 -5"
          align="center"
          color="white"
          width="8"
        ></a-text>
      </a-scene>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white bg-black/50 backdrop-blur-sm px-6 py-3 rounded-lg">
        <p className="text-sm">
          Click and drag to look around • Press VR button for headset mode
        </p>
      </div>
    </div>
  );
};

export default VRExperience;