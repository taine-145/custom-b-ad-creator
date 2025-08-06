"use client";

import { useState } from 'react';

interface PaymentMethod {
  payId: string | number;
  payType: string;
  identifier: string;
  tradeMethodName?: string;
  iconUrlColor?: string;
  fields?: Record<string, unknown>;
}

export default function BinanceAdCreator() {
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [buyAdId, setBuyAdId] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayId, setSelectedPayId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [adCreated, setAdCreated] = useState(false);
  
  // Advanced filters (editable) - Default -1 means no restriction
  const [advancedFilters, setAdvancedFilters] = useState({
    userAllTradeCountMax: -1,
    userAllTradeCountMin: -1,
    userBuyTradeCountMax: -1,
    userBuyTradeCountMin: -1,
    userSellTradeCountMax: -1,
    userSellTradeCountMin: -1,
    userTradeCompleteCountMin: -1,
    userTradeCompleteRateMin: -1,
    userTradeCompleteRateFilterTime: 2,
    userTradeCountFilterTime: 2
  });

  // Fixed defaults (non-editable)
  const fixedDefaults = {
    asset: 'USDT',
    buyerKycLimit: 1,
    fiatUnit: 'ZAR',
    initAmount: 100,
    minSingleTransAmount: 1000,
    maxSingleTransAmount: 20000,
    price: 25.00,
    priceType: 1,
    tradeType: 'SELL',
    classify: 'profession',
    onlineNow: false,
    takerAdditionalKycRequired: 0
  };

  const fetchPaymentMethods = async () => {
    if (!apiKey || !secretKey || !buyAdId) {
      setMessage('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/binance/get-ad-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, secretKey, adId: buyAdId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payment methods');
      }
      
      if (data.data && data.data.tradeMethods) {
        setPaymentMethods(data.data.tradeMethods);
        setMessage(`Found ${data.data.tradeMethods.length} payment method(s)`);
      } else {
        setMessage('No payment methods found for this ad');
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const createAd = async () => {
    if (!selectedPayId) {
      setMessage('Please select a payment method');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const adData = {
        ...fixedDefaults,
        ...advancedFilters,
        payId: selectedPayId,
        tradeMethods: [{
          identifier: 'BankTransfer',
          payId: selectedPayId,
          payType: 'BANK_TRANSFER'
        }]
      };

      const response = await fetch('/api/binance/create-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, secretKey, adData })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create ad');
      }

      setMessage('Ad created successfully!');
      setAdCreated(true);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = apiKey && secretKey && selectedPayId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Binance C2C Ad Creator
        </h1>
        <p className="text-center text-gray-600 mb-8">Create P2P ads with advanced buyer filters</p>

        {/* Linear Layout - All sections stacked */}
        <div className="space-y-6">
          
          {/* Step 1: API Credentials */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Step 1: API Credentials
            </h2>

            {/* API Key Security Notice */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 font-semibold mb-2">
                How to Create Your API Key:
              </p>
              <ol className="text-sm text-red-700 space-y-2 list-decimal list-inside">
                <li>
                  Go to: <a 
                    href="https://www.binance.com/en/my/settings/api-management" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-700 underline hover:text-blue-800"
                  >
                    https://www.binance.com/en/my/settings/api-management
                  </a>
                </li>
                <li>Click &quot;Create API&quot; then &quot;System Generated&quot;</li>
                <li>IMPORTANT: Leave the default permissions (do NOT manually select permissions)</li>
                <li>Complete the security verification</li>
                <li>Copy and paste your API Key and Secret Key below</li>
                <li>DELETE this API key immediately after creating your ad for security</li>
              </ol>
              <p className="text-xs text-red-600 mt-2">
                Never reuse API keys. Always create fresh ones for each ad creation session.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter your Binance API Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter your Binance Secret Key"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Step 2: Payment Method Selection
            </h2>

            {/* Payment Method Requirements */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 font-semibold mb-1">
                Required: You MUST have an existing ad with payment methods
              </p>
              <p className="text-xs text-yellow-700">
                We need to extract your payment methods from one of your existing ads. You cannot create an ad without selecting a payment method that you have already set up on Binance.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Existing BUY Ad ID <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={buyAdId}
                    onChange={(e) => setBuyAdId(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="e.g., 13753690538259550208"
                  />
                  <button
                    onClick={fetchPaymentMethods}
                    disabled={loading || !apiKey || !secretKey || !buyAdId}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 font-medium"
                  >
                    {loading ? 'Loading...' : 'Fetch Methods'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter any of your existing BUY ad IDs to extract your saved payment methods. You must fetch and select a payment method before proceeding.
                </p>
              </div>

              {/* Payment Methods List */}
              {paymentMethods.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Payment Method <span className="text-red-500">*</span>
                  </label>
                  <div className="grid gap-2">
                    {paymentMethods.map((method, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedPayId(String(method.payId))}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedPayId === String(method.payId)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">
                              {method.tradeMethodName || method.identifier || method.payType}
                            </div>
                            <div className="text-xs text-gray-500">ID: {method.payId}</div>
                          </div>
                          {selectedPayId === String(method.payId) && (
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Fixed Settings Display */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Step 3: Ad Settings (Fixed)
            </h2>

            {/* Explanation of Fixed Settings */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Why these settings are fixed:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>Ad is created with a high price (25.00) to prevent immediate orders</li>
                <li>Ad is created offline so you can edit it before going live</li>
                <li>These are temporary values - you will adjust them on Binance</li>
                <li>The HIDDEN FILTERS you set in Step 4 will persist even after editing</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Asset:</span>
                    <span className="font-medium">{fixedDefaults.asset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fiat:</span>
                    <span className="font-medium">{fixedDefaults.fiatUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trade Type:</span>
                    <span className="font-medium">{fixedDefaults.tradeType}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">{fixedDefaults.price} {fixedDefaults.fiatUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-medium">{fixedDefaults.initAmount} {fixedDefaults.asset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">KYC:</span>
                    <span className="font-medium">{fixedDefaults.buyerKycLimit === 1 ? 'Required' : 'Not Required'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min Order:</span>
                    <span className="font-medium">{fixedDefaults.minSingleTransAmount} {fixedDefaults.fiatUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Order:</span>
                    <span className="font-medium">{fixedDefaults.maxSingleTransAmount} {fixedDefaults.fiatUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Online:</span>
                    <span className="font-medium">No</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                These settings cannot be changed here. Modify them later on Binance.
              </p>
            </div>
          </div>

          {/* Step 4: Advanced Buyer Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Step 4: Advanced Buyer Filters (Hidden Settings)
            </h2>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-800 mb-3">
                <strong>Important:</strong> These hidden filters let you precisely control who can trade with you. 
                Most traders don&apos;t know these settings exist.
              </p>
              <p className="text-sm text-purple-700">
                <strong>How filters work together:</strong>
              </p>
              <ul className="text-sm text-purple-700 mt-2 space-y-1 list-disc list-inside">
                <li>You can use EITHER total trade filters OR separate buy/sell filters</li>
                <li>Total trades = buy trades + sell trades combined</li>
                <li>Set value to -1 to disable any filter (allow all)</li>
                <li>Filters work with AND logic - buyer must meet ALL criteria you set</li>
              </ul>
              <div className="bg-purple-100 rounded p-2 mt-3">
                <p className="text-xs text-purple-900 font-semibold">
                  THESE SETTINGS PERSIST: Once set, these hidden filters remain active even when you edit your ad on Binance. They cannot be changed through the normal Binance interface.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* All Trades Filter */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-800 mb-3">Total Trade Requirements (Buy + Sell Combined)</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum All Trades
                    </label>
                    <input
                      type="number"
                      value={advancedFilters.userAllTradeCountMin}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, userAllTradeCountMin: parseInt(e.target.value) || -1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                      disabled={!selectedPayId}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Example:</strong> Set to 100000 to only allow users who have completed at least 100,000 total trades (buy + sell combined). Set to -1 to allow all users regardless of trade count.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum All Trades
                    </label>
                    <input
                      type="number"
                      value={advancedFilters.userAllTradeCountMax}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, userAllTradeCountMax: parseInt(e.target.value) || -1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                      disabled={!selectedPayId}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Example:</strong> Set to 1000000 or -1 to have no upper limit. Set to 500 to exclude users with more than 500 total trades (useful for avoiding professional traders).
                    </p>
                  </div>
                </div>
              </div>

              {/* Buy Trades Filter */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-800 mb-3">Buy Trade Requirements Only</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Buy Trades
                    </label>
                    <input
                      type="number"
                      value={advancedFilters.userBuyTradeCountMin}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, userBuyTradeCountMin: parseInt(e.target.value) || -1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                      disabled={!selectedPayId}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Example:</strong> Set to 50 to require users to have completed at least 50 buy trades. Set to -1 to ignore buy trade history. This filter is independent of total trade count.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Buy Trades
                    </label>
                    <input
                      type="number"
                      value={advancedFilters.userBuyTradeCountMax}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, userBuyTradeCountMax: parseInt(e.target.value) || -1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                      disabled={!selectedPayId}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Example:</strong> Set to 500 to exclude users with more than 500 buy trades. Set to -1 for no limit. Useful for avoiding bulk buyers or professional traders.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sell Trades Filter */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-gray-800 mb-3">Sell Trade Requirements Only</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Sell Trades
                    </label>
                    <input
                      type="number"
                      value={advancedFilters.userSellTradeCountMin}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, userSellTradeCountMin: parseInt(e.target.value) || -1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 transition"
                      disabled={!selectedPayId}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Example:</strong> Set to -1 to allow all users regardless of sell history. Set to 20 to require at least 20 completed sell trades. This works independently of buy trade filters.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Sell Trades
                    </label>
                    <input
                      type="number"
                      value={advancedFilters.userSellTradeCountMax}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, userSellTradeCountMax: parseInt(e.target.value) || -1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 transition"
                      disabled={!selectedPayId}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Example:</strong> Set to 100 to exclude users with more than 100 sell trades (likely professional sellers). Set to -1 for no upper limit.
                    </p>
                  </div>
                </div>
              </div>

              {/* Completion Rate & Time Filter */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-800 mb-3">Completion Rate & Time Period</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Completed Trades
                    </label>
                    <input
                      type="number"
                      value={advancedFilters.userTradeCompleteCountMin}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, userTradeCompleteCountMin: parseInt(e.target.value) || -1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition"
                      disabled={!selectedPayId}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Example:</strong> Set to 10 to require at least 10 successfully completed trades. Set to -1 to ignore completion count. This counts only trades that were completed, not cancelled.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Completion Rate %
                    </label>
                    <input
                      type="number"
                      value={advancedFilters.userTradeCompleteRateMin}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, userTradeCompleteRateMin: parseInt(e.target.value) || -1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition"
                      disabled={!selectedPayId}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Example:</strong> Set to 95 to require a 95% or higher completion rate. Set to -1 to ignore completion rate. This percentage is calculated from completed trades vs total initiated trades.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trade Count Time Filter
                    </label>
                    <select
                      value={advancedFilters.userTradeCountFilterTime}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, userTradeCountFilterTime: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition"
                      disabled={!selectedPayId}
                    >
                      <option value={0}>All time history</option>
                      <option value={1}>Last 30 days only</option>
                      <option value={2}>All time history</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Determines which time period to consider when counting trades. Option 2 (All time) is recommended for maximum history.
                    </p>
                  </div>
                </div>
              </div>

              {/* Filter Summary */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Your Current Filter Settings:</h4>
                <div className="text-sm text-yellow-800 space-y-2">
                  <div>
                    <strong>Total Trade Requirements:</strong>
                    <ul className="ml-4 mt-1">
                      <li>Minimum: {advancedFilters.userAllTradeCountMin === -1 ? 'No restriction' : `${advancedFilters.userAllTradeCountMin.toLocaleString()} trades required`}</li>
                      <li>Maximum: {advancedFilters.userAllTradeCountMax === -1 ? 'No restriction' : `${advancedFilters.userAllTradeCountMax.toLocaleString()} trades maximum`}</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Buy Trade Requirements:</strong>
                    <ul className="ml-4 mt-1">
                      <li>Minimum: {advancedFilters.userBuyTradeCountMin === -1 ? 'No restriction' : `${advancedFilters.userBuyTradeCountMin} buy trades required`}</li>
                      <li>Maximum: {advancedFilters.userBuyTradeCountMax === -1 ? 'No restriction' : `${advancedFilters.userBuyTradeCountMax} buy trades maximum`}</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Sell Trade Requirements:</strong>
                    <ul className="ml-4 mt-1">
                      <li>Minimum: {advancedFilters.userSellTradeCountMin === -1 ? 'No restriction' : `${advancedFilters.userSellTradeCountMin} sell trades required`}</li>
                      <li>Maximum: {advancedFilters.userSellTradeCountMax === -1 ? 'No restriction' : `${advancedFilters.userSellTradeCountMax} sell trades maximum`}</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Other Requirements:</strong>
                    <ul className="ml-4 mt-1">
                      <li>Completion rate: {advancedFilters.userTradeCompleteRateMin === -1 ? 'No restriction' : `${advancedFilters.userTradeCompleteRateMin}% minimum`}</li>
                      <li>Time period: {advancedFilters.userTradeCountFilterTime === 1 ? 'Last 30 days only' : 'All time history'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5: Create Ad Button */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <button
              onClick={createAd}
              disabled={loading || !isFormValid}
              className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition duration-200 ${
                isFormValid && !loading
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? 'Creating Your Ad...' : 'Create Ad with Hidden Filters'}
            </button>

            {!isFormValid && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Complete all steps above to enable ad creation
              </p>
            )}
          </div>

          {/* Success Actions */}
          {adCreated && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
              <h3 className="font-semibold text-green-900 mb-3 text-lg">Ad Created Successfully</h3>
              
              {/* Critical Action Required */}
              <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 font-semibold">
                  IMMEDIATE ACTION REQUIRED: DELETE YOUR API KEY NOW!
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Go to Binance API Management and delete the API key you just used for security.
                </p>
              </div>

              <p className="text-sm text-green-800 mb-4">
                Your ad has been created OFFLINE with the hidden filters. These advanced filters will persist even when you edit the ad on Binance.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800 font-semibold mb-1">
                  Important: Your hidden filters are now active
                </p>
                <p className="text-xs text-yellow-700">
                  The buyer requirements you set will remain active even after you edit the price, amounts, and other visible settings on Binance. Only buyers meeting your criteria can see and trade with your ad.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 font-medium mb-2">Next steps on Binance:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>1. Adjust your price to market rate (currently set high at 25.00)</li>
                  <li>2. Set your actual min/max order amounts</li>
                  <li>3. Add your trading terms and conditions</li>
                  <li>4. Add additional payment methods if needed</li>
                  <li>5. Turn your ad online when ready</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open('https://p2p.binance.com/en/myads', '_blank')}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Go to Binance P2P
                </button>
                <button
                  onClick={() => {
                    setAdCreated(false);
                    setSelectedPayId('');
                    setPaymentMethods([]);
                    setBuyAdId('');
                    setMessage('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Create Another Ad
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg text-center font-medium ${
            message.toLowerCase().includes('error') 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : message.toLowerCase().includes('success') || message.toLowerCase().includes('found')
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
