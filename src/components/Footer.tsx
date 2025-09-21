import React from 'react';
import { Eye, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black/80 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-white text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Palace</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Transform any 2D video into immersive VR180 experiences using cutting-edge AI. 
              Professional-quality conversion pipeline with depth generation, outpainting, and enhancement.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Quick Links</h3>
            <div className="space-y-2">
              <a href="#home" className="block text-gray-300 hover:text-purple-400 transition-colors">
                Home
              </a>
              <a href="#about" className="block text-gray-300 hover:text-purple-400 transition-colors">
                How It Works
              </a>
              <a href="/upload" className="block text-gray-300 hover:text-purple-400 transition-colors">
                Upload Video
              </a>
              <a href="/experience" className="block text-gray-300 hover:text-purple-400 transition-colors">
                VR Experience
              </a>
              <a href="#contact" className="block text-gray-300 hover:text-purple-400 transition-colors">
                Contact Us
              </a>
            </div>
          </div>

          {/* Connect Section */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Connect With Us</h3>
            <p className="text-gray-300">
              Follow our journey in AI-powered VR conversion technology.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-white/10 hover:bg-purple-500/20 p-2 rounded-lg transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5 text-gray-300 hover:text-white" />
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-blue-500/20 p-2 rounded-lg transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 text-gray-300 hover:text-white" />
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-blue-600/20 p-2 rounded-lg transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5 text-gray-300 hover:text-white" />
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-green-500/20 p-2 rounded-lg transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5 text-gray-300 hover:text-white" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-300 text-sm">
              © 2025 Palace. AI-powered VR180 conversion platform built with cutting-edge technology.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-300">
              <span>Full-Stack AI Pipeline</span>
              <span>•</span>
              <span>Powered by AI & React</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;