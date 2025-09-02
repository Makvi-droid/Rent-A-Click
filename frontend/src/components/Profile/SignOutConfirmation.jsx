
import { LogOut, X, AlertTriangle } from 'lucide-react';

const SignOutConfirmation = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        
        {/* Content */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-3">
            Sign Out?
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Are you sure you want to sign out? You'll need to log in again to access your account and rental history.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-all duration-300 border border-gray-700 hover:border-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-500/25 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOutConfirmation