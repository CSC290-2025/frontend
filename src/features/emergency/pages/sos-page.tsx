import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/router.ts';

export default function SosPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  const handler = () => navigate('/sos/report', {});
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mt-12 flex flex-col items-center justify-center font-sans">
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
      `}</style>
      <div className="mx-auto max-w-7xl">
        <div
          className={`mb-8 text-center transition-all duration-500 ease-out sm:mb-12 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
        >
          <div className="mx-auto">
            <h1 className="mt-6 mb-6 text-3xl leading-tight font-bold text-gray-900 transition-colors duration-300 sm:mt-8 sm:mb-8 sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
              Emergency Help needed?
            </h1>

            <p className="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-gray-600 transition-colors duration-300 sm:mb-8 sm:text-lg dark:text-gray-300">
              Click the button here We will reach you soon!
            </p>

            <div
              className={`text-center ${isVisible ? 'animate-slide-up' : 'opacity-0'} mt-16`}
            >
              <button
                className="group inline h-72 w-72 cursor-pointer items-center justify-center rounded-full border-4 border-red-400 bg-red-600 px-6 py-3 text-3xl font-bold text-white transition-all duration-200 hover:scale-105 hover:bg-red-700 hover:shadow-lg sm:px-8 sm:py-4"
                onClick={handler}
                style={{
                  boxShadow:
                    '0 0 25px rgba(242, 38, 19, 1), 0 5px 15px -5px rgba(242, 38, 19, 0.9)',
                }}
              >
                SOS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
