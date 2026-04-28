'use client';

import React, { useState } from 'react';

interface VendorSlot {
  category: string;
  status: 'TAKEN' | 'OPEN' | 'WAITLIST';
  vendorName?: string;
  vendorRating?: number;
  yearsInBusiness?: number;
}

interface CityVendorStatus {
  city: string;
  region: string;
  population: number;
  slots: VendorSlot[];
  lastUpdated: string;
}

// Sample data for multiple cities
const cityStatusData: CityVendorStatus[] = [
  {
    city: 'Abbotsford',
    region: 'BC',
    population: 141000,
    slots: [
      {
        category: 'Venue',
        status: 'TAKEN',
        vendorName: 'The Glass House',
        vendorRating: 4.9,
        yearsInBusiness: 8,
      },
      {
        category: 'Florist',
        status: 'TAKEN',
        vendorName: 'Wild Bloom Studio',
        vendorRating: 4.8,
        yearsInBusiness: 6,
      },
      {
        category: 'Photographer',
        status: 'OPEN',
      },
      {
        category: 'Caterer',
        status: 'WAITLIST',
      },
      {
        category: 'Planner',
        status: 'OPEN',
      },
      {
        category: 'DJ/Entertainment',
        status: 'TAKEN',
        vendorName: 'Pulse Entertainment',
        vendorRating: 4.7,
        yearsInBusiness: 12,
      },
    ],
    lastUpdated: '2026-04-24',
  },
  {
    city: 'New York',
    region: 'NY',
    population: 8300000,
    slots: [
      {
        category: 'Venue',
        status: 'TAKEN',
        vendorName: 'Elegant Weddings NY',
        vendorRating: 4.9,
        yearsInBusiness: 18,
      },
      {
        category: 'Florist',
        status: 'TAKEN',
        vendorName: 'Wild Bloom NYC',
        vendorRating: 4.8,
        yearsInBusiness: 15,
      },
      {
        category: 'Photographer',
        status: 'TAKEN',
        vendorName: 'Golden Hour Photography',
        vendorRating: 4.9,
        yearsInBusiness: 16,
      },
      {
        category: 'Caterer',
        status: 'TAKEN',
        vendorName: 'Maharani Catering',
        vendorRating: 4.9,
        yearsInBusiness: 20,
      },
      {
        category: 'Planner',
        status: 'TAKEN',
        vendorName: 'Elegant Weddings NY',
        vendorRating: 4.9,
        yearsInBusiness: 18,
      },
      {
        category: 'DJ/Entertainment',
        status: 'WAITLIST',
      },
    ],
    lastUpdated: '2026-04-24',
  },
  {
    city: 'Toronto',
    region: 'ON',
    population: 2930000,
    slots: [
      {
        category: 'Venue',
        status: 'TAKEN',
        vendorName: 'Toronto Wedding Venue',
        vendorRating: 4.8,
        yearsInBusiness: 10,
      },
      {
        category: 'Florist',
        status: 'TAKEN',
        vendorName: 'GTA Flowers & Florals',
        vendorRating: 4.8,
        yearsInBusiness: 16,
      },
      {
        category: 'Photographer',
        status: 'OPEN',
      },
      {
        category: 'Caterer',
        status: 'OPEN',
      },
      {
        category: 'Planner',
        status: 'TAKEN',
        vendorName: 'Toronto Weddings by Ananya',
        vendorRating: 4.9,
        yearsInBusiness: 19,
      },
      {
        category: 'DJ/Entertainment',
        status: 'OPEN',
      },
    ],
    lastUpdated: '2026-04-24',
  },
];

interface StatusTrackerProps {
  city?: string;
  showAllCities?: boolean;
}

