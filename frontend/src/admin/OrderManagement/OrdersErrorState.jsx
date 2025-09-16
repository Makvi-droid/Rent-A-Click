// OrdersErrorState.jsx
import React, { useState } from 'react';
import { 
  AlertTriangle, 
  RefreshCcw, 
  Home, 
  Wifi, 
  Server, 
  Database,
  Bug,
  HelpCircle,
  ArrowLeft,
  Zap
} from 'lucide-react';

const OrdersErrorState = ({ error, onRetry }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      // Add a small delay for better UX
      setTimeout(() => setIsRetrying(false), 1000);
    }
  };

  const getErrorDetails = (errorMessage) => {
    const errorLower = errorMessage?.toLowerCase() || '';
    
    if (errorLower.includes('network') || errorLower.includes('connection')) {
      return {
        icon: Wifi,
        title: 'Connection Problem',
        description: 'Unable to connect to the server. Please check your internet connection.',
        suggestions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Contact support if the problem persists'
        ],
        color: 'from-orange-500 to-red-500'
      };
    }
    
    if (errorLower.includes('database') || errorLower.includes('firestore')) {
      return {
        icon: Database,
        title: 'Database Error',
        description: 'There was an issue accessing the order database.',
        suggestions: [
          'This is usually temporary',
          'Try again in a few moments',
          'Contact admin if error continues'
        ],
        color: 'from-purple-500 to-pink-500'
      };
    }
    
    if (errorLower.includes('permission') || errorLower.includes('unauthorized')) {
      return {
        icon: AlertTriangle,
        title: 'Access Denied',
        description: 'You don\'t have permission to view this content.',
        suggestions: [
          'Make sure you\'re logged in',
          'Check your account permissions',
          'Contact admin for access'
        ],
        color: 'from-red-500 to-pink-500'
      };
    }
    
    if (errorLower.includes('timeout')) {
      return {
        icon: Server,
        title: 'Request Timeout',
        description: 'The request took too long to complete.',
        suggestions: [
          'Server might be busy',
          'Try again in a moment',
          'Check your connection speed'
        ],
        color: 'from-yellow-500 to-orange-500'
      };
    }
    
    // Generic error
    return {
      icon: Bug,
      title: 'Something Went Wrong',
      description: 'An unexpected error occurred while loading orders.',
      suggestions: [
        'Try refreshing the page',
        'Clear your browser cache',
        'Contact support if needed'
      ],
      color: 'from-red-500 to-purple-500'
    };
  };

  const errorDetails = getErrorDetails(error);
  const ErrorIcon = errorDetails.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        
        {/* Main Error Card */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700/30 relative overflow-hidden">
          
          {/* Animated background effect */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-r from-yellow-500/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="relative z-10 text-center">
            
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className={`p-4 bg-gradient-to-r ${errorDetails.color} rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300`}>
                <ErrorIcon className="w-12 h-12 text-white animate-pulse" />
              </div>
            </div>
            
            {/* Error Title */}
            <h1 className="text-3xl font-bold text-white mb-4">
              {errorDetails.title}
            </h1>
            
            {/* Error Description */}
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              {errorDetails.description}
            </p>
            
            {/* Error Message */}
            {error && (
              <div className="bg-gray-900/50 rounded-lg p-4 mb-6 border border-gray-600/30">
                <p className="text-red-400 font-mono text-sm break-words">
                  {error}
                </p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className={`
                  flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:opacity-50
                  ${isRetrying 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : `bg-gradient-to-r ${errorDetails.color} hover:shadow-lg hover:shadow-red-500/25`
                  }
                  text-white
                `}
              >
                <RefreshCcw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                <Home className="w-5 h-5" />
                <span>Go Home</span>
              </button>
            </div>
            
            {/* Suggestions */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
              <div className="flex items-center justify-center mb-4">
                <HelpCircle className="w-6 h-6 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">What you can try:</h3>
              </div>
              <ul className="text-gray-300 space-y-2 text-left max-w-md mx-auto">
                {errorDetails.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm mb-4">
            Still having trouble? Our support team is here to help.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.href = 'mailto:support@example.com'}
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center space-x-1"
            >
              <span>Email Support</span>
            </button>
            <span className="text-gray-600">•</span>
            <button
              onClick={() => window.open('/docs', '_blank')}
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center space-x-1"
            >
              <span>View Documentation</span>
            </button>
          </div>
        </div>
        
        {/* Back Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Go Back</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        /* Glowing effect for error icon */
        .p-4:hover {
          box-shadow: 0 0 30px rgba(239, 68, 68, 0.4);
        }
        
        /* Smooth hover animations */
        button:hover {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }
        
        /* Loading spinner enhancement */
        @keyframes enhanced-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: enhanced-spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default OrdersErrorState;