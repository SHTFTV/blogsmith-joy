// app/page.tsx
import Head from 'next/head';
import { organizationSchema, faqSchema } from '@/lib/schema';

const faqs = [
  {
    question: 'What makes Weddings.io different from other wedding planning platforms?',
    answer: 'Weddings.io specializes exclusively in South Asian weddings across 499 cities worldwide. We understand the unique cultural significance of Hindu, Sikh, Muslim, and interfaith ceremonies, and connect you with vendors who have proven expertise in these traditions.'
  },
  {
    question: 'How do I find wedding planners in my city?',
    answer: 'Use our city directory to search wedding planners in your location. We verify all vendors and provide detailed profiles, reviews, and specializations. Filter by wedding type, budget, and religious tradition.'
  },
  {
    question: 'Are all vendors on Weddings.io verified?',
    answer: 'Yes, all vendors on our platform are vetted and verified. We conduct background checks and require portfolio reviews to ensure quality service for your special day.'
  },
  {
    question: 'What if I don\'t know what vendors I need?',
    answer: 'We provide comprehensive wedding planning guides for all South Asian wedding types. Our resources cover ceremony requirements, vendor categories, timelines, and budgeting. Start with our guides to understand your needs.'
  }
];

export const metadata = {
  title: 'South Asian Wedding Planners | Weddings.io | Find Verified Vendors Worldwide',
  description: 'Discover verified South Asian wedding planners across 499 cities. Expert vendors for Hindu, Sikh, Muslim & interfaith ceremonies. 11 years of trust.',
  keywords: 'South Asian wedding planner, Indian wedding planner, Sikh wedding planner, Muslim wedding planner, wedding vendors, wedding coordinator',
  canonical: 'https://weddings.io',
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
      
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16 md:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Find Your Perfect South Asian Wedding Planner
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Verified vendors across 499 cities worldwide. Expert planners for Hindu, Sikh, Muslim & interfaith ceremonies.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/planners" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
                Browse Planners
              </a>
              <a href="/guides" className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50">
                Wedding Guides
              </a>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-4 bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">499</div>
              <div className="text-gray-600 mt-2">Cities Worldwide</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">5000+</div>
              <div className="text-gray-600 mt-2">Verified Vendors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">11</div>
              <div className="text-gray-600 mt-2">Years Experience</div>
            </div>
          </div>
        </section>

        {/* Wedding Types Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Plan Your Wedding by Tradition
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <a href="/guides/hindu-wedding-planning" className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Hindu Weddings</h3>
                <p className="text-gray-600">Mehendi, Sangeet, Haldi, and ceremonial rituals with experienced planners.</p>
              </a>
              <a href="/guides/sikh-wedding-planning" className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Sikh Weddings</h3>
                <p className="text-gray-600">Anand Karaj ceremonies and multi-event celebrations with cultural expertise.</p>
              </a>
              <a href="/guides/muslim-wedding-planning" className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Muslim Weddings</h3>
                <p className="text-gray-600">Nikah, Walima, and interfaith ceremonies with religious sensitivity.</p>
              </a>
              <a href="/guides/interfaith-weddings" className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Interfaith Weddings</h3>
                <p className="text-gray-600">Blend traditions respectfully with planners experienced in multicultural ceremonies.</p>
              </a>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <details key={idx} className="group p-6 bg-white rounded-lg border border-gray-200">
                  <summary className="font-semibold text-gray-900 cursor-pointer">
                    {faq.question}
                  </summary>
                  <p className="text-gray-600 mt-4 group-open:block hidden">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Plan Your Perfect Wedding?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of couples who found their dream vendors on Weddings.io
            </p>
            <a href="/planners" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block">
              Find Planners Now
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
