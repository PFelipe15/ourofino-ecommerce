import React from 'react';
import { Check } from 'lucide-react';

interface StepGuideProps {
  steps: string[];
  currentStep: number;
}

export const StepGuide: React.FC<StepGuideProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between mb-6 px-2">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center relative">
          <div className={`
            flex items-center justify-center w-6 h-6 rounded-full text-xs
            ${index < currentStep ? 'bg-green-500 text-white' : 
              index === currentStep ? 'bg-yellow-500 text-white' : 
              'bg-gray-200 text-gray-600'}
          `}>
            {index < currentStep ? (
              <Check size={12} />
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          <span className={`mt-1 text-xs ${index === currentStep ? 'font-semibold' : 'text-gray-500'}`}>
            {step}
          </span>
          {index < steps.length - 1 && (
            <div className={`absolute top-3 left-full w-full h-0.5 -ml-3
              ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} 
            />
          )}
        </div>
      ))}
    </div>
  );
};