import { Camera, ShoppingCart, CreditCard, Video, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Steps() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { 
      id: 1, 
      title: "Choose your camera",
      description: "Browse our extensive collection of professional cameras and equipment.",
      icon: Camera,
      gradient: "from-purple-400 to-purple-600"
    },
    { 
      id: 2, 
      title: "Add to cart",
      description: "Select your preferred rental duration and add items to your cart.",
      icon: ShoppingCart,
      gradient: "from-purple-500 to-pink-500"
    },
    { 
      id: 3, 
      title: "Checkout",
      description: "Complete your secure payment and confirm your rental dates.",
      icon: CreditCard,
      gradient: "from-pink-500 to-pink-600"
    },
    { 
      id: 4, 
      title: "Start shooting",
      description: "Receive your equipment and start capturing amazing moments.",
      icon: Video,
      gradient: "from-pink-400 to-purple-400"
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-pink-300 rounded-full animate-ping opacity-60"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-40"></div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-pink-900/10"></div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className={`text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm mb-6">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-bold uppercase tracking-widest">How It Works</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 relative">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Rent in 4 Easy Steps
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20 blur-3xl -z-10"></div>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-16">
            Get professional camera equipment delivered to you with our simple rental process
            <span className="block text-sm text-gray-500 mt-2 italic">
              Fast, secure, and hassle-free
            </span>
          </p>
        </div>

        {/* Steps */}
        <div className="mx-auto max-w-6xl">
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            
            {/* Connection lines for larger screens */}
            <div className="hidden lg:block absolute top-16 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
            
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = activeStep === index;
              
              return (
                <li 
                  key={step.id} 
                  className={`relative group transition-all duration-700 transform ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  {/* Glowing effect for active step */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl blur-xl animate-pulse"></div>
                  )}
                  
                  {/* Main content card */}
                  <div className={`relative bg-gradient-to-br from-gray-800/60 via-gray-900/80 to-black/90 rounded-3xl p-8 border transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 backdrop-blur-lg ${
                    isActive 
                      ? 'border-purple-400/50 shadow-2xl shadow-purple-500/30' 
                      : 'border-gray-700/50 hover:border-purple-400/30 shadow-xl shadow-black/50'
                  }`}>
                    
                    {/* Step number badge */}
                    <div className="absolute -top-4 -left-4">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${step.gradient} flex items-center justify-center text-white text-sm font-bold shadow-lg ${isActive ? 'animate-pulse scale-110' : ''}`}>
                        {step.id}
                      </div>
                    </div>

                    {/* Icon container */}
                    <div className={`relative mb-6 group-hover:scale-110 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                      <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${step.gradient} transition-all duration-300 group-hover:shadow-lg shadow-purple-500/30`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* Pulsing ring for active step */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/30 to-pink-400/30 animate-ping"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className={`text-2xl font-bold transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent' 
                          : 'text-white group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent'
                      }`}>
                        {step.title}
                      </h3>
                      
                      <p className={`text-gray-400 leading-relaxed transition-colors duration-300 ${
                        isActive ? 'text-gray-200' : 'group-hover:text-gray-200'
                      }`}>
                        {step.description}
                      </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="mt-6">
                      <div className="w-full bg-gray-700/50 rounded-full h-1 overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${step.gradient} transition-all duration-1000 ${
                            isActive ? 'w-full' : 'w-0 group-hover:w-1/3'
                          }`}
                        ></div>
                      </div>
                    </div>

                    {/* Corner accent */}
                    <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${step.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300 rounded-br-3xl`}></div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Progress dots indicator */}
          <div className="flex justify-center mt-12 space-x-3">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeStep === index
                    ? 'bg-gradient-to-r from-purple-400 to-pink-400 scale-125'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className={`text-center mt-16 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '1000ms' }}>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm">
            <Camera className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300 text-sm">Ready to start your creative journey?</span>
          </div>
        </div>
      </div>
    </section>
  );
}