// IDRequirementNotice.jsx - Component to display ID requirements and accepted IDs
import React from "react";
import { Info, CreditCard } from "lucide-react";

const IDRequirementNotice = () => {
  const acceptedIDs = [
    "Driver's License",
    "Passport", 
    "National ID",
    "SSS/GSIS ID",
    "Voter's ID",
    "PRC ID",
    "PhilSys ID",
    "Senior Citizen ID"
  ];

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Info className="text-amber-400" size={16} />
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <h4 className="text-amber-300 font-medium text-sm mb-2">
              Accepted Government-Issued IDs:
            </h4>
            <div className="grid grid-cols-2 gap-1 text-xs text-amber-200/90">
              {acceptedIDs.map((id, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <CreditCard size={12} className="text-amber-400/70 flex-shrink-0" />
                  <span>{id}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-amber-500/20 pt-3">
            <h4 className="text-amber-300 font-medium text-sm mb-1">
              Important Notes:
            </h4>
            <ul className="text-amber-200/80 text-xs space-y-1">
              <li>• ID must be valid and not expired</li>
              <li>• Photo must be clear and readable</li>
              <li>• You must bring the physical ID for pickup/delivery</li>
              <li>• Name on ID must match your rental details</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDRequirementNotice;