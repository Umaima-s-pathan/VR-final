import React from 'react';
import { Brain, Globe, Laptop } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How Palace Works
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-semibold text-white mb-4">AI-Powered Conversion</h3>
              <p className="text-gray-300 leading-relaxed">
                Palace uses state-of-the-art AI models to transform your 2D videos into immersive VR180 experiences. Our pipeline generates depth maps, 
                creates stereoscopic views, expands panoramas using AI outpainting, and applies sophisticated projection mapping to create natural, 
                comfortable viewing experiences that make you feel present in the scene.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-semibold text-white mb-4">Professional Quality Output</h3>
              <p className="text-gray-300 leading-relaxed">
                Every video processed through Palace undergoes AI upscaling to 4K+ resolution, foveated edge blur for natural peripheral vision, 
                and quality enhancement to ensure crystal-clear VR experiences. The result is professional-grade VR180 content that rivals 
                expensive specialized cameras, all from your existing 2D footage.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Brain className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Depth Generation</h4>
                <p className="text-gray-300">
                  Advanced monocular depth estimation creates accurate 3D depth maps from your 2D video frames.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Globe className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">AI Outpainting</h4>
                <p className="text-gray-300">
                  Intelligent panorama expansion beyond frame edges creates immersive 180° environments.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Laptop className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Quality Enhancement</h4>
                <p className="text-gray-300">
                  AI upscaling and enhancement deliver 4K+ resolution with professional-grade clarity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;