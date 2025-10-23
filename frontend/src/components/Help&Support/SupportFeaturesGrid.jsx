// ========================================
// components/HelpSupport/SupportFeaturesGrid.jsx
// ========================================
import { SupportFeatureCard } from "./SupportFeatureCard";
export const SupportFeaturesGrid = ({ features }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {features.map((feature, index) => (
        <SupportFeatureCard
          key={index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </div>
  );
};
