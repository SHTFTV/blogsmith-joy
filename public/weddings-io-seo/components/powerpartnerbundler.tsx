'use client';

import React, { useMemo } from 'react';

interface Squad {
  id: string;
  name: string;
  vendors: {
    id: string;
    name: string;
    role: string;
    image: string;
    priceRange: { min: number; max: number };
  }[];
  totalPrice: { min: number; max: number };
  successRate: number;
  jointPortfolioUrl?: string;
  description: string;
}

interface PowerPartnerProps {
  selectedVendorId: string;
  allVendors: any[];
  vendorSquads: Squad[];
  onSquadSelect: (squad: Squad) => void;
}

export const PowerPartnerBundler = ({
  selectedVendorId,
  allVendors,
  vendorSquads,
  onSquadSelect,
}: PowerPartnerProps) => {
  // Find squads that include the selected vendor
  const recommendedSquads = useMemo(() => {
    if (!selectedVendorId) return [];
    
    return vendorSquads.filter(squad =>
      squad.vendors.some(v => v.id === selectedVendorId)
    );
  }, [selectedVendorId, vendorSquads]);

  if (!selectedVendorId || recommendedSquads.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🤝</span>
          <h3 className="text-xl font-bold text-gray-900">Power Partner Squads</h3>
        </div>
        <p className="text-gray-700">
          These vendor teams have worked together and deliver amazing results. Reduce 50 decisions down to 1.
        </p>
      </div>

      {/* Squad Cards */}
      <div className="space-y-4">
        {recommendedSquads.map((squad) => (
          <SquadCard
            key={squad.id}
            squad={squad}
            onSelect={() => onSquadSelect(squad)}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="mt-6 p-4 bg-white/60 backdrop-blur rounded-lg border border-purple-200">
        <p className="text-sm text-gray-600 mb-3">
          💡 <strong>Pro Tip:</strong> Book multiple vendors from the same squad and get a 5-10% bundle discount.
        </p>
      </div>
    </div>
  );
};

interface SquadCardProps {
  squad: Squad;
  onSelect: () => void;
}

const SquadCard = ({ squad, onSelect }: SquadCardProps) => {
  const totalMin = squad.totalPrice.min;
  const totalMax = squad.totalPrice.max;
  const avgSuccess = Math.round(squad.successRate);

  return (
    <button
      onClick={onSelect}
      className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-purple-400 transition-all text-left group"
    >
      {/* Squad Name + Success Rate */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition">
            {squad.name}
          </h4>
          <p className="text-xs text-gray-600 mt-1">{squad.description}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold text-green-600">{avgSuccess}%</span>
          <span className="text-xs text-gray-600">Success Rate</span>
        </div>
      </div>

      {/* Vendor Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {squad.vendors.map((vendor, idx) => (
          <div
            key={vendor.id}
            className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-purple-100 transition"
          >
            {/* Vendor Avatar */}
            <img
              src={vendor.image}
              alt={vendor.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <div className="text-xs">
              <div className="font-semibold text-gray-900">{vendor.name}</div>
              <div className="text-gray-600">{vendor.role}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Price + Action */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div>
          <span className="text-xs text-gray-600">Total Squad Budget:</span>
          <div className="font-bold text-gray-900">
            ${totalMin.toLocaleString()} - ${totalMax.toLocaleString()}
          </div>
        </div>
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          View Squad →
        </button>
      </div>
    </button>
  );
};

// Helper function: Create squads from vendor partnerships
export function generateSquadsFromPartners(vendors: any[]): Squad[] {
  const squads: Squad[] = [];
  const squadMap = new Map<string, Squad>();

  vendors.forEach((vendor) => {
    if (!vendor.squadPartnerships || vendor.squadPartnerships.length === 0) return;

    vendor.squadPartnerships.forEach((partnership: any) => {
      const squadKey = [vendor.id, partnership.partnerId].sort().join('_');
      
      if (!squadMap.has(squadKey)) {
        const partnerVendor = vendors.find(v => v.id === partnership.partnerId);
        
        if (partnerVendor) {
          const squad: Squad = {
            id: squadKey,
            name: `${vendor.name} + ${partnerVendor.name}`,
            vendors: [
              {
                id: vendor.id,
                name: vendor.name,
                role: vendor.services[0] || 'Vendor',
                image: vendor.image,
                priceRange: vendor.priceRange,
              },
              {
                id: partnerVendor.id,
                name: partnerVendor.name,
                role: partnerVendor.services[0] || 'Vendor',
                image: partnerVendor.image,
                priceRange: partnerVendor.priceRange,
              },
            ],
            totalPrice: {
              min: vendor.priceRange.min + partnerVendor.priceRange.min,
              max: vendor.priceRange.max + partnerVendor.priceRange.max,
            },
            successRate: partnership.successRate || 85,
            jointPortfolioUrl: partnership.jointPortfolioUrl,
            description: `Verified team with ${partnership.successRate || 85}% success rate`,
          };
          
          squadMap.set(squadKey, squad);
        }
      }
    });
  });

  return Array.from(squadMap.values());
}
