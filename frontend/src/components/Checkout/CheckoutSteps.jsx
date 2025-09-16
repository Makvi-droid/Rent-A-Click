import React from "react";
import { Calendar, User, DollarSign, Check } from "lucide-react";

const CheckoutSteps = ({ currentStep }) => {
  const steps = [
    { number: 1, title: "Rental Details", icon: Calendar },
    { number: 2, title: "Customer Info", icon: User },
    { number: 3, title: "Payment", icon: DollarSign },
    { number: 4, title: "Review", icon: Check },
  ];

  return (
    <div className="flex justify-center mb-12">
      <div className="flex items-center space-x-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center space-x-3 transition-all duration-300 ${
                  isActive
                    ? "text-purple-400"
                    : isCompleted
                    ? "text-green-400"
                    : "text-gray-500"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 border-purple-400 shadow-lg shadow-purple-500/50"
                      : isCompleted
                      ? "bg-green-500 border-green-400"
                      : "border-gray-600 bg-gray-800"
                  }`}
                >
                  {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                </div>
                <span className="font-medium hidden md:block">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                    isCompleted ? "bg-green-400" : "bg-gray-700"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutSteps;