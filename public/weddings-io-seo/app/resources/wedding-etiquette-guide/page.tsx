import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wedding Etiquette by Culture | Guest Guide for Different Traditions',
  description: 'Learn wedding etiquette for Hindu, Sikh, Muslim, Christian weddings and more. What to wear, how to behave, what gifts are appropriate.',
  keywords: 'wedding etiquette, cultural wedding customs, how to behave at weddings, wedding guest guide',
};

export default function WeddingEtiquetteGuide() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12 bg-white">
      <nav className="text-sm text-gray-600 mb-6">
        <a href="/" className="hover:text-blue-600">Home</a> / 
        <a href="/resources" className="hover:text-blue-600"> Resources</a> / 
        <span> Wedding Etiquette</span>
      </nav>

      <header className="mb-12 pb-8 border-b-2 border-gray-200">
        <h1 className="text-4xl font-serif text-gray-900 mb-4">
          Wedding Etiquette Across Cultures: A Guest's Guide
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Attend weddings with confidence. Learn proper etiquette, dress codes, gift-giving, and behavior expectations for different cultural traditions.
        </p>
      </header>

      <div className="space-y-8">
        <section>
          <h2 className="text-3xl font-serif text-gray-900">Hindu Wedding Etiquette</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Dress Code</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Formal traditional attire (saree, lehenga, sherwani)</li>
                <li>• Or formal Western clothing</li>
                <li>• Bright colors encouraged (avoid white/black)</li>
                <li>• Remove shoes in temple</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Behavior & Customs</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Arrive on time (ceremonies start at scheduled time)</li>
                <li>• Respect rituals and don't photograph ceremonies</li>
                <li>• Accept prasad (blessed food) with right hand</li>
                <li>• Weddings can last multiple days</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700"><strong>Gift Etiquette:</strong> Cash gifts in auspicious amounts (avoid 4s) or gift items from registry. Typical range: $51-501+</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Sikh Wedding Etiquette</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Dress Code</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Cover head in Gurdwara (scarves provided)</li>
                <li>• Formal traditional or Western attire</li>
                <li>• Avoid black (considered inauspicious)</li>
                <li>• Remove shoes at entrance</li>
              </ul>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Behavior & Customs</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Stand during ceremony as sign of respect</li>
                <li>• No meat/alcohol served (vegetarian only)</li>
                <li>• Langar is open to all regardless of religion</li>
                <li>• Accept Karah Prasad with right hand</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700"><strong>Gift Etiquette:</strong> Cash, gold, or household items. Typical range: $50-500+</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Muslim Wedding Etiquette</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Dress Code</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Modest dress required</li>
                <li>• No alcohol or pork products</li>
                <li>• Formal traditional or Western attire</li>
                <li>• Women may cover hair (optional)</li>
              </ul>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Behavior & Customs</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Nikah ceremony is brief (30-60 minutes)</li>
                <li>• Separate seating at some events (ask beforehand)</li>
                <li>• Only halal food served</li>
                <li>• No music/dancing at some events</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700"><strong>Gift Etiquette:</strong> Cash (avoid alcohol-related gifts). Typical range: $50-500+</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Christian Wedding Etiquette</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Dress Code</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Formal attire (suit, dress)</li>
                <li>• Avoid white (bride's color)</li>
                <li>• Women may wear hats/fascinators</li>
                <li>• Conservative clothing</li>
              </ul>
            </div>
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Behavior & Customs</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Arrive 15 minutes early</li>
                <li>• Stand during vows and recessional</li>
                <li>• Participate in any readings or hymns</li>
                <li>• Reception follows immediately after</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700"><strong>Gift Etiquette:</strong> Items from registry, household goods, or cash. Typical range: $50-250</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Universal Wedding Guest Rules</h2>
          
          <div className="space-y-3 text-gray-700">
            <p>✓ <strong>RSVP on time:</strong> Couples need final headcount.</p>
            <p>✓ <strong>Arrive on time:</strong> Respect the schedule.</p>
            <p>✓ <strong>Dress appropriately:</strong> Match the invitation's dress code.</p>
            <p>✓ <strong>Silence your phone:</strong> Don't interrupt ceremony or speeches.</p>
            <p>✓ <strong>Don't photograph ceremony:</strong> Unless explicitly allowed.</p>
            <p>✓ <strong>Be respectful:</strong> Of customs and rituals you may not understand.</p>
            <p>✓ <strong>Give a gift:</strong> Cash or registry item in your budget range.</p>
            <p>✓ <strong>Send thank you note:</strong> Acknowledge the couple's hospitality.</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Gift-Giving Guidelines by Amount</h2>
          
          <table className="w-full text-sm mt-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Relationship</th>
                <th className="p-3 text-left">Typical Gift Range</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">Close family</td>
                <td className="p-3">$100-500+</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Close friend</td>
                <td className="p-3">$75-200</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Work colleague/acquaintance</td>
                <td className="p-3">$25-75</td>
              </tr>
              <tr>
                <td className="p-3">With guest/plus-one</td>
                <td className="p-3">Add $25-50</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mt-12 pt-12 border-t-2 border-gray-200">
          <p className="text-center text-gray-700">Attending a wedding? Find restaurants and venues in your city to host celebrations.</p>
          <div className="text-center mt-6">
            <a href="/" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
              Find Wedding Venues
            </a>
          </div>
        </section>
      </div>
    </article>
  );
}
