'use client';

import React, { useState, useMemo } from 'react';
import { citiesData } from '@/lib/cities';
import { getVendorsByCity } from '@/lib/vendors';
import { VisualMatchEngine, filterVendorsByAesthetic, getVendorAestheticMatch } from '@/components/VisualMatchEngine';
import { PowerPartnerBundler, generateSquadsFromPartners } from '@/components/PowerPartnerBundler';
import { TalcProofFeed, TalcFeedSidebar, generateSampleTalcMarkers } from '@/components/TalcProofOfWork';

export async function generateStaticParams() {
  return Object.keys(citiesData).map(cityName => ({
    city: citiesData[cityName].slug
  }));
}

export async function generateMetadata({ params }: { params: { city: string } }) {
  const cityEntry = Object.entries(citiesData).find(
    ([_, data]) => data.slug === params.city
  );
  
  if (!cityEntry) return { title: 'City Not Found' };

  const [cityName, cityData] = cityEntry;
  const vendorCount = getVendorsByCity(cityName, cityData.region).length || '50+';

  return {
    title: `Wedding Planners in ${cityName}, ${cityData.region} | Visual Matching | Weddings.io`,
    description: `Find wedding planners in ${cityName}. Use our visual aesthetic matcher to find your perfect vendors. See real video proof of work from verified planners.`,
    keywords: `wedding planners ${cityName}, wedding coordinators ${cityData.region}, South Asian wedding vendor ${cityName}`,
    canonical: `https://weddings.io/planners/${params.city}`,
  };
}

