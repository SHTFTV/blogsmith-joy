// app/guides/hindu-wedding-planning/page.tsx
import { articleSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata = {
  title: 'Complete Guide to Hindu Wedding Planning | Weddings.io',
  description: 'Master guide to Hindu wedding ceremonies, traditions, and planning. From Mehendi to Pheras—everything you need to know about Hindu weddings.',
  keywords: 'Hindu wedding planning, Hindu wedding ceremonies, wedding traditions, Mehendi, Sangeet, Haldi, wedding guide',
  canonical: 'https://weddings.io/guides/hindu-wedding-planning',
};

export default function HinduWeddingGuide() {
  const schema = breadcrumbSchema([
    { name: 'Home', url: 'https://weddings.io' },
    { name: 'Guides', url: 'https://weddings.io/guides' },
    { name: 'Hindu Wedding Planning', url: 'https://weddings.io/guides/hindu-wedding-planning' }
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
            <a href="/" className="hover:text-blue-600">Home</a> / <a href="/guides" className="hover:text-blue-600">Guides</a> / Hindu Wedding Planning
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Complete Guide to Hindu Wedding Planning
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Master guide to Hindu wedding ceremonies, traditions, and planning across different regions of India.
          </p>
          <div className="text-sm text-gray-500">
            Published: April 2026 | Updated: April 2026 | Read Time: 12 minutes
          </div>
        </div>

        <div className="prose max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding Hindu Weddings</h2>
            <p className="text-gray-700 mb-4">
              Hindu weddings are among the most elaborate and meaningful celebrations in the world. These multi-day events blend sacred rituals rooted in Vedic traditions with modern celebrations, creating an unforgettable experience that honors both ancient customs and contemporary style.
            </p>
            <p className="text-gray-700 mb-4">
              The beauty of Hindu weddings lies in their regional diversity. A Tamil wedding differs from a Punjabi wedding, which differs from a Gujarati celebration. Yet all share the same spiritual foundation: the sacred union of two souls and the blending of two families.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pre-Wedding Celebrations</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Roka Ceremony</h3>
            <p className="text-gray-700 mb-4">
              The Roka marks the official engagement. Both families gather to exchange gifts and sweets, announcing the upcoming union. This intimate ceremony sets the tone for wedding preparations and allows families to bond before the larger festivities begin.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-8">Mehendi Function</h3>
            <p className="text-gray-700 mb-4">
              One of the most colorful celebrations, the Mehendi is a women-centric event where henna is applied to the bride's hands and feet. This joyous occasion features dancing, singing, and celebration. Guests apply henna as well, making it a community bonding experience. The patterns are intricate, often hiding the groom's initials within—a fun tradition for the groom to find!
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-8">Sangeet Ceremony</h3>
            <p className="text-gray-700 mb-4">
              The Sangeet is an evening of music and dance. Both sides of the family perform traditional and contemporary songs and dances. This celebration showcases family traditions and creates lasting memories. Modern weddings often add choreographed performances, making it a spectacular event.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-8">Haldi Function</h3>
            <p className="text-gray-700 mb-4">
              The Haldi ceremony involves applying turmeric paste (made with milk, rose water, and honey) to the bride and groom. Turmeric is believed to purify and brighten the skin. This intimate gathering happens the day before the wedding, with family members playfully applying haldi to the couple while singing and dancing.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Wedding Day</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Baraat Ceremony</h3>
            <p className="text-gray-700 mb-4">
              The groom's arrival is celebrated with the Baraat—a grand procession featuring music, dance, and festive energy. Traditionally, the groom rides a white horse while his family and friends dance and celebrate alongside. In modern times, decorated cars often replace horses, but the joy and energy remain the same.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-8">Milni & Jaimala</h3>
            <p className="text-gray-700 mb-4">
              Upon arrival, the groom is welcomed by the bride's family. The couple exchanges flower garlands (Jaimala) as a gesture of acceptance and mutual respect. This moment is significant as it represents the first formal acceptance of the couple by both families.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-8">The Mandap Ceremony</h3>
            <p className="text-gray-700 mb-4">
              The wedding ceremony takes place under a beautifully decorated Mandap—a canopy representing the sacred space where the marriage will be solemnized. The four posts of the Mandap symbolize the four parents, and everything within this space is considered auspicious and sacred.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-8">Sacred Rituals</h3>
            <p className="text-gray-700 mb-4">
              <strong>Kanyadaan:</strong> The bride's father formally gives away his daughter to the groom, a moment filled with emotion and significance.<br/><br/>
              <strong>Mangal Pheras:</strong> The couple walks around the sacred fire seven times. Each round represents different promises: love, strength, health, happiness, wealth, family, and lifelong companionship.<br/><br/>
              <strong>Sindoor & Mangalsutra:</strong> The groom applies vermilion (sindoor) on the bride's hair parting and ties the sacred necklace (mangalsutra) around her neck, symbols of marriage that she wears throughout her married life.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Regional Variations</h2>
            <p className="text-gray-700 mb-4">
              Hindu weddings vary significantly across India's regions. Tamil weddings feature the Thali ceremony differently than North Indian weddings. Gujarati weddings include the playful ritual of the bride's mother tugging the groom's nose. Bengali weddings have the beautiful Subho Drishti ceremony where the bride first sees the groom through a betel leaf. Understanding your regional traditions is key to authentic planning.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Planning Checklist</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>12 months before: Finalize dates (consult Hindu calendar/astrology if desired)</li>
              <li>10 months before: Select venue and book vendors</li>
              <li>6 months before: Send save-the-dates</li>
              <li>3 months before: Finalize menus and décor</li>
              <li>1 month before: Confirm guest list and logistics</li>
              <li>1 week before: Final vendor confirmations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Finding the Right Wedding Planner</h2>
            <p className="text-gray-700 mb-4">
              A wedding planner experienced in Hindu traditions can be invaluable. They understand the cultural significance of each ritual, manage the complex logistics of multi-day events, and ensure that every ceremony is executed perfectly while honoring your family's traditions.
            </p>
            <p className="text-gray-700 mb-4">
              Look for planners who have:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Experience with Hindu wedding ceremonies and regional traditions</li>
              <li>A strong vendor network of priests, decorators, and caterers</li>
              <li>Familiarity with your specific regional customs</li>
              <li>References from recent Hindu weddings</li>
              <li>Problem-solving abilities for unexpected situations</li>
            </ul>
          </section>

          <section className="bg-blue-50 p-8 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to Plan Your Hindu Wedding?</h3>
            <p className="text-gray-700 mb-6">
              Find experienced wedding planners who specialize in Hindu ceremonies in your city.
            </p>
            <a href="/planners" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Browse Wedding Planners
            </a>
          </section>
        </div>

        <aside className="mt-12 pt-12 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Related Guides</h3>
          <ul className="space-y-3">
            <li><a href="/guides/sikh-wedding-planning" className="text-blue-600 hover:underline">Complete Guide to Sikh Wedding Planning</a></li>
            <li><a href="/guides/muslim-wedding-planning" className="text-blue-600 hover:underline">Complete Guide to Muslim Wedding Planning</a></li>
            <li><a href="/guides/interfaith-weddings" className="text-blue-600 hover:underline">Planning Interfaith & Multicultural Weddings</a></li>
            <li><a href="/blog/wedding-budget-breakdown" className="text-blue-600 hover:underline">Wedding Budget Breakdown Guide</a></li>
          </ul>
        </aside>
      </article>
    </>
  );
}
