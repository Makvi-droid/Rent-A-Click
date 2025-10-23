// ========================================
// components/HelpSupport/SupportFeatureCard.jsx
// ========================================
export const SupportFeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300">
      <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 text-pink-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/70">{description}</p>
    </div>
  );
};
