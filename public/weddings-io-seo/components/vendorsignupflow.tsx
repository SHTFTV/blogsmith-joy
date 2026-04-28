'use client';

import React, { useState } from 'react';

interface SignupStep {
  step: number;
  title: string;
  description: string;
}

interface VendorSignupProps {
  category?: string;
  city?: string;
}

export const VendorSignupFlow = ({ category, city }: VendorSignupProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    category: category || '',
    city: city || '',
    yearsInBusiness: '',
    website: '',
    talcVideoUrl: '',
  });

  const signupSteps: SignupStep[] = [
    {
      step: 1,
      title: 'Apply to Own Your Territory',
      description: 'One expert per trade, per city. Complete local dominance.',
    },
    {
      step: 2,
      title: 'Verify Your Credentials',
      description: 'We check references and past work.',
    },
    {
      step: 3,
      title: 'Submit Your Proof-of-Work',
      description: 'Upload your Talc.tv video or recent wedding clips.',
    },
    {
      step: 4,
      title: 'Get Onboarded to Your Squad',
      description: 'You\'ll be matched with complementary vendors in your city.',
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-gray-900 mb-4">
            Be THE Expert in {city || 'Your City'}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Stop competing for leads. Own your territory completely.
          </p>

          {/* The Pitch */}
          <div className="bg-white rounded-2xl border-2 border-blue-300 p-8 mb-8 text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🎯 The Pitch: Why You Should Apply
            </h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="text-3xl">👑</span>
                <div>
                  <p className="font-bold text-gray-900">Total Local Dominance</p>
                  <p className="text-gray-700">
                    We only sign ONE {category || 'vendor'} per city. You don't compete for leads. 
                    You own 100% of our referrals in {city || 'your city'}.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="text-3xl">🎬</span>
                <div>
                  <p className="font-bold text-gray-900">Automated Content Distribution</p>
                  <p className="text-gray-700">
                    Upload ONE Talc.tv video. We automatically populate it across the entire 
                    weddings.io network + 797 city pages + your local landing page.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="text-3xl">🤝</span>
                <div>
                  <p className="font-bold text-gray-900">Built-in Referral Engine</p>
                  <p className="text-gray-700">
                    We pair you with the #1 Venue + Florist + Photographer in your city. 
                    Your Power Partner squad becomes your 24/7 sales team.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="text-3xl">🤖</span>
                <div>
                  <p className="font-bold text-gray-900">AEO (Answer Engine Optimization)</p>
                  <p className="text-gray-700">
                    When couples ask AI "Who is the best {category || 'vendor'} in {city || 'my city'}?", 
                    your name appears as THE authority. Not a link. THE answer.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="text-3xl">💰</span>
                <div>
                  <p className="font-bold text-gray-900">Zero Lead Competition</p>
                  <p className="text-gray-700">
                    No bidding for position. No monthly fees. Just book the couples who 
                    want you because you're THE expert in your city.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scarcity Message */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-8">
            <p className="text-amber-900 font-bold text-lg">
              ⚠️ ONLY ONE SLOT AVAILABLE FOR {category?.toUpperCase() || 'YOUR CATEGORY'} IN {city?.toUpperCase() || 'YOUR CITY'}
            </p>
            <p className="text-amber-800 mt-2">
              {Math.floor(Math.random() * 5) + 1} other {category || 'vendors'} are being interviewed right now. 
              Move fast.
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-between mb-8">
            {signupSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${
                    currentStep >= idx
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {idx + 1}
                </div>
                <p className="text-sm font-semibold text-gray-900 text-center">
                  {step.title}
                </p>
              </div>
            ))}
          </div>

          {/* Connecting Line */}
          <div className="w-full h-1 bg-gray-300 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{
                width: `${((currentStep + 1) / signupSteps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 mb-8">
          {currentStep === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {signupSteps[0].title}
              </h2>
              <p className="text-gray-600 mb-6">{signupSteps[0].description}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Your business name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select your trade</option>
                      <option value="Venue">Venue</option>
                      <option value="Florist">Florist</option>
                      <option value="Photographer">Photographer</option>
                      <option value="Caterer">Caterer</option>
                      <option value="Planner">Wedding Planner</option>
                      <option value="DJ">DJ/Entertainment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      City
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select your city</option>
                      <option value="Abbotsford">Abbotsford</option>
                      <option value="New York">New York</option>
                      <option value="Toronto">Toronto</option>
                      <option value="Los Angeles">Los Angeles</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {signupSteps[1].title}
              </h2>
              <p className="text-gray-600 mb-6">{signupSteps[1].description}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Years in Business
                  </label>
                  <input
                    type="number"
                    name="yearsInBusiness"
                    value={formData.yearsInBusiness}
                    onChange={handleInputChange}
                    placeholder="e.g., 10"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://your-website.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <p className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                  We'll verify your credentials through references and past work. 
                  This ensures we only list the absolute best vendors.
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {signupSteps[2].title}
              </h2>
              <p className="text-gray-600 mb-6">{signupSteps[2].description}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Talc.tv Video URL
                  </label>
                  <input
                    type="url"
                    name="talcVideoUrl"
                    value={formData.talcVideoUrl}
                    onChange={handleInputChange}
                    placeholder="https://talc.tv/vendor-name-event-001"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Don't have a Talc.tv account? <a href="https://talc.tv" className="text-blue-600 font-semibold">Sign up free here</a>
                  </p>
                </div>

                <p className="text-sm text-gray-600 bg-amber-50 p-4 rounded-lg border-l-4 border-amber-300">
                  <strong>Why we require video proof:</strong> AI trusts real video proof over staged photos. 
                  Your Talc.tv clips will be auto-distributed across all our city pages and shown to every couple searching for your trade.
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {signupSteps[3].title}
              </h2>
              <p className="text-gray-600 mb-6">{signupSteps[3].description}</p>

              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <p className="text-green-900 font-bold text-lg mb-4">
                  ✅ You're Being Matched With Your Power Partners
                </p>
                <p className="text-green-800 mb-4">
                  In {city || 'your city'}, you'll be working exclusively with:
                </p>
                <ul className="space-y-2 text-green-800 mb-6">
                  <li>✅ The #1 Venue Expert</li>
                  <li>✅ The #1 Florist Specialist</li>
                  <li>✅ The #1 Photography Professional</li>
                </ul>
                <p className="text-sm text-green-700">
                  You'll get an exclusive briefing call next week to meet your squad and discuss how you'll refer to each other.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                currentStep === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              ← Back
            </button>

            <button
              onClick={() => setCurrentStep(Math.min(signupSteps.length - 1, currentStep + 1))}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {currentStep === signupSteps.length - 1 ? 'Complete Application' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Final CTA */}
        {currentStep === signupSteps.length - 1 && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Own {city || 'Your City'}?</h3>
            <p className="mb-6 text-lg">
              We'll have our team contact you within 24 hours to confirm your spot and get you onboarded.
            </p>
            <button className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-gray-100 transition">
              Apply Now & Lock Your Slot
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorSignupFlow;
