// ========================================
// components/HelpSupport/ContactForm.jsx
// ========================================
import { Send, CheckCircle, MessageCircle } from "lucide-react";

export const ContactForm = ({
  currentUser,
  customerData,
  formData,
  onFormChange,
  onSubmit,
  isSubmitting,
  submitStatus,
}) => {
  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Send Us a Message
        </h2>
        <p className="text-lg text-white/70 max-w-2xl mx-auto">
          Have a specific concern? Fill out the form below and we'll get back to
          you as soon as possible.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
        <div className="space-y-6">
          {/* User Info Display */}
          {currentUser && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white/70 text-sm mb-1">Sending as:</p>
              <p className="text-white font-medium">
                {customerData?.fullName || currentUser.displayName || "User"}
              </p>
              <p className="text-white/60 text-sm">{currentUser.email}</p>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-white mb-2 font-medium">
              Subject <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => onFormChange("subject", e.target.value)}
              placeholder="Brief description of your concern"
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-white mb-2 font-medium">
              Message <span className="text-pink-400">*</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => onFormChange("message", e.target.value)}
              placeholder="Describe your concern in detail..."
              rows="6"
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
            />
          </div>

          {/* Submit Status */}
          {submitStatus && (
            <div
              className={`flex items-center space-x-3 p-4 rounded-xl ${
                submitStatus.type === "success"
                  ? "bg-green-500/20 border border-green-500/30"
                  : "bg-red-500/20 border border-red-500/30"
              }`}
            >
              {submitStatus.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              ) : (
                <MessageCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
              <p
                className={`text-sm ${
                  submitStatus.type === "success"
                    ? "text-green-300"
                    : "text-red-300"
                }`}
              >
                {submitStatus.message}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !currentUser}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </>
            )}
          </button>

          {!currentUser && (
            <p className="text-center text-white/60 text-sm">
              Please sign in to send a message
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
