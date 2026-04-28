'use client';

import React, { useState } from 'react';
import Image from 'next/image';

// Aesthetic categories with high-end wedding photos
const AESTHETIC_OPTIONS = [
  {
    id: 'minimalist_gold',
    name: 'Minimalist Gold',
    description: 'Clean lines, luxury minimalism',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
    color: 'from-amber-100 to-yellow-100',
  },
  {
    id: 'industrial_raw',
    name: 'Industrial Raw',
    description: 'Exposed brick, steel, urban edge',
    image: 'https://images.unsplash.com/photo-1519167758993-e67d6dcd9d63?w=400&h=300&fit=crop',
    color: 'from-gray-300 to-gray-400',
  },
  {
    id: 'boho_garden',
    name: 'Boho Garden',
    description: 'Natural, organic, flowing',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop',
    color: 'from-green-100 to-emerald-100',
  },
  {
    id: 'luxury_modern',
    name: 'Luxury Modern',
    description: 'Contemporary elegance, high-end',
    image: 'https://images.unsplash.com/photo-1519221314046-80f2b9b373e2?w=400&h=300&fit=crop',
    color: 'from-blue-100 to-indigo-100',
  },
  {
    id: 'classic_elegant',
    name: 'Classic Elegant',
    description: 'Timeless, refined, traditional',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
    color: 'from-rose-100 to-pink-100',
  },
  {
    id: 'garden_romantic',
    name: 'Garden Romantic',
    description: 'Lush flowers, intimate outdoor',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    color: 'from-pink-100 to-rose-100',
  },
  {
    id: 'cultural_vibrant',
    name: 'Cultural Vibrant',
    description: 'Bold colors, rich traditions',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&h=300&fit=crop',
    color: 'from-purple-100 to-violet-100',
  },
  {
    id: 'luxury_glamour',
    name: 'Luxury Glamour',
    description: 'High-end sparkle, dramatic flair',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=300&fit=crop',
    color: 'from-yellow-100 to-amber-100',
  },
  {
    id: 'coastal_chic',
    name: 'Coastal Chic',
    description: 'Beachside, ocean breeze, relaxed',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
    color: 'from-cyan-100 to-blue-100',
  },
  {
    id: 'vintage_retro',
    name: 'Vintage Retro',
    description: 'Classic nostalgia, timeless charm',
    image: 'https://images.unsplash.com/photo-1465495976519-61d271a8eed7?w=400&h=300&fit=crop',
    color: 'from-amber-100 to-orange-100',
  },
  {
    id: 'temple_sacred',
    name: 'Temple Sacred',
    description: 'Spiritual, ceremonial, reverent',
    image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=300&fit=crop',
    color: 'from-yellow-100 to-orange-100',
  },
  {
    id: 'rooftop_skyline',
    name: 'Rooftop Skyline',
    description: 'City views, modern backdrop',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&h=300&fit=crop',
    color: 'from-slate-100 to-gray-100',
  },
];

interface VisualMatchProps {
  onAestheticSelect: (aesthetics: string[]) => void;
  selectedAesthetics?: string[];
}

export const VisualMatchEngine = ({ onAestheticSelect, selectedAesthetics = [] }: VisualMatchProps) => {
  const [selected, setSelected] = useState<string[]>(selectedAesthetics);

  const handleSelect = (aestheticId: string) => {
    let newSelected: string[];
    
    if (selected.includes(aestheticId)) {
      // Deselect
      newSelected = selected.filter(id => id !== aestheticId);
    } else {
      // Add (max 3)
      if (selected.length < 3) {
        newSelected = [...selected, aestheticId];
      } else {
        // Replace oldest if already 3 selected
        newSelected = [...selected.slice(1), aestheticId];
      }
    }
    
    setSelected(newSelected);
    onAestheticSelect(newSelected);
  };

  const getAestheticLabel = (id: string) => {
    return AESTHETIC_OPTIONS.find(opt => opt.id === id)?.name || id;
  };

  return (
    <div className="w-full bg-gradient-to-b from-white to-gray-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h2 className="text-3xl font-serif text-gray-900 mb-2">Find Your Vibe</h2>
        <p className="text-gray-600">Click 3 aesthetics that match your wedding style. We'll show you vendors who specialize in your vision.</p>
        
        {/* Selected Tags */}
        {selected.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm font-semibold text-gray-700">Your Aesthetic ID:</span>
            {selected.map(id => (
              <span key={id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {getAestheticLabel(id)}
                <button 
                  onClick={() => handleSelect(id)}
                  className="ml-2 hover:font-bold"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Photos */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {AESTHETIC_OPTIONS.map((aesthetic) => {
            const isSelected = selected.includes(aesthetic.id);
            
            return (
              <button
                key={aesthetic.id}
                onClick={() => handleSelect(aesthetic.id)}
                className={`relative rounded-lg overflow-hidden cursor-pointer transition-all group ${
                  isSelected 
                    ? 'ring-4 ring-blue-600 scale-105' 
                    : 'hover:scale-105 hover:shadow-lg'
                }`}
              >
                {/* Image */}
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={aesthetic.image}
                    alt={aesthetic.name}
                    fill
                    className="object-cover group-hover:brightness-110 transition-all"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                  
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
                      ✓
                    </div>
                  )}
                </div>

                {/* Text Overlay */}
                <div className={`absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent`}>
                  <h3 className="font-semibold text-white text-sm">{aesthetic.name}</h3>
                  <p className="text-white/80 text-xs">{aesthetic.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selection Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            {selected.length === 0 && 'Select up to 3 aesthetics to filter vendors →'}
            {selected.length === 1 && 'Select 2 more aesthetics to refine your search →'}
            {selected.length === 2 && 'Select 1 more aesthetic to complete your profile →'}
            {selected.length === 3 && '✓ Profile complete! Viewing vendors matching your aesthetics.'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper function to filter vendors by aesthetic
export function filterVendorsByAesthetic(vendors: any[], aestheticIds: string[]): any[] {
  if (aestheticIds.length === 0) return vendors;
  
  return vendors.filter(vendor => {
    // Vendor must have at least one matching aesthetic
    return aestheticIds.some(id => vendor.aesthetics?.includes(id));
  });
}

// Helper function to score vendor match
export function getVendorAestheticMatch(vendor: any, selectedAesthetics: string[]): number {
  if (!vendor.aesthetics || selectedAesthetics.length === 0) return 0;
  
  const matches = vendor.aesthetics.filter((aes: string) => 
    selectedAesthetics.includes(aes)
  ).length;
  
  return (matches / selectedAesthetics.length) * 100;
}
