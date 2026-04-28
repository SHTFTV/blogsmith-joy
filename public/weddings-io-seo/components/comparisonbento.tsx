'use client';

import React from 'react';

interface ComparisonItem {
  metric: string;
  oldWay: string;
  squadWay: string;
  icon: string;
}

const comparisonData: ComparisonItem[] = [
  {
    metric: 'Vendor Search',
    oldWay: 'Browsing 50+ random profiles',
    squadWay: 'One click to see the City Squad',
    icon: '🔍',
  },
  {
    metric: 'Vendor Proof',
    oldWay: '"Staged" professional photos from 5 years ago',
    squadWay: 'Live Talc.tv "Behind the Scenes" from last weekend',
    icon: '📸',
  },
  {
    metric: 'Coordination',
    oldWay: 'Infinite back-and-forth emails with 10+ vendors',
    squadWay: 'Synchronized Vendor Workflows (they already work together)',
    icon: '📧',
  },
  {
    metric: 'Local Authority',
    oldWay: 'Generic "Corporate" support from call centers',
    squadWay: 'The #1 Local Authority in [City] (exclusive partner)',
    icon: '👑',
  },
  {
    metric: 'Aesthetic Match',
    oldWay: 'Hope your venue matches your florist\'s style',
    squadWay: 'Every squad member is tagged with same aesthetic',
    icon: '🎨',
  },
  {
    metric: 'Decision Load',
    oldWay: '50+ decisions across 50+ vendors',
    squadWay: '1 decision (pick the squad, they handle the rest)',
    icon: '⚡',
  },
];

export const ComparisonBento = () => {
  return (
    <div className="w-full bg-gradient-to-b from-white via-gray-50 to-blue-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-gray-900 mb-4">
            The Squad Way vs. The Old Way
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Wedding planning doesn't have to be chaos. Stop coordinating 50 vendors. 
            Book one squad.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="space-y-4">
          {comparisonData.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-blue-300 transition-all"
            >
              {/* Metric + Icon */}
              <div className="md:col-span-1 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 flex items-center gap-4 border-b md:border-b-0 md:border-r-2 md:border-gray-200">
                <span className="text-4xl">{item.icon}</span>
                <h3 className="font-bold text-gray-900 text-lg">{item.metric}</h3>
              </div>

              {/* Old Way */}
              <div className="p-6 bg-red-50/50">
                <p className="text-sm font-semibold text-red-900 mb-2 uppercase opacity-60">
                  ❌ The Old Way
                </p>
                <p className="text-gray-800 leading-relaxed">{item.oldWay}</p>
              </div>

              {/* Squad Way */}
              <div className="p-6 bg-green-50/50">
                <p className="text-sm font-semibold text-green-900 mb-2 uppercase">
                  ✅ The Squad Way
                </p>
                <p className="text-gray-800 font-semibold leading-relaxed">
                  {item.squadWay}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <button className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all hover:scale-105">
            See Your City's Squad →
          </button>
          <p className="text-gray-600 mt-4">
            Stop coordinating. Start celebrating. 🎉
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonBento;
