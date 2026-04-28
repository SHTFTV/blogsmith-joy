'use client';

import React, { useState, useMemo } from 'react';
import { citiesData } from '@/lib/cities';
import { getVendorsByCity } from '@/lib/vendors';

const MAPPComponent = ({ citySlug }: { citySlug: string }) => {
  // Find city data from slug
  const cityEntry = useMemo(() => {
    return Object.entries(citiesData).find(([_, data]) => data.slug === citySlug);
  }, [citySlug]);

  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  if (!cityEntry) {
    return <div className="p-8 text-center">City not found</div>;
  }

  const [cityName, cityData] = cityEntry;
  const vendors = useMemo(() => {
    return getVendorsByCity(cityName, cityData.region).slice(0, 5); // Top 5 vendors
  }, [cityName, cityData.region]);

  const firstVendor = vendors[0];
  const selected = selectedVendor || firstVendor;

  return (
    <div className="flex h-screen w-full bg-[#faf9f6] p-6 gap-6 font-sans text-[#2d2d2d]">
      
      {/* LEFT: Bento Grid Sidebar */}
      <div className="w-1/3 grid grid-cols-2 grid-rows-4 gap-4 h-full">
        
        {/* Card 1: City Context (Full Width) */}
        <div className="col-span-2 row-span-1 bg-white/40 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-sm hover:bg-white/50 transition-all">
          <h1 className="text-4xl font-serif text-gray-900">{cityName}</h1>
          <p className="text-sm opacity-60 uppercase tracking-widest mt-1">{cityData.region} • Bridal Hub</p>
          <p className="text-xs opacity-50 mt-2">Pop: {cityData.population.toLocaleString()}</p>
        </div>

        {/* Card 2: Featured Vendor Spotlight */}
        <div className="col-span-1 row-span-2 bg-white/80 backdrop-blur-lg border border-white/40 p-4 rounded-3xl shadow-md flex flex-col justify-between hover:shadow-lg transition-all">
          <span className="bg-black text-white text-[10px] px-3 py-1 rounded-full w-fit font-semibold">
            ⭐ TOP MATCH
          </span>
          {selected && (
            <div className="mt-4">
              <h3 className="font-bold text-lg leading-tight text-gray-900">{selected.name}</h3>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600">
                  📍 {selected.neighborhood}
                </p>
                <div className="flex gap-1 flex-wrap">
                  {selected.specializations.slice(0, 2).map((spec: string) => (
                    <span key={spec} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {spec}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-semibold text-gray-700 mt-2">
                  💰 ${selected.priceRange.min.toLocaleString()} - ${selected.priceRange.max.toLocaleString()}
                </p>
                <p className="text-xs text-yellow-600">⭐ {selected.rating}/5 ({selected.reviewCount} reviews)</p>
              </div>
              <a 
                href={selected.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full bg-blue-600 text-white text-center py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
              >
                View Profile
              </a>
            </div>
          )}
        </div>

        {/* Card 3: Vendors Grid */}
        <div className="col-span-1 row-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl overflow-hidden border border-blue-100 p-4 flex flex-col">
          <h3 className="text-xs font-bold uppercase opacity-60 mb-3">Top Vendors</h3>
          <div className="space-y-2 overflow-y-auto">
            {vendors.map((vendor) => (
              <button
                key={vendor.id}
                onClick={() => setSelectedVendor(vendor)}
                className={`w-full text-left p-2 rounded-lg text-xs transition-all ${
                  selected?.id === vendor.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white/50 hover:bg-white text-gray-900'
                }`}
              >
                <div className="font-semibold line-clamp-1">{vendor.name}</div>
                <div className="opacity-70">{vendor.rating}/5 ⭐</div>
              </button>
            ))}
          </div>
        </div>

        {/* Card 4: Local Stats */}
        <div className="col-span-1 row-span-1 bg-white/40 backdrop-blur-md border border-white/20 rounded-3xl p-4 flex items-center justify-center hover:bg-white/60 transition-all">
          <div className="text-center">
            <span className="block text-3xl font-bold text-gray-900">{vendors.length}</span>
            <span className="text-[10px] uppercase opacity-60 tracking-wider">Verified<br/>Planners</span>
          </div>
        </div>

        {/* Card 5: Neighborhoods */}
        <div className="col-span-1 row-span-1 bg-white/40 backdrop-blur-md border border-white/20 rounded-3xl p-4 overflow-hidden">
          <p className="text-[10px] uppercase opacity-60 font-semibold mb-2">Neighborhoods</p>
          <div className="flex flex-wrap gap-1">
            {cityData.neighborhoods.slice(0, 3).map((neighborhood) => (
              <span key={neighborhood} className="text-[9px] bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                {neighborhood}
              </span>
            ))}
            {cityData.neighborhoods.length > 3 && (
              <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                +{cityData.neighborhoods.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: The MAPP (Main Interactive Map Panel) */}
      <div className="flex-1 rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative bg-gray-100">
        {/* Google Maps Embed */}
        <div className="w-full h-full">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${cityName}+${cityData.region}&zoom=13`}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 'none' }}
          />
        </div>

        {/* Floating Vendor Location Markers (Overlay) */}
        <div className="absolute inset-0 pointer-events-none">
          {vendors.map((vendor) => {
            // Calculate position on map (rough approximation for demo)
            // In production, you'd use actual map library for precise positioning
            return (
              <button
                key={vendor.id}
                onClick={() => setSelectedVendor(vendor)}
                className={`absolute pointer-events-auto transition-all transform -translate-x-1/2 -translate-y-1/2 ${
                  selected?.id === vendor.id ? 'scale-125' : 'scale-100 hover:scale-110'
                }`}
                style={{
                  left: `${30 + (vendor.lat % 30)}%`,
                  top: `${40 + (vendor.lng % 30)}%`,
                }}
                title={vendor.name}
              >
                <div className={`w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-sm font-bold transition-all ${
                  selected?.id === vendor.id
                    ? 'bg-blue-600 text-white scale-150'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}>
                  ⭐
                </div>
                <div className={`mt-2 bg-white rounded-lg shadow-md p-2 whitespace-nowrap text-xs font-semibold opacity-0 pointer-events-none transition-opacity ${
                  selected?.id === vendor.id ? 'opacity-100' : ''
                }`}>
                  {vendor.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Floating Map Controls */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-3 pointer-events-auto z-10">
          <a
            href={`https://maps.google.com/?q=${cityName}+${cityData.region}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/90 backdrop-blur-md p-4 rounded-full shadow-lg hover:scale-110 hover:bg-white transition-all font-bold text-lg"
            title="Open in Google Maps"
          >
            📍
          </a>
          <button className="bg-white/90 backdrop-blur-md p-4 rounded-full shadow-lg hover:scale-110 transition-all font-bold text-lg"
            title="Zoom in"
            onClick={() => {}}
          >
            🔍
          </button>
        </div>

        {/* City Label */}
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg pointer-events-none z-10">
          <h2 className="text-sm font-bold text-gray-900">{cityName}, {cityData.region}</h2>
          <p className="text-xs text-gray-600">{vendors.length} Top Planners</p>
        </div>
      </div>

    </div>
  );
};

export default MAPPComponent;
