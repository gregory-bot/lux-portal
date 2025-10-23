import { useState, useEffect } from 'react';
import { BookOpen, MessageSquare, Users, GraduationCap } from 'lucide-react';
import { Button } from '../components/Button';

interface LandingPageProps {
  onNavigate: (page: 'login' | 'signup') => void;
}

const heroImages = [
  'https://www.luxdevhq.ai/_next/image?url=%2Fimage-2.png%3Fheight%3D1000%26width%3D1600&w=1920&q=75',
  'https://vabu.app/web/images/event-imgs/871260151754248829.jpg',
];

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center overflow-hidden">
              <img
                src="https://pbs.twimg.com/profile_images/1347925217352495104/thepvgY-_400x400.jpg"
                alt="LuxDev Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">LuxDev HQ</h1>
          </div>

          {/* Auth Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" size="md" onClick={() => onNavigate('login')}>
              Login
            </Button>
            <Button variant="primary" size="md" onClick={() => onNavigate('signup')}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-24 pb-20 md:pb-0">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div className="space-y-6 order-2 md:order-1">
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Build Your Future with LuxDev Academy
              </h2>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                A modern platform for assignment submission, collaboration, and communication between students and instructors.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-indigo-950 hover:bg-indigo-900"
                  onClick={() => onNavigate('signup')}
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate('login')}
                  className="border-indigo-950 text-indigo-950 hover:bg-blue-50"
                >
                  Sign In
                </Button>
              </div>
            </div>

            {/* Rotating Image */}
            <div className="relative h-[300px] md:h-[360px] w-full md:w-[75%] mx-auto overflow-hidden rounded-xl order-1 md:order-2">
              {heroImages.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    currentImageIndex === index
                      ? 'opacity-100 z-10'
                      : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={img}
                    alt={`LuxDev portal showcase ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    fetchPriority={currentImageIndex === index ? 'high' : 'low'}
                    className="w-full h-full object-cover rounded-2xl shadow-xl"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Platform Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-700" />
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">
                Assignment Management
              </h4>
              <p className="text-gray-600">
                Submit assignments, track progress, and receive grades all in one place.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-700" />
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">Real-time Chat</h4>
              <p className="text-gray-600">
                Communicate instantly with peers and instructors through our messaging system.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-700" />
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">Social Hub</h4>
              <p className="text-gray-600">
                Share articles, collaborate on ideas, and engage with the community.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-blue-700" />
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">Track Progress</h4>
              <p className="text-gray-600">
                Monitor your academic journey with comprehensive dashboards and analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p>&copy; 2025 LuxDev HQ. All rights reserved.</p>
          <p>
            by{' '}
            <a
              href="https://gregory-tech.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              gregory.tech
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};
