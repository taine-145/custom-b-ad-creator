"use client";

import { useState, useEffect } from 'react';
import BinanceAdCreator from './binance-ad-creator';

export default function Home() {
  const [disclaimerAcknowledged, setDisclaimerAcknowledged] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [canAcknowledge, setCanAcknowledge] = useState(false);

  useEffect(() => {
    if (disclaimerAcknowledged) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setCanAcknowledge(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [disclaimerAcknowledged]);

  if (disclaimerAcknowledged) {
    return <BinanceAdCreator />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 flex items-center justify-center">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Binance C2C Ad Creator
            </h1>
            <p className="text-gray-600">Advanced P2P Ad Creation with Hidden Buyer Filters</p>
          </div>

          {/* API Security & Risk Disclaimer */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 shadow-sm mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                  Important: API Key Usage & Temporary Access Disclaimer
                </h3>
                <div className="text-sm text-yellow-700 space-y-3">
                  <p>
                    <strong>To create your ad, you must share your API credentials.</strong> This temporarily grants our system access to your Binance account for the sole purpose of retrieving your available payment methods and creating a single ad with your specified filters.
                  </p>
                  
                  <div className="bg-yellow-100 rounded-md p-4 my-4">
                    <p className="text-yellow-800 font-medium mb-2">Security Measures & Limitations:</p>
                    <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                      <li><strong>No Storage:</strong> Your API keys are never stored or persisted anywhere - they are only used to forward requests to Binance</li>
                      <li><strong>Default Permissions:</strong> Binance's default API permissions prevent withdrawals and most trading activities</li>
                      <li><strong>Immediate Deletion:</strong> You should delete your API key immediately after creating your ad</li>
                    </ul>
                  </div>

                  <p>
                    <strong>Your Responsibility:</strong> We strongly recommend keeping Binance's default API permissions unchanged. However, by using this service, you acknowledge the temporary security risk involved.
                  </p>
                  
                  <p className="bg-yellow-200 rounded-md p-3 text-yellow-900 font-medium">
                    <strong>This tool is optional.</strong> It exists to help prevent bad actors from responding to your ads by implementing advanced buyer filters that are otherwise difficult to configure. No one is forcing you to use it - the choice is entirely yours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Acknowledgment Section */}
          <div className="text-center">
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Please read the disclaimer above carefully. By proceeding, you acknowledge that you understand the risks and agree to use this tool at your own discretion.
              </p>
              
              {!canAcknowledge && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 font-medium">
                    Please wait {timeRemaining} second{timeRemaining !== 1 ? 's' : ''} before you can proceed...
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${((10 - timeRemaining) / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setDisclaimerAcknowledged(true)}
                disabled={!canAcknowledge}
                className={`w-full py-4 px-8 rounded-lg font-semibold text-lg transition duration-200 ${
                  canAcknowledge
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {canAcknowledge ? 'I Understand & Acknowledge' : 'Please Wait...'}
              </button>
              
              <button
                onClick={() => window.close()}
                className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 font-medium"
              >
                Exit - I Don't Want to Use This Tool
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}