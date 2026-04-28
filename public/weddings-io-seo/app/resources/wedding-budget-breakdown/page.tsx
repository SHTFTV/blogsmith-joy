// app/resources/wedding-budget-breakdown/page.tsx
import { articleSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata = {
  title: 'Wedding Budget Breakdown 2024 | Comprehensive Cost Guide | Weddings.io',
  description: 'Complete wedding budget breakdown for South Asian weddings. Understand costs for venues, catering, décor, photography & more. Planning tools included.',
  keywords: 'wedding budget, wedding costs, wedding expense breakdown, wedding pricing',
  canonical: 'https://weddings.io/resources/wedding-budget-breakdown',
};

export default function BudgetGuide() {
  const schema = breadcrumbSchema([
    { name: 'Home', url: 'https://weddings.io' },
    { name: 'Resources', url: 'https://weddings.io/resources' },
    { name: 'Wedding Budget Breakdown', url: 'https://weddings.io/resources/wedding-budget-breakdown' }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <nav className="text-sm text-gray-600 mb-4">
            <a href="/" className="hover:text-blue-600">Home</a> / <a href="/resources" className="hover:text-blue-600">Resources</a> / Wedding Budget Breakdown
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Wedding Budget Breakdown 2024: Complete Cost Guide
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Comprehensive breakdown of wedding expenses for South Asian celebrations. Plan your budget with confidence.
          </p>
          <div className="text-sm text-gray-500">
            Published: April 2026 | Updated: April 2026 | Read Time: 10 minutes
          </div>
        </div>

        <div className="prose max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding Wedding Costs</h2>
            <p className="text-gray-700 mb-4">
              South Asian weddings are celebrations of love and culture, but they can also be significant financial investments. Understanding where your money goes is crucial for effective budget planning.
            </p>
            <p className="text-gray-700 mb-4">
              The average South Asian wedding in North America costs between $30,000 - $150,000+, depending on guest count, location, and celebration scale. However, costs can range from intimate $15,000 affairs to lavish $500,000+ celebrations.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Typical Budget Breakdown</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Average Wedding Budget ($75,000)</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 text-gray-900">Category</th>
                    <th className="text-right py-2 text-gray-900">Amount</th>
                    <th className="text-right py-2 text-gray-900">% of Budget</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-200"><td className="py-2">Venue & Catering</td><td className="text-right">$30,000</td><td className="text-right">40%</td></tr>
                  <tr className="border-b border-gray-200"><td className="py-2">Photography & Videography</td><td className="text-right">$6,000</td><td className="text-right">8%</td></tr>
                  <tr className="border-b border-gray-200"><td className="py-2">Décor & Flowers</td><td className="text-right">$9,000</td><td className="text-right">12%</td></tr>
                  <tr className="border-b border-gray-200"><td className="py-2">Music & Entertainment</td><td className="py-2">$4,500</td><td className="text-right">6%</td></tr>
                  <tr className="border-b border-gray-200"><td className="py-2">Wedding Attire</td><td className="text-right">$3,750</td><td className="text-right">5%</td></tr>
                  <tr className="border-b border-gray-200"><td className="py-2">Invitations & Paper</td><td className="text-right">$1,500</td><td className="text-right">2%</td></tr>
                  <tr className="border-b border-gray-200"><td className="py-2">Hair & Makeup</td><td className="text-right">$2,250</td><td className="text-right">3%</td></tr>
                  <tr className="border-b border-gray-200"><td className="py-2">Rings & Jewelry</td><td className="text-right">$4,500</td><td className="text-right">6%</td></tr>
                  <tr className="border-b border-gray-200"><td className="py-2">Guest Accommodations & Travel</td><td className="text-right">$7,500</td><td className="text-right">10%</td></tr>
                  <tr className="border-b border-gray-200"><td className="py-2">Miscellaneous</td><td className="text-right">$6,000</td><td className="text-right">8%</td></tr>
                  <tr className="font-semibold"><td className="py-3">TOTAL</td><td className="text-right py-3">$75,000</td><td className="text-right py-3">100%</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Major Expense Categories</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">1. Venue & Catering (40%)</h3>
            <p className="text-gray-700 mb-4">
              This is typically your largest expense. Costs vary by location, season, and menu. A basic banquet hall in a smaller city might run $5,000-10,000, while luxury venues in major cities can exceed $30,000+. Catering rates range from $50-200+ per person depending on menu complexity.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Venue rental: $3,000-20,000</li>
              <li>Catering: $15,000-50,000+ (depends on guest count & menu)</li>
              <li>Bar service: $2,000-10,000</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2. Décor & Flowers (12%)</h3>
            <p className="text-gray-700 mb-4">
              Beautiful décor transforms spaces but costs add up. Mandap flowers, stage arrangements, centerpieces, and ambient lighting all contribute to the visual experience.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Floral arrangements & Mandap: $3,000-8,000</li>
              <li>Lighting & staging: $2,000-4,000</li>
              <li>Centerpieces & linens: $2,000-4,000</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3. Photography & Videography (8%)</h3>
            <p className="text-gray-700 mb-4">
              Professional documentation is essential. Quality photographers charge $3,000-10,000 for full-day coverage, while videographers add $2,000-8,000.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4. Music & Entertainment (6%)</h3>
            <p className="text-gray-700 mb-4">
              From DJ to live band to Sangeet choreography, entertainment costs vary widely: $1,500-10,000+
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Money-Saving Tips</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-3">
              <li><strong>Off-peak timing:</strong> Winter weekday weddings cost 20-30% less than summer weekends</li>
              <li><strong>Limit guest count:</strong> Each guest adds $50-200 to costs</li>
              <li><strong>Streamline events:</strong> Combine ceremonies to reduce venue/catering costs</li>
              <li><strong>Negotiate packages:</strong> Venues often offer bundled deals</li>
              <li><strong>DIY elements:</strong> Handle invitations, favors, or playlists yourself</li>
              <li><strong>Digital details:</strong> E-invitations vs printed; digital RSVPs</li>
              <li><strong>Group discounts:</strong> Negotiate hotel rates for guest blocks</li>
            </ul>
          </section>

          <section className="bg-blue-50 p-8 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help Creating Your Budget?</h3>
            <p className="text-gray-700 mb-6">
              Work with an experienced wedding planner who can help you allocate funds wisely and negotiate vendor rates.
            </p>
            <a href="/planners" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Find a Wedding Planner
            </a>
          </section>
        </div>
      </article>
    </>
  );
}