export const VendorStatusTracker = ({
  city,
  showAllCities = true,
}: StatusTrackerProps) => {
  const [selectedCity, setSelectedCity] = useState<CityVendorStatus | null>(
    city ? cityStatusData.find(c => c.city === city) || cityStatusData[0] : cityStatusData[0]
  );

  const getStatusColor = (
    status: 'TAKEN' | 'OPEN' | 'WAITLIST'
  ): string => {
    switch (status) {
      case 'TAKEN':
        return 'bg-green-100 border-green-300 text-green-900';
      case 'OPEN':
        return 'bg-blue-100 border-blue-300 text-blue-900';
      case 'WAITLIST':
        return 'bg-amber-100 border-amber-300 text-amber-900';
      default:
        return 'bg-gray-100';
    }
  };

  const getStatusIcon = (status: 'TAKEN' | 'OPEN' | 'WAITLIST'): string => {
    switch (status) {
      case 'TAKEN':
        return '✅';
      case 'OPEN':
        return '🔓';
      case 'WAITLIST':
        return '⏳';
      default:
        return '❓';
    }
  };

  const calculateFilledSlots = (slots: VendorSlot[]): number => {
    return slots.filter(s => s.status === 'TAKEN').length;
  };

  const calculateCompletion = (slots: VendorSlot[]): number => {
    return Math.round((calculateFilledSlots(slots) / slots.length) * 100);
  };

  return (
    <div className="w-full bg-gradient-to-b from-white to-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-serif text-gray-900 mb-4">
            The Exclusive City Hub System
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl">
            We only sign ONE expert per trade per city. Scarcity creates quality. 
            Our vendors own their territory completely.
          </p>
        </div>

        {/* City Selector (if showing multiple) */}
        {showAllCities && cityStatusData.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-3">
            {cityStatusData.map((c) => (
              <button
                key={c.city}
                onClick={() => setSelectedCity(c)}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  selectedCity?.city === c.city
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {c.city}, {c.region}
              </button>
            ))}
          </div>
        )}

        {selectedCity && (
          <>
            {/* City Header */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {selectedCity.city}, {selectedCity.region}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Population: {selectedCity.population.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-blue-600">
                    {calculateCompletion(selectedCity.slots)}%
                  </p>
                  <p className="text-gray-600 text-sm">Squad Complete</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all"
                  style={{
                    width: `${calculateCompletion(selectedCity.slots)}%`,
                  }}
                />
              </div>

              <p className="text-sm text-gray-600 mt-3">
                {calculateFilledSlots(selectedCity.slots)} of {selectedCity.slots.length} positions filled
              </p>
            </div>

            {/* Vendor Slots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedCity.slots.map((slot, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border-2 p-6 transition-all hover:shadow-lg ${getStatusColor(
                    slot.status
                  )}`}
                >
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{getStatusIcon(slot.status)}</span>
                    <span className="font-bold text-sm uppercase tracking-wider">
                      {slot.status}
                    </span>
                  </div>

                  {/* Category */}
                  <h4 className="text-lg font-bold mb-3">{slot.category}</h4>

                  {/* Vendor Info (if taken) */}
                  {slot.status === 'TAKEN' && slot.vendorName && (
                    <>
                      <p className="font-semibold text-gray-900 mb-2">
                        {slot.vendorName}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="font-bold text-lg">
                            {slot.vendorRating}★
                          </span>
                        </div>
                        <div className="text-gray-700">
                          {slot.yearsInBusiness}+ years
                        </div>
                      </div>
                    </>
                  )}

                  {/* Call-to-Action */}
                  {slot.status === 'OPEN' && (
                    <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm">
                      Apply to Join Squad →
                    </button>
                  )}

                  {slot.status === 'WAITLIST' && (
                    <button className="w-full mt-4 bg-amber-600 text-white py-2 rounded-lg font-semibold hover:bg-amber-700 transition text-sm">
                      Join Waitlist →
                    </button>
                  )}

                  {slot.status === 'TAKEN' && (
                    <button className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition text-sm">
                      View Profile →
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Vendor Pitch Section */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Own Your Territory?
              </h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                We're looking for the #1 {'{category}'} expert in {selectedCity.city}. 
                One vendor per trade. Total local dominance. Built-in referral engine from 
                our Power Partner system.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="font-bold text-blue-900 mb-2">💰 Your Advantage</p>
                  <p className="text-sm text-gray-700">
                    No competition for leads. You own all {'{category}'} referrals in {selectedCity.city}.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="font-bold text-blue-900 mb-2">📱 Automated Distribution</p>
                  <p className="text-sm text-gray-700">
                    Upload one Talc.tv video. It populates across all our city pages + partner networks.
                  </p>
                </div>
              </div>

              <button className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition">
                Apply to Be the #1 in {selectedCity.city} →
              </button>
            </div>
          </>
        )}

        {/* Bottom CTA for Couples */}
        <div className="mt-12 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            For Couples: Your City's Curated Squad
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            No random browsing. No mismatches. We've pre-screened, pre-matched, 
            and pre-coordinated the best vendors in your city to work together perfectly.
          </p>
          <button className="px-8 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition">
            See My City's Squad →
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorStatusTracker;
