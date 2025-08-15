import { Camera, Play, Star, Shield, Clock, Zap, ArrowRight, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

function Services(){
    const [isVisible, setIsVisible] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const services = [
        {
            title: "DSLR & Mirrorless Cameras",
            description: "Affordable cameras for photography and videography",
            image: "📸",
            features: ["4K Video Recording", "Full Frame Sensors", "Professional Lenses"],
            color: "from-purple-400 to-pink-400",
            bgGradient: "from-purple-900/20 to-pink-900/20",
            glowColor: "shadow-purple-500/30"
        },
        {
            title: "Cinema & Broadcast Equipment", 
            description: "Amazing equipment for photo productions",
            image: "🎬",
            features: ["8K Recording", "Professional Audio", "Stabilization Systems"],
            color: "from-blue-400 to-cyan-400",
            bgGradient: "from-blue-900/20 to-cyan-900/20", 
            glowColor: "shadow-blue-500/30"
        },
        {
            title: "Lighting & Accessories",
            description: "Complete lighting solutions and accessories", 
            image: "💡",
            features: ["LED Panels", "Softboxes", "Tripods & Gimbals"],
            color: "from-yellow-400 to-orange-400",
            bgGradient: "from-yellow-900/20 to-orange-900/20",
            glowColor: "shadow-yellow-500/30"
        }
    ];

    return (
        <section id="services" className="py-24 bg-gradient-to-b from-gray-900 via-black to-gray-900 relative overflow-hidden">
            {/* Animated background particles */}
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <div className="absolute top-32 right-20 w-1 h-1 bg-pink-400 rounded-full animate-ping"></div>
                <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute bottom-32 right-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/5 via-transparent to-blue-900/5"></div>
            
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className={`text-center mb-16 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <h2 className="text-5xl md:text-6xl font-bold mb-6 relative">
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                            Our Services
                        </span>
                        {/* Subtle glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 blur-3xl -z-10"></div>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Everything you need to create stunning content, all in one place.
                        <span className="block text-sm text-gray-500 mt-2 italic">
                            Affordable equipment rental for emerging creators
                        </span>
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className={`group relative transition-all duration-700 transform ${
                                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                            }`}
                            style={{ transitionDelay: `${index * 200}ms` }}
                            onMouseEnter={() => setHoveredCard(index)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* Glowing border effect */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${service.color} rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm`}></div>
                            
                            {/* Main card */}
                            <div className={`relative bg-gradient-to-br from-gray-800/40 via-gray-900/60 to-black/80 rounded-3xl overflow-hidden border border-gray-700/50 hover:border-transparent transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 backdrop-blur-lg ${hoveredCard === index ? `shadow-2xl ${service.glowColor}` : 'shadow-xl shadow-black/50'}`}>
                                
                                {/* Animated gradient overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                
                                {/* Content */}
                                <div className="relative p-8 z-10">
                                    {/* Floating emoji with enhanced animation */}
                                    <div className="text-6xl mb-6 text-center relative">
                                        <span className="inline-block group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 filter group-hover:drop-shadow-lg">
                                            {service.image}
                                        </span>
                                        {/* Subtle pulse ring */}
                                        <div className={`absolute inset-0 bg-gradient-to-r ${service.color} rounded-full opacity-0 group-hover:opacity-20 scale-150 animate-ping`}></div>
                                    </div>
                                    
                                    <h3 className={`text-2xl font-bold text-white mb-4 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:${service.color} group-hover:bg-clip-text group-hover:text-transparent`}>
                                        {service.title}
                                    </h3>
                                    
                                    <p className="text-gray-400 mb-6 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed">
                                        {service.description}
                                    </p>
                                    
                                    {/* Enhanced feature list */}
                                    <ul className="space-y-3 mb-8">
                                        {service.features.map((feature, featureIndex) => (
                                            <li 
                                                key={featureIndex} 
                                                className={`flex items-center text-gray-300 group-hover:text-white transition-all duration-300 transform ${hoveredCard === index ? 'translate-x-2' : ''}`}
                                                style={{ transitionDelay: `${featureIndex * 100}ms` }}
                                            >
                                                <Star className={`w-4 h-4 mr-3 transition-all duration-300 ${hoveredCard === index ? `text-transparent bg-gradient-to-r ${service.color} bg-clip-text` : 'text-purple-400'}`} />
                                                <span className="relative">
                                                    {feature}
                                                    {hoveredCard === index && (
                                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-30"></div>
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    
                                    
                                </div>

                                {/* Corner accent */}
                                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${service.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to action for startups */}
                <div className={`text-center mt-16 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '800ms' }}>
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-300 text-sm">Perfect for creators and students</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Services;