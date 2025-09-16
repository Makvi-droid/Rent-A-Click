// CheckoutTrustIndicators.jsx
import React from "react";
import { Lock, Package, Check } from "lucide-react";

const CheckoutTrustIndicators = () => (
  <div className="mt-12 text-center">
    <div className="flex justify-center items-center space-x-8 text-gray-400 text-sm">
      <div className="flex items-center space-x-2">
        <Lock size={16} />
        <span>Secure Payment</span>
      </div>
      <div className="flex items-center space-x-2">
        <Package size={16} />
        <span>Professional Equipment</span>
      </div>
      <div className="flex items-center space-x-2">
        <Check size={16} />
        <span>24/7 Support</span>
      </div>
    </div>
  </div>
);


export default CheckoutTrustIndicators