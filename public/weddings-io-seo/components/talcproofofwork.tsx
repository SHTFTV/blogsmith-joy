'use client';

import React, { useState } from 'react';

interface TalcMarker {
  vendorId: string;
  vendorName: string;
  videoUrl: string;
  videoThumbnail: string;
  eventDate: string;
  eventType: string;
  city: string;
  lat: number;
  lng: number;
  views: number;
  testimonial?: string;
}

interface TalcProofComponentProps {
  markers: TalcMarker[];
  onMarkerHover?: (marker: TalcMarker) => void;
  onMarkerClick?: (marker: TalcMarker) => void;
}

/**
 * CustomMarker Component
 * Renders a 40px circle on the map that expands to 200px video player on hover
 * Uses Talc.tv proof-of-work videos to show real vendor activity
 */
export const TalcCustomMarker = ({
  marker,
  isHovered,
  onHover,
  onClick,
}: {
  marker: TalcMarker;
  isHovered: boolean;
  onHover: (hovering: boolean) => void;
  onClick: () => void;
}) => {
  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
      style={{
        width: isHovered ? '200px' : '40px',
        height: isHovered ? '200px' : '40px',
      }}
    >
      {/* Base Circle Marker */}
      <div
        className={`absolute inset-0 rounded-full border-4 border-white shadow-lg transition-all ${
          isHovered
            ? 'ring-4 ring-blue-400 scale-100'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {/* Video Thumbnail (shows on hover) */}
        {isHovered && (
          <div className="absolute inset-0 rounded-full overflow-hidden bg-black">
            <img
              src={marker.videoThumbnail}
              alt={marker.vendorName}
              className="w-full h-full object-cover"
            />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <button className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition">
                ▶
              </button>
            </div>

            {/* Info Tooltip */}
            <div className="absolute -bottom-12 left-0 right-0 bg-black/90 text-white p-2 rounded text-xs z-10 whitespace-nowrap">
              <div className="font-semibold">{marker.vendorName}</div>
              <div className="text-gray-300">{marker.eventType}</div>
            </div>
          </div>
        )}

        {/* Live Badge (when not hovering) */}
        {!isHovered && (
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg animate-pulse">
            📹
          </div>
        )}
      </div>

      {/* Live indicator dot */}
      <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
    </div>
  );
};

/**
 * Talc Proof Feed Component
 * Shows a feed of real vendor activities as a map overlay
 */
export const TalcProofFeed = ({ markers, onMarkerClick }: TalcProofComponentProps) => {
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const [expandedMarker, setExpandedMarker] = useState<TalcMarker | null>(null);

  return (
    <>
      {/* Live Talc Proof Markers on Map */}
      <div className="relative w-full h-full">
        {/* Render all markers - would be positioned absolutely on actual map */}
        {markers.map((marker) => (
          <TalcCustomMarker
            key={`${marker.vendorId}-${marker.eventDate}`}
            marker={marker}
            isHovered={hoveredMarkerId === marker.vendorId}
            onHover={(hovering) =>
              setHoveredMarkerId(hovering ? marker.vendorId : null)
            }
            onClick={() => {
              setExpandedMarker(marker);
              onMarkerClick?.(marker);
            }}
          />
        ))}
      </div>

      {/* Expanded Video Modal */}
      {expandedMarker && (
        <TalcVideoModal
          marker={expandedMarker}
          onClose={() => setExpandedMarker(null)}
        />
      )}
    </>
  );
};

/**
 * Video Modal - Shows full video proof
 */
const TalcVideoModal = ({
  marker,
  onClose,
}: {
  marker: TalcMarker;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full">
        {/* Video */}
        <div className="relative w-full bg-black">
          <video
            src={marker.videoUrl}
            controls
            autoPlay
            className="w-full h-auto max-h-96"
          />
        </div>

        {/* Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {marker.vendorName}
              </h3>
              <p className="text-gray-600">{marker.eventType} Wedding</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
            <div>
              <span className="text-xs text-gray-600 uppercase">Event Date</span>
              <p className="font-semibold text-gray-900">{marker.eventDate}</p>
            </div>
            <div>
              <span className="text-xs text-gray-600 uppercase">Location</span>
              <p className="font-semibold text-gray-900">{marker.city}</p>
            </div>
            <div>
              <span className="text-xs text-gray-600 uppercase">Views</span>
              <p className="font-semibold text-gray-900">
                {marker.views.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-600 uppercase">Engagement</span>
              <p className="font-semibold text-green-600">⭐ Active</p>
            </div>
          </div>

          {/* Testimonial */}
          {marker.testimonial && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700 italic">"{marker.testimonial}"</p>
            </div>
          )}

          {/* CTA */}
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Book This Vendor
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Talc Feed Sidebar - Shows recent vendor activity
 */
export const TalcFeedSidebar = ({ markers }: { markers: TalcMarker[] }) => {
  const recentActivity = markers.slice(0, 5); // Show 5 most recent

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎥</span>
        <h3 className="text-lg font-bold text-gray-900">Live Vendor Proof</h3>
      </div>

      <p className="text-xs text-gray-600 mb-4">
        Real vendor activity from recent events. Not AI renders - actual proof of work.
      </p>

      {/* Activity Feed */}
      <div className="space-y-3">
        {recentActivity.map((marker) => (
          <div
            key={`${marker.vendorId}-${marker.eventDate}`}
            className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition cursor-pointer border border-gray-200 hover:border-blue-300"
          >
            {/* Live Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-red-600">LIVE NOW</span>
            </div>

            {/* Thumbnail + Info */}
            <div className="flex gap-3">
              <img
                src={marker.videoThumbnail}
                alt={marker.vendorName}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {marker.vendorName}
                </p>
                <p className="text-xs text-gray-600">{marker.eventType}</p>
                <p className="text-xs text-gray-500">{marker.eventDate}</p>
              </div>
            </div>

            {/* View Count */}
            <div className="mt-2 text-xs text-gray-600">
              👁️ {marker.views.toLocaleString()} views
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 border-2 border-blue-600 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
        View All Live →
      </button>
    </div>
  );
};

/**
 * Helper: Generate sample Talc markers for demo
 */
export function generateSampleTalcMarkers(vendors: any[]): TalcMarker[] {
  return vendors.slice(0, 5).map((vendor, idx) => ({
    vendorId: vendor.id,
    vendorName: vendor.name,
    videoUrl: vendor.talcVideoUrl || 'https://example.com/video.mp4',
    videoThumbnail:
      vendor.image || 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=100&h=100&fit=crop',
    eventDate: new Date(Date.now() - idx * 86400000).toLocaleDateString(),
    eventType: vendor.specializations[0] || 'Wedding',
    city: vendor.city,
    lat: vendor.lat,
    lng: vendor.lng,
    views: Math.floor(Math.random() * 5000) + 500,
    testimonial:
      'Amazing vendor! Professional, creative, and delivered exactly what we envisioned.',
  }));
}