export default function CityPlanners({ params }: { params: { city: string } }) {
  const cityEntry = Object.entries(citiesData).find(
    ([_, data]) => data.slug === params.city
  );
  
  if (!cityEntry) return <div className="p-8">City not found</div>;

  const [cityName, cityData] = cityEntry;
  const allVendors = useMemo(() => getVendorsByCity(cityName, cityData.region), [cityName, cityData.region]);
  
  // STATE: Aesthetic selection
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [expandedSquad, setExpandedSquad] = useState<any>(null);

  // COMPUTED: Filter vendors by aesthetics
  const filteredVendors = useMemo(() => {
    if (selectedAesthetics.length === 0) return allVendors;
    return filterVendorsByAesthetic(allVendors, selectedAesthetics);
  }, [allVendors, selectedAesthetics]);

  // COMPUTED: Generate squads from partnerships
  const squads = useMemo(() => generateSquadsFromPartners(allVendors), [allVendors]);

  // COMPUTED: Get Talc markers
  const talcMarkers = useMemo(() => generateSampleTalcMarkers(filteredVendors), [filteredVendors]);

  // COMPUTED: Get selected vendor
  const selectedVendor = useMemo(
    () => filteredVendors.find(v => v.id === selectedVendorId) || null,
    [filteredVendors, selectedVendorId]
  );

  // Get vendor aesthetic match percentage
  const vendorMatchScore = selectedVendor 
    ? getVendorAestheticMatch(selectedVendor, selectedAesthetics)
    : 0;

  // === PHASE 1: VISUAL MATCH (No aesthetic selected) ===
  if (selectedAesthetics.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 py-4 text-sm text-gray-600">
          <a href="/" className="hover:text-blue-600">Home</a> / 
          <a href="/planners" className="hover:text-blue-600"> Find Planners</a> / 
          <span className="text-gray-900"> {cityName}, {cityData.region}</span>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 py-8 mb-8">
          <h1 className="text-4xl font-serif text-gray-900 mb-3">
            Wedding Planners in {cityName}
          </h1>
          <p className="text-lg text-gray-600">
            Find your perfect wedding aesthetic, then meet the vendors who specialize in your vision.
          </p>
        </div>

        {/* Visual Match Engine - Full Screen */}
        <VisualMatchEngine
          onAestheticSelect={(aesthetics) => {
            setSelectedAesthetics(aesthetics);
          }}
          selectedAesthetics={selectedAesthetics}
        />

        {/* Info Section */}
        <div className="max-w-7xl mx-auto px-4 py-12 bg-gray-50 mt-12 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl mb-2">1️⃣</div>
              <h3 className="font-bold text-gray-900 mb-2">Select Your Aesthetic</h3>
              <p className="text-gray-600">Click 3 photos that match your wedding vibe. Our system learns your style preference.</p>
            </div>
            <div>
              <div className="text-4xl mb-2">2️⃣</div>
              <h3 className="font-bold text-gray-900 mb-2">Find Matching Vendors</h3>
              <p className="text-gray-600">See only wedding planners who specialize in your aesthetic. No irrelevant results.</p>
            </div>
            <div>
              <div className="text-4xl mb-2">3️⃣</div>
              <h3 className="font-bold text-gray-900 mb-2">View Proof & Book</h3>
              <p className="text-gray-600">Watch real video proof from actual events, then book your perfect vendor squad.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === PHASE 2: INTERACTIVE MAP + SQUADS + TALC (Aesthetic selected) ===
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Header with Aesthetic Selection */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif text-gray-900">{cityName} Vendors</h1>
            <p className="text-sm text-gray-600">
              {filteredVendors.length} vendors match your aesthetic
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedAesthetics([]);
              setSelectedVendorId(null);
            }}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition"
          >
            ← Change Aesthetic
          </button>
        </div>

        {/* Selected Aesthetics Display */}
        <div className="max-w-7xl mx-auto mt-4 flex flex-wrap gap-2">
          {selectedAesthetics.map(id => {
            const aesthetic = ['minimalist_gold', 'industrial_raw', 'boho_garden', 'luxury_modern', 'classic_elegant', 'garden_romantic', 'cultural_vibrant', 'luxury_glamour', 'coastal_chic', 'vintage_retro', 'temple_sacred', 'rooftop_skyline'].find(a => a === id);
            return (
              <span key={id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {aesthetic?.replace(/_/g, ' ')}
              </span>
            );
          })}
        </div>
      </div>

      {/* Main Content: 3-Column Layout */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">

          {/* LEFT COLUMN: Power Partners + Talc Feed */}
          <div className="space-y-6 overflow-y-auto">
            {/* Power Partner Bundler */}
            {selectedVendor && (
              <div className="sticky top-0 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <PowerPartnerBundler
                  selectedVendorId={selectedVendorId!}
                  allVendors={filteredVendors}
                  vendorSquads={squads}
                  onSquadSelect={(squad) => setExpandedSquad(squad)}
                />
              </div>
            )}

            {/* Talc Proof Feed */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <TalcFeedSidebar markers={talcMarkers} />
            </div>
          </div>

          {/* CENTER COLUMN: Map + Vendor Markers */}
          <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gray-100">
            {/* Google Maps */}
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${cityName},${cityData.region}&zoom=13`}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 'none' }}
            />

            {/* Vendor Pins Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {filteredVendors.map((vendor) => (
                <button
                  key={vendor.id}
                  onClick={() => setSelectedVendorId(vendor.id)}
                  className="absolute pointer-events-auto transition-all transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{
                    left: `${30 + (vendor.lat % 30)}%`,
                    top: `${40 + (vendor.lng % 30)}%`,
                  }}
                  title={vendor.name}
                >
                  <div
                    className={`w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-sm font-bold transition-all ${
                      selectedVendorId === vendor.id
                        ? 'bg-blue-600 text-white scale-150 ring-4 ring-blue-400'
                        : 'bg-blue-500 text-white hover:bg-blue-600 group-hover:scale-110'
                    }`}
                  >
                    ⭐
                  </div>
                  {selectedVendorId === vendor.id && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                      {vendor.name}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Talc Video Proof Markers */}
            <TalcProofFeed
              markers={talcMarkers}
              onMarkerClick={(marker) => console.log('Clicked Talc:', marker)}
            />

            {/* Map Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 pointer-events-auto z-10">
              <a
                href={`https://maps.google.com/?q=${cityName}+${cityData.region}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:scale-110 transition font-bold text-lg hover:bg-white"
                title="Open in Google Maps"
              >
                📍
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: Vendor Details */}
          <div className="overflow-y-auto space-y-4">
            {selectedVendor ? (
              <>
                {/* Vendor Card */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  {/* Image */}
                  <img 
                    src={selectedVendor.image} 
                    alt={selectedVendor.name}
                    className="w-full h-48 object-cover"
                  />

                  {/* Info */}
                  <div className="p-4">
                    {/* Name + Rating */}
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {selectedVendor.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-yellow-400">★★★★★</span>
                      <span className="text-sm text-gray-600">
                        {selectedVendor.rating}/5 ({selectedVendor.reviewCount} reviews)
                      </span>
                    </div>

                    {/* Aesthetic Match Score */}
                    {selectedAesthetics.length > 0 && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-1">AESTHETIC MATCH</p>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${vendorMatchScore}%` }}
                          />
                        </div>
                        <p className="text-xs text-blue-900 mt-1 font-semibold">{Math.round(vendorMatchScore)}% match</p>
                      </div>
                    )}

                    {/* Location */}
                    <p className="text-sm text-gray-700 mb-3">
                      📍 {selectedVendor.neighborhood}, {selectedVendor.city}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4">
                      {selectedVendor.description}
                    </p>

                    {/* Specializations */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">SPECIALIZES IN</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedVendor.specializations.map((spec: string) => (
                          <span key={spec} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Price + Experience */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                      <p className="text-sm">
                        <strong>💰 Price:</strong> ${selectedVendor.priceRange.min.toLocaleString()} - ${selectedVendor.priceRange.max.toLocaleString()}
                      </p>
                      <p className="text-sm">
                        <strong>👥 Experience:</strong> {selectedVendor.yearsExperience}+ years
                      </p>
                    </div>

                    {/* Services */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">SERVICES</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {selectedVendor.services.slice(0, 4).map((service: string) => (
                          <li key={service}>✓ {service}</li>
                        ))}
                        {selectedVendor.services.length > 4 && (
                          <li className="text-gray-500">+ {selectedVendor.services.length - 4} more</li>
                        )}
                      </ul>
                    </div>

                    {/* Contact Buttons */}
                    <div className="flex gap-2">
                      <a
                        href={`tel:${selectedVendor.phone}`}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold text-center hover:bg-blue-700 transition text-sm"
                      >
                        Call
                      </a>
                      <a
                        href={selectedVendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 border-2 border-blue-600 text-blue-600 py-2 rounded-lg font-semibold text-center hover:bg-blue-50 transition text-sm"
                      >
                        Website
                      </a>
                    </div>

                    {/* Talc Video Button */}
                    {selectedVendor.talcVideoUrl && (
                      <button className="w-full mt-3 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition text-sm">
                        🎥 Watch Event Video
                      </button>
                    )}
                  </div>
                </div>

                {/* Vendor Aesthetics */}
                {selectedVendor.aesthetics && selectedVendor.aesthetics.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-700 mb-3">VENDOR'S AESTHETICS</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedVendor.aesthetics.map((aesthetic: string) => (
                        <span 
                          key={aesthetic}
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            selectedAesthetics.includes(aesthetic)
                              ? 'bg-green-100 text-green-800 ring-2 ring-green-400'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {aesthetic.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <p className="text-gray-600 mb-2">👈 Click a vendor on the map</p>
                <p className="text-sm text-gray-500">
                  {filteredVendors.length} vendors match your aesthetic
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Squad Modal */}
      {expandedSquad && (
        <SquadModal squad={expandedSquad} onClose={() => setExpandedSquad(null)} />
      )}
    </div>
  );
}

// Squad Modal Component
function SquadModal({ squad, onClose }: { squad: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{squad.name}</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Squad Members */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Vendor Team</h3>
            <div className="space-y-3">
              {squad.vendors.map((vendor: any, idx: number) => (
                <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={vendor.image}
                    alt={vendor.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{vendor.name}</p>
                    <p className="text-sm text-gray-600">{vendor.role}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      ${vendor.priceRange.min.toLocaleString()} - ${vendor.priceRange.max.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Squad Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-xs text-blue-600 uppercase font-semibold">Success Rate</p>
              <p className="text-2xl font-bold text-blue-900">{squad.successRate}%</p>
            </div>
            <div>
              <p className="text-xs text-blue-600 uppercase font-semibold">Squad Budget</p>
              <p className="text-2xl font-bold text-blue-900">
                ${squad.totalPrice.min.toLocaleString()} - ${squad.totalPrice.max.toLocaleString()}
              </p>
            </div>
          </div>

          {/* CTA */}
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
            Book This Squad & Save 10%
          </button>
        </div>
      </div>
    </div>
  );
}
