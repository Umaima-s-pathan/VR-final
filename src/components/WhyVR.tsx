import React from 'react';
import { Eye, Heart, Zap, Users } from 'lucide-react';

const WhyVR = () => {
  const benefits = [
    {
      icon: Eye,
      title: 'Total Immersion',
      description: 'Experience content like never before with stereoscopic 3D visuals that place you right in the action.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Heart,
      title: 'Emotional Connection',
      description: 'Feel genuine presence and emotional engagement that traditional media simply cannot match.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Instant Transport',
      description: 'Travel anywhere in the world instantly, breaking down geographical and physical barriers.',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: Users,
      title: 'Shared Experiences',
      description: 'Connect with others in virtual spaces, creating shared memories and collaborative learning.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Choose VR 180°?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover the compelling advantages that make VR 180° the future of immersive content
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${benefit.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <benefit.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{benefit.title}</h3>
              <p className="text-gray-300 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-semibold text-white mb-4">Ready to Experience the Future?</h3>
            <p className="text-gray-300 mb-6">
              Join millions of users who have already discovered the power of VR 180° technology
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
              <span>✓ Works on Desktop</span>
              <span>✓ Mobile Compatible</span>
              <span>✓ VR Headset Ready</span>
              <span>✓ No Installation Required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyVR;