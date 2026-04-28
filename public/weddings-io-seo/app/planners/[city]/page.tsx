// app/planners/[city]/page.tsx
'use client';

import { localBusinessSchema, breadcrumbSchema } from '@/lib/schema';
import { citiesData } from '@/lib/cities';
import { getVendorsByCity } from '@/lib/vendors';
import { useEffect } from 'react';

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
    title: `Wedding Planners in ${cityName}, ${cityData.region} | Verified Vendors | Weddings.io`,
    description: `Find ${vendorCount} verified South Asian wedding planners in ${cityName}, ${cityData.region}. Expert vendors for Hindu, Sikh, Muslim & interfaith ceremonies.`,
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
  const cityVendors = getVendorsByCity(cityName, cityData.region);
  const topVendors = cityVendors.slice(0, 3); // Get top 3 vendors

  const schema = breadcrumbSchema([
    { name: 'Home', url: 'https://weddings.io' },
    { name: 'Find Planners', url: 'https://weddings.io/planners' },
    { name: `${cityName}, ${cityData.region}`, url: `https://weddings.io/planners/${params.city}` }
  ]);

  const localSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Wedding Planners in ${cityName}, ${cityData.region}`,
    "description": `Find verified South Asian wedding planners in ${cityName}...`,
    "url": `https://weddings.io/planners/${params.city}`,
    "areaServed": {
      "@type": "City",
      "name": cityName,
      "containedInPlace": {
        "@type": "State",
        "name": cityData.region
      }
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Schema Scripts */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }}
        />

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-8">
          <a href="/" className="hover:text-blue-600">Home</a> / 
          <a href="/planners" className="hover:text-blue-600"> Find Planners</a> / 
          <span className="text-gray-900"> {cityName}, {cityData.region}</span>
        </nav>

        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            South Asian Wedding Planners in {cityName}, {cityData.region}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Discover {topVendors.length > 0 ? cityVendors.length : '50+'} verified wedding planners and coordinators in {cityName} specializing in Hindu, Sikh, Muslim & interfaith ceremonies.
          </p>
          <p className="text-gray-600 mb-6">
            Planning a South Asian wedding in {cityName}? Our network of experienced wedding planners understand the intricate traditions and cultural significance of your celebration. From intimate Nikah ceremonies to grand multi-day Hindu weddings, our vetted vendors bring expertise, cultural sensitivity, and flawless execution.
          </p>
          <p className="text-sm text-gray-500">
            Population: {cityData.population.toLocaleString()} | Neighborhoods: {cityData.neighborhoods.length}
          </p>
        </div>

        {/* Google Maps Embed */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wedding Planners in {cityName}</h2>
          <div className="bg-gray-200 rounded-lg overflow-hidden mb-6" style={{ height: '400px' }}>
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDummyKeyForDemo&q=${cityName},${cityData.region}&zoom=11`}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Map showing wedding planner locations in {cityName}. Click on markers for more details.
          </p>
        </div>

        {/* Featured Vendors */}
        {topVendors.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Wedding Planners</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {topVendors.map((vendor) => (
                <div key={vendor.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                  {/* Vendor Image */}
                  <img 
                    src={vendor.image} 
                    alt={vendor.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  
                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <span className="text-yellow-400">★★★★★</span>
                    <span className="ml-2 text-gray-600 text-sm">
                      {vendor.rating}/5 ({vendor.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {vendor.name}
                  </h3>

                  {/* Location */}
                  <p className="text-gray-600 text-sm mb-3">
                    📍 {vendor.neighborhood}, {vendor.city}
                  </p>

                  {/* Description */}
                  <p className="text-gray-700 text-sm mb-4">
                    {vendor.description}
                  </p>

                  {/* Specializations */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">SPECIALIZES IN:</p>
                    <div className="flex flex-wrap gap-2">
                      {vendor.specializations.map((spec) => (
                        <span key={spec} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <p className="text-gray-600 text-sm mb-3">
                    💰 ${vendor.priceRange.min.toLocaleString()} - ${vendor.priceRange.max.toLocaleString()}
                  </p>

                  {/* Experience */}
                  <p className="text-gray-600 text-sm mb-4">
                    👥 {vendor.yearsExperience}+ Years Experience
                  </p>

                  {/* Services */}
                  <div className="mb-4 border-t border-gray-200 pt-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">SERVICES:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {vendor.services.slice(0, 4).map((service) => (
                        <li key={service}>✓ {service}</li>
                      ))}
                      {vendor.services.length > 4 && (
                        <li className="text-gray-500">+ {vendor.services.length - 4} more</li>
                      )}
                    </ul>
                  </div>

                  {/* Contact */}
                  <div className="flex gap-2">
                    <a
                      href={`tel:${vendor.phone}`}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-center hover:bg-blue-700 text-sm"
                    >
                      Call
                    </a>
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-semibold text-center hover:bg-blue-50 text-sm"
                    >
                      Website
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold">
                Browse All {cityVendors.length} Wedding Planners in {cityName}
              </a>
            </div>
          </div>
        )}

        {/* Why Choose Section */}
        <section className="bg-blue-50 p-8 rounded-lg mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Weddings.io in {cityName}?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✓ Cultural Expertise</h3>
              <p className="text-gray-700">Planners who deeply understand Hindu, Sikh, Muslim, and interfaith traditions specific to {cityName}.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✓ Verified Vendors</h3>
              <p className="text-gray-700">Every vendor is vetted for quality, experience, and commitment to your vision.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✓ Local Knowledge</h3>
              <p className="text-gray-700">Planners know the best venues, caterers, and locations in {cityName} and surrounding areas.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✓ Stress-Free Planning</h3>
              <p className="text-gray-700">From initial consultation to final ceremony, your planner handles all details with precision.</p>
            </div>
          </div>
        </section>

        {/* Services Offered */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Services Available in {cityName}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {['Full Wedding Planning', 'Day-of Coordination', 'Vendor Curation', 'Décor & Styling', 'Catering Coordination', 'Logistics Management'].map((service, idx) => (
              <div key={idx} className="p-6 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{service}</h3>
                <p className="text-gray-600 text-sm">Professional support for all aspects of your wedding.</p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Venues */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Venues in {cityName}</h2>
          <p className="text-gray-700 mb-6">
            {cityName} offers diverse venue options for your wedding celebration:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Luxury banquet halls and event spaces</li>
            <li>Historic venues and heritage sites</li>
            <li>Garden venues and outdoor spaces</li>
            <li>Hotel ballrooms and resorts</li>
            <li>Religious institutions (Temples, Gurudwaras, Mosques)</li>
            <li>Ethnic event centers catering to South Asian weddings</li>
          </ul>
        </section>

        {/* Wedding Types in This City */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Wedding Traditions Celebrated in {cityName}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <a href="/guides/hindu-wedding-planning" className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <h3 className="font-semibold text-gray-900 mb-2">Hindu Weddings</h3>
              <p className="text-gray-600 text-sm">Multi-day celebrations with Mehendi, Sangeet, Haldi & sacred ceremonies.</p>
            </a>
            <a href="/guides/sikh-wedding-planning" className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <h3 className="font-semibold text-gray-900 mb-2">Sikh Weddings</h3>
              <p className="text-gray-600 text-sm">Beautiful Gurdwara ceremonies and joyful Anand Karaj celebrations.</p>
            </a>
            <a href="/guides/muslim-wedding-planning" className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <h3 className="font-semibold text-gray-900 mb-2">Muslim Weddings</h3>
              <p className="text-gray-600 text-sm">Nikah, Mehndi & Walima with cultural and religious significance.</p>
            </a>
            <a href="/guides/interfaith-weddings" className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <h3 className="font-semibold text-gray-900 mb-2">Interfaith Weddings</h3>
              <p className="text-gray-600 text-sm">Blended ceremonies honoring multiple traditions respectfully.</p>
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-12 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Plan Your Dream Wedding in {cityName}?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Connect with our verified wedding planners and start your journey today.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
            Connect with Planners
          </button>
        </section>

        {/* FAQ */}
        <section className="mt-12 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">FAQs About Wedding Planning in {cityName}</h2>
          <div className="space-y-4">
            {[
              { q: `What's the average wedding planner cost in ${cityName}?`, a: 'Costs vary based on services. Day-of coordination typically ranges $1,500-3,500, while full planning runs $3,000-8,000+.' },
              { q: `How far in advance should I book a planner in ${cityName}?`, a: 'Ideally 12-18 months for peak seasons. Popular planners may book 2+ years ahead.' },
              { q: `Do planners in ${cityName} handle all wedding traditions?`, a: 'Yes, our verified planners specialize in Hindu, Sikh, Muslim & interfaith ceremonies.' },
            ].map((faq, idx) => (
              <details key={idx} className="group p-6 bg-gray-50 rounded-lg border border-gray-200">
                <summary className="font-semibold text-gray-900 cursor-pointer">
                  {faq.q}
                </summary>
                <p className="text-gray-600 mt-4 group-open:block hidden">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
