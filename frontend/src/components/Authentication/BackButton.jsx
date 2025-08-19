import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";


export default function BackButton() {

  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/')}
      className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white transition-colors duration-200"
    >
      <ArrowLeft className="w-6 h-6" />
    </button>
  );
}