import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Guide to Muslim Wedding Planning | Halal & Traditions',
  description: 'Master Muslim wedding planning. Learn about Nikah ceremony, halal catering, traditions, and how to honor Islamic values in your celebration.',
  keywords: 'Muslim wedding planning, Nikah ceremony, Islamic wedding traditions, halal wedding',
};

export default function MuslimWeddingPlanningGuide() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12 bg-white">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <a href="/" className="hover:text-blue-600">Home</a> / 
        <a href="/guides" className="hover:text-blue-600"> Guides</a> / 
        <span> Muslim Wedding Planning</span>
      </nav>

      {/* Header */}
      <header className="mb-12 pb-8 border-b-2 border-gray-200">
        <h1 className="text-4xl font-serif text-gray-900 mb-4">
          The Complete Guide to Muslim Wedding Planning
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Celebrate your marriage in accordance with Islamic traditions. Master the Nikah ceremony, halal requirements, and cultural customs that honor your faith.
        </p>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>📚 12 min read</span>
          <span>✍️ Expert guide</span>
          <span>☪️ Islamically guided</span>
        </div>
      </header>

      {/* Table of Contents */}
      <nav className="bg-gray-50 p-6 rounded-lg mb-12">
        <h2 className="font-bold text-gray-900 mb-4">Table of Contents</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li><a href="#understanding" className="hover:text-blue-600">Understanding Muslim Marriage</a></li>
          <li><a href="#nikah" className="hover:text-blue-600">The Nikah Ceremony</a></li>
          <li><a href="#timeline" className="hover:text-blue-600">12-Month Planning Timeline</a></li>
          <li><a href="#halal" className="hover:text-blue-600">Halal Requirements</a></li>
          <li><a href="#planning" className="hover:text-blue-600">Planning Checklist</a></li>
          <li><a href="#vendors" className="hover:text-blue-600">Choosing Vendors</a></li>
          <li><a href="#budget" className="hover:text-blue-600">Budget Guide</a></li>
          <li><a href="#tips" className="hover:text-blue-600">Expert Tips</a></li>
        </ul>
      </nav>

      {/* Content Sections */}
      <section id="understanding" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Understanding Muslim Marriage</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          In Islam, marriage is considered a sacred contract (Nikah) and a significant act of worship. It's not merely a social arrangement but a spiritual union with important rights and responsibilities for both partners.
        </p>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Islamic marriage emphasizes mutual respect, kindness, and consent. Both bride and groom have equal say in the decision to marry. The contract explicitly states the rights and obligations of both parties, making it one of the most formal agreements in Islamic law.
        </p>
        
        <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Core Islamic Principles in Muslim Weddings</h3>
        <ul className="space-y-3 ml-4 text-gray-700">
          <li><strong>Consent:</strong> Both bride and groom must freely consent. No one can be forced into marriage.</li>
          <li><strong>Modesty:</strong> Celebrations should reflect Islamic values of modesty and dignity.</li>
          <li><strong>Halal:</strong> All food, beverages, and entertainment must be halal (permissible under Islamic law).</li>
          <li><strong>Mahram:</strong> The bride's guardian (usually father) represents her interests during the contract.</li>
          <li><strong>Mahr:</strong> A mandatory gift from groom to bride, representing his commitment.</li>
          <li><strong>Witnesses:</strong> The Nikah requires witnesses to testify the union.</li>
        </ul>
      </section>

      <section id="nikah" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">The Nikah Ceremony: What to Expect</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          The Nikah is the marriage contract ceremony. It typically lasts 30-60 minutes and is the only legally required ceremony in Islamic tradition. The celebration (Walima) comes after.
        </p>
        
        <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Nikah Ceremony Components</h3>
        <div className="bg-blue-50 p-6 rounded-lg space-y-4">
          <div>
            <h4 className="font-bold text-gray-900">1. Ijab (Offer)</h4>
            <p className="text-gray-700 text-sm">The bride (or her wali/guardian) offers herself to the groom.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">2. Qabul (Acceptance)</h4>
            <p className="text-gray-700 text-sm">The groom accepts the offer. This is the moment of marriage.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">3. Mahr</h4>
            <p className="text-gray-700 text-sm">The groom presents the agreed-upon gift to the bride. This can be money, jewelry, or property.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">4. Khutbah (Sermon)</h4>
            <p className="text-gray-700 text-sm">The Imam delivers advice about marriage rights and responsibilities based on Islamic teachings.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">5. Dua (Prayer)</h4>
            <p className="text-gray-700 text-sm">The Imam or guests make supplications for the couple's happiness and blessings.</p>
          </div>
        </div>
      </section>

      <section id="timeline" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">12-Month Muslim Wedding Planning Timeline</h2>
        
        <div className="space-y-4">
          <div className="border-l-4 border-blue-600 pl-6 py-3">
            <h4 className="font-bold text-gray-900">Months 12-10: Foundation</h4>
            <p className="text-gray-700 text-sm">Set wedding date (check Islamic calendar), book mosque/Imam, get family approval, create guest list, book venue for Walima (reception).</p>
          </div>
          <div className="border-l-4 border-blue-600 pl-6 py-3">
            <h4 className="font-bold text-gray-900">Months 9-7: Planning Begins</h4>
            <p className="text-gray-700 text-sm">Book halal caterer, photographer, florist. Send save-the-dates. Plan Mehendi (if doing one). Confirm Mahr amount and details.</p>
          </div>
          <div className="border-l-4 border-blue-600 pl-6 py-3">
            <h4 className="font-bold text-gray-900">Months 6-4: Pre-Wedding Events</h4>
            <p className="text-gray-700 text-sm">Host Mehendi and Baraat (if traditional). Shop for wedding attire. Confirm halal requirements with all vendors.</p>
          </div>
          <div className="border-l-4 border-blue-600 pl-6 py-3">
            <h4 className="font-bold text-gray-900">Months 3-1: Final Preparations</h4>
            <p className="text-gray-700 text-sm">Send invitations (Nikah + Walima), finalize all vendor details, Mahr handover logistics, honeymoon planning.</p>
          </div>
        </div>
      </section>

      <section id="halal" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Halal Wedding Requirements</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Halal is not just about food—it encompasses the entire celebration. Here's what to require from vendors:
        </p>

        <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Halal Catering Requirements</h3>
        <div className="bg-gray-50 p-6 rounded-lg space-y-3 mb-6">
          <p className="text-gray-700"><strong>Meat:</strong> Must be halal-certified. Ask for certification documents.</p>
          <p className="text-gray-700"><strong>Alcohol:</strong> None. Not even in cooking. Ask about all recipes and ingredients.</p>
          <p className="text-gray-700"><strong>Seafood:</strong> Only fish and other permissible seafood (no shellfish).</p>
          <p className="text-gray-700"><strong>Gelatin & Additives:</strong> Must be halal. Check all processed foods.</p>
          <p className="text-gray-700"><strong>Cross-contamination:</strong> Use separate utensils, prep areas, and cooking surfaces.</p>
        </div>

        <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Other Halal Considerations</h3>
        <ul className="space-y-3 ml-4 text-gray-700">
          <li><strong>Entertainment:</strong> No music with lyrics about non-Islamic themes. Instrumental music is debated—clarify with your Imam.</li>
          <li><strong>Attire:</strong> Ensure modest dress codes are respected. Some events may be gender-separated.</li>
          <li><strong>Timing:</strong> Plan around prayer times (Salah). Some guests may need prayer space.</li>
          <li><strong>Photography:</strong> Ask guests to respect modesty guidelines when taking photos.</li>
        </ul>
      </section>

      <section id="planning" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Muslim Wedding Planning Checklist</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-4">Islamic Requirements</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>☐ Book Imam & mosque</li>
              <li>☐ Confirm Islamic calendar date</li>
              <li>☐ Determine Mahr with families</li>
              <li>☐ Arrange wali (bride's guardian)</li>
              <li>☐ Plan Nikah contract details</li>
              <li>☐ Confirm witnesses (usually 2)</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-4">Vendors & Logistics</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>☐ Book halal-certified caterer</li>
              <li>☐ Book photographer/videographer</li>
              <li>☐ Book florist (confirm halal decor)</li>
              <li>☐ Book DJ/entertainment (halal only)</li>
              <li>☐ Arrange prayer space for guests</li>
              <li>☐ Plan modest guest attire guidelines</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="vendors" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Choosing Halal-Certified Vendors</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          The most critical vendor decision is the caterer. They must have halal certification and understand Islamic requirements completely.
        </p>
        
        <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Vendor Selection Criteria</h3>
        <ul className="space-y-4 text-gray-700">
          <li>
            <strong>Halal Certification:</strong> Ask for documentation from recognized halal certifying bodies.
          </li>
          <li>
            <strong>Experience:</strong> Request references from previous Muslim weddings. Ask specific questions about halal compliance.
          </li>
          <li>
            <strong>Understanding:</strong> Vendors should understand prayer times, modest dress, and Islamic values.
          </li>
          <li>
            <strong>Communication:</strong> Will they work with your Imam if needed? Are they responsive to your requirements?
          </li>
          <li>
            <strong>Flexibility:</strong> Can they accommodate prayer breaks, gender-separated events, or other specific requests?
          </li>
        </ul>
      </section>

      <section id="budget" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Muslim Wedding Budget Breakdown</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Average Muslim wedding costs for 200-300 guests across ceremonies:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3 font-bold">Item</th>
                <th className="text-left p-3 font-bold">Budget</th>
                <th className="text-left p-3 font-bold">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">Nikah Ceremony</td>
                <td className="p-3">$500-2,000</td>
                <td className="p-3 text-gray-600">Mosque, Imam, Mahr</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Mehendi (if doing)</td>
                <td className="p-3">$2,000-8,000</td>
                <td className="p-3 text-gray-600">Venue, food, henna</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Walima Reception</td>
                <td className="p-3">$3,000-8,000</td>
                <td className="p-3 text-gray-600">Venue rental</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Halal Catering</td>
                <td className="p-3">$4,000-12,000</td>
                <td className="p-3 text-gray-600">$20-40 per person</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Photography/Video</td>
                <td className="p-3">$2,000-5,000</td>
                <td className="p-3 text-gray-600">Nikah + Walima</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Florals & Decor</td>
                <td className="p-3">$2,000-6,000</td>
                <td className="p-3 text-gray-600">Modest, elegant</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Attire & Jewelry</td>
                <td className="p-3">$2,000-8,000</td>
                <td className="p-3 text-gray-600">Bride & groom outfits</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">TOTAL</td>
                <td className="p-3 font-bold">$15,500-49,000</td>
                <td className="p-3 text-gray-600">For 200-300 guests</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="tips" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Expert Muslim Wedding Planning Tips</h2>
        
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">1. Consult Your Imam Early</h3>
            <p className="text-gray-700">Different Islamic schools (Madhabs) have different practices. Your Imam can guide you on what's acceptable and help coordinate with vendors.</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">2. Verify Halal Certification</h3>
            <p className="text-gray-700">Don't assume a restaurant or caterer is halal. Always ask for certification. Many are willing to provide it upon request.</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">3. Plan Prayer Logistics</h3>
            <p className="text-gray-700">Ensure your venue has space for prayers (especially Jummah if on Friday). Provide prayer time schedules for guests.</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">4. Communicate Dress Code Clearly</h3>
            <p className="text-gray-700">Send invitations with clear guidance on modest dress. This prevents confusion and ensures a cohesive aesthetic.</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">5. Embrace Flexibility on Timing</h3>
            <p className="text-gray-700">Muslim weddings often involve multiple ceremonies and events. Build buffer time between events for prayers and transitions.</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">6. Make Nikah The Focus</h3>
            <p className="text-gray-700">Remember that the Nikah is the religious ceremony. The Walima is celebration. Ensure the Nikah gets appropriate attention and respect.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-12 pt-12 border-t-2 border-gray-200 text-center">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Ready to Plan Your Muslim Wedding?</h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          Find halal-certified vendors, experienced planners, and mosques in your city.
        </p>
        <a href="/" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
          Find Halal Vendors in Your City
        </a>
      </section>
    </article>
  );
}
