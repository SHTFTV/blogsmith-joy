import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Guide to Sikh Wedding Planning | Traditions & Timeline',
  description: 'Master Sikh wedding planning with our comprehensive guide. Learn about traditions, ceremonies, timeline, and how to honor cultural elements in your celebration.',
  keywords: 'Sikh wedding planning, Anand Karaj, Sikh wedding traditions, wedding ceremony guide',
};

export default function SikhWeddingPlanningGuide() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12 bg-white">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <a href="/" className="hover:text-blue-600">Home</a> / 
        <a href="/guides" className="hover:text-blue-600"> Guides</a> / 
        <span> Sikh Wedding Planning</span>
      </nav>

      {/* Header */}
      <header className="mb-12 pb-8 border-b-2 border-gray-200">
        <h1 className="text-4xl font-serif text-gray-900 mb-4">
          The Complete Guide to Sikh Wedding Planning
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Celebrate your love with authentic Sikh traditions. Master the Anand Karaj ceremony, timeline, and cultural elements that make your wedding meaningful.
        </p>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>📚 12 min read</span>
          <span>✍️ Expert guide</span>
          <span>🕉️ Culturally authentic</span>
        </div>
      </header>

      {/* Table of Contents */}
      <nav className="bg-gray-50 p-6 rounded-lg mb-12">
        <h2 className="font-bold text-gray-900 mb-4">Table of Contents</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li><a href="#understanding" className="hover:text-blue-600">Understanding Sikh Wedding Traditions</a></li>
          <li><a href="#anand-karaj" className="hover:text-blue-600">The Anand Karaj Ceremony</a></li>
          <li><a href="#timeline" className="hover:text-blue-600">12-Month Wedding Timeline</a></li>
          <li><a href="#planning" className="hover:text-blue-600">Planning Checklist</a></li>
          <li><a href="#vendors" className="hover:text-blue-600">Choosing the Right Vendors</a></li>
          <li><a href="#budget" className="hover:text-blue-600">Budget Breakdown</a></li>
          <li><a href="#tips" className="hover:text-blue-600">Expert Planning Tips</a></li>
        </ul>
      </nav>

      {/* Content Sections */}
      <section id="understanding" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Understanding Sikh Wedding Traditions</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Sikh weddings are celebrations of love, commitment, and spiritual union. Unlike many other wedding traditions, Sikh weddings are remarkably egalitarian. The bride and groom are considered equal partners, and the ceremony itself emphasizes mutual respect and lifelong commitment.
        </p>
        <p className="text-gray-700 mb-4 leading-relaxed">
          The word "Sikh" means "student" or "learner," and Sikh weddings reflect this philosophy of continuous learning and growth together. The ceremony is spiritual rather than purely religious, and many Sikh couples choose to incorporate cultural elements from their regional heritage.
        </p>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Key Traditions to Know</h3>
        <ul className="space-y-3 ml-4 text-gray-700">
          <li><strong>Anand Karaj (The Ceremony):</strong> The main wedding ceremony, typically lasting 30-45 minutes, performed in the Gurdwara (Sikh temple).</li>
          <li><strong>Langar:</strong> Community meal served after the ceremony, open to all guests regardless of religion. It symbolizes equality and community service.</li>
          <li><strong>Lavan (The Four Circles):</strong> The couple walks around the Guru Granth Sahib (holy scripture) four times, each circle representing a phase of marriage.</li>
          <li><strong>Roka Ceremony:</strong> Engagement ceremony where the groom's parents formally accept the bride.</li>
          <li><strong>Mehendi:</strong> Pre-wedding celebration where women apply henna. Optional but increasingly popular.</li>
        </ul>
      </section>

      <section id="anand-karaj" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">The Anand Karaj Ceremony: What to Expect</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          The Anand Karaj is the official Sikh wedding ceremony. It must be performed in a Gurdwara with the Guru Granth Sahib (holy scripture) present. Here's what happens:
        </p>
        
        <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Step-by-Step Ceremony Breakdown</h3>
        <div className="bg-blue-50 p-6 rounded-lg space-y-4">
          <div>
            <h4 className="font-bold text-gray-900">1. Milni (Meeting)</h4>
            <p className="text-gray-700 text-sm">The groom's family is formally introduced to the bride's family. This happens before entering the ceremony room.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">2. Ardas (Prayer)</h4>
            <p className="text-gray-700 text-sm">A formal prayer is recited asking for blessings for the couple. The community stands in respect.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">3. The Four Lavan (Rounds)</h4>
            <p className="text-gray-700 text-sm">The couple circles the Guru Granth Sahib four times. Each circle is led by a different kirtan (hymn), representing different aspects of marriage and life.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">4. Anand Sahib (Concluding Prayer)</h4>
            <p className="text-gray-700 text-sm">The Anand Sahib hymn is sung, celebrating joy and bliss. Karah Prasad (blessed pudding) is distributed.</p>
          </div>
        </div>
      </section>

      <section id="timeline" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">12-Month Sikh Wedding Planning Timeline</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          A realistic timeline for planning a Sikh wedding, accounting for cultural ceremonies and vendor coordination.
        </p>

        <div className="space-y-4">
          <div className="border-l-4 border-blue-600 pl-6 py-3">
            <h4 className="font-bold text-gray-900">Months 12-10: Foundation</h4>
            <p className="text-gray-700 text-sm">Set wedding date, book Gurdwara, create guest list, hire wedding planner (if desired), book venue for reception.</p>
          </div>
          <div className="border-l-4 border-blue-600 pl-6 py-3">
            <h4 className="font-bold text-gray-900">Months 9-7: Major Bookings</h4>
            <p className="text-gray-700 text-sm">Book photographer, caterer, florist, music/DJ. Send save-the-dates. Plan Roka ceremony.</p>
          </div>
          <div className="border-l-4 border-blue-600 pl-6 py-3">
            <h4 className="font-bold text-gray-900">Months 6-4: Pre-Wedding Events</h4>
            <p className="text-gray-700 text-sm">Host Roka ceremony, plan and execute Mehendi, begin dress shopping, confirm guest count.</p>
          </div>
          <div className="border-l-4 border-blue-600 pl-6 py-3">
            <h4 className="font-bold text-gray-900">Months 3-1: Final Details</h4>
            <p className="text-gray-700 text-sm">Finalize invitations, confirm all vendor details, arrange accommodations for guests, plan honeymoon, final dress fittings.</p>
          </div>
        </div>
      </section>

      <section id="planning" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Essential Planning Checklist</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-4">Ceremonies & Spiritual</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>☐ Book Gurdwara and priest</li>
              <li>☐ Confirm wedding date with priest</li>
              <li>☐ Plan Roka ceremony details</li>
              <li>☐ Arrange Langar menu</li>
              <li>☐ Coordinate pre-wedding rituals</li>
              <li>☐ Finalize ceremony music/kirtan</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-4">Vendors & Logistics</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>☐ Book photographer & videographer</li>
              <li>☐ Book caterer (with Langar option)</li>
              <li>☐ Book florist for Gurdwara & reception</li>
              <li>☐ Book DJ/music provider</li>
              <li>☐ Book wedding planner (optional)</li>
              <li>☐ Arrange transportation</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="vendors" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Choosing Vendors Who Understand Sikh Traditions</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          The most important decision is choosing vendors who understand and respect Sikh traditions. Look for vendors with experience in Sikh weddings, not just general wedding experience.
        </p>
        
        <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Vendor Selection Criteria</h3>
        <ul className="space-y-4 text-gray-700">
          <li>
            <strong>Experience:</strong> Ask for portfolio of previous Sikh weddings. Look for understanding of Gurdwara requirements and restrictions.
          </li>
          <li>
            <strong>Cultural Sensitivity:</strong> Vendors should understand ceremony timing, Langar service, and cultural elements like Mehendi.
          </li>
          <li>
            <strong>Vendor Coordination:</strong> Best vendors work as a team, especially for transitions between ceremony and reception.
          </li>
          <li>
            <strong>References:</strong> Get references from couples who had similar weddings. Ask specific questions about their experience.
          </li>
        </ul>
      </section>

      <section id="budget" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Sikh Wedding Budget Breakdown</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Average Sikh wedding costs vary widely by region and guest count. Here's a realistic breakdown for 250 guests:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3 font-bold">Category</th>
                <th className="text-left p-3 font-bold">Budget Range</th>
                <th className="text-left p-3 font-bold">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">Gurdwara & Ceremony</td>
                <td className="p-3">$500-2,000</td>
                <td className="p-3 text-gray-600">Booking, langar donation</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Reception Venue</td>
                <td className="p-3">$3,000-8,000</td>
                <td className="p-3 text-gray-600">Varies by location</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Catering</td>
                <td className="p-3">$4,000-12,000</td>
                <td className="p-3 text-gray-600">$15-50 per person</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Photography & Video</td>
                <td className="p-3">$2,000-5,000</td>
                <td className="p-3 text-gray-600">Full day coverage</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Florals & Décor</td>
                <td className="p-3">$2,000-6,000</td>
                <td className="p-3 text-gray-600">Gurdwara + reception</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Music & Entertainment</td>
                <td className="p-3">$1,500-4,000</td>
                <td className="p-3 text-gray-600">Kirtan, DJ, entertainment</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Attire & Jewelry</td>
                <td className="p-3">$2,000-8,000</td>
                <td className="p-3 text-gray-600">Bride & groom outfits</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">TOTAL</td>
                <td className="p-3 font-bold">$15,500-45,000</td>
                <td className="p-3 text-gray-600">For 250 guests</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="tips" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Expert Sikh Wedding Planning Tips</h2>
        
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">1. Respect Gurdwara Rules</h3>
            <p className="text-gray-700">Different Gurdwaras have different rules. Some don't allow photography, music, or certain decorations. Clarify all requirements early with the Gurdwara management.</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">2. Plan Timing Carefully</h3>
            <p className="text-gray-700">The ceremony typically lasts 30-45 minutes. Plan transitions between Gurdwara and reception venue carefully. Travel time can impact vendor schedules.</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">3. Langar is Sacred</h3>
            <p className="text-gray-700">The Langar is not just food—it's a spiritual experience. Ensure quality, respectful service. Many guests remember the Langar as much as the ceremony.</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">4. Hire Culturally Experienced Vendors</h3>
            <p className="text-gray-700">Vendors with Sikh wedding experience understand timing, restrictions, and cultural nuances. They're worth the investment.</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">5. Embrace Flexibility</h3>
            <p className="text-gray-700">Sikh weddings often involve extended families and last-minute changes. Build flexibility into your plans and budget.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-12 pt-12 border-t-2 border-gray-200 text-center">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Ready to Plan Your Sikh Wedding?</h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          Find the perfect wedding planners, venues, and vendors in your city who specialize in Sikh weddings.
        </p>
        <a href="/" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
          Find Vendors in Your City
        </a>
      </section>

      {/* FAQ Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is the Anand Karaj ceremony?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The Anand Karaj is the official Sikh wedding ceremony performed in the Gurdwara. The couple circles the Guru Granth Sahib four times while hymns are sung, representing different phases of marriage.',
              },
            },
            {
              '@type': 'Question',
              name: 'How long does a Sikh wedding ceremony take?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The Anand Karaj ceremony typically lasts 30-45 minutes. The Langar (community meal) that follows can last 1-3 hours depending on guest count.',
              },
            },
            {
              '@type': 'Question',
              name: 'What is Langar?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Langar is the community meal served after the ceremony. It is open to all guests regardless of religion and is a symbol of equality and service in Sikhism.',
              },
            },
          ],
        })}
      </script>
    </article>
  );
}
