import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wedding Vendor Selection Guide | How to Choose the Right Vendors',
  description: 'Learn how to select, vet, and hire the perfect wedding vendors. Expert tips on photographer, caterer, florist, DJ selection.',
  keywords: 'wedding vendors, vendor selection, how to choose wedding vendors, wedding vendor tips',
};

export default function VendorSelectionGuide() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12 bg-white">
      <nav className="text-sm text-gray-600 mb-6">
        <a href="/" className="hover:text-blue-600">Home</a> / 
        <a href="/resources" className="hover:text-blue-600"> Resources</a> / 
        <span> Vendor Selection Guide</span>
      </nav>

      <header className="mb-12 pb-8 border-b-2 border-gray-200">
        <h1 className="text-4xl font-serif text-gray-900 mb-4">
          Wedding Vendor Selection Guide: How to Choose the Right Team
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Master the art of vendor selection. Learn what to look for, what questions to ask, and how to evaluate vendors for your wedding.
        </p>
      </header>

      <div className="space-y-8">
        <section>
          <h2 className="text-3xl font-serif text-gray-900">The 5 Key Vendor Roles</h2>
          <p className="text-gray-700">Every wedding needs these core vendors:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-gray-900">Photographer</h3>
              <p className="text-gray-700 text-sm">Captures your day. Spend time here—photos last forever.</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-gray-900">Caterer</h3>
              <p className="text-gray-700 text-sm">Feeds your guests. Quality matters. Test the food.</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-gray-900">Florist</h3>
              <p className="text-gray-700 text-sm">Creates the aesthetic. Impacts photos and atmosphere.</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-gray-900">DJ/Entertainment</h3>
              <p className="text-gray-700 text-sm">Sets the mood. Keeps guests engaged.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">How to Evaluate Vendors</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">1. Look at Portfolio</h3>
              <p className="text-gray-700 text-sm">Review at least 10-15 past projects. Do their style match yours? Are they consistent?</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">2. Check References</h3>
              <p className="text-gray-700 text-sm">Ask for references from past clients. Call them. Ask specific questions about the vendor's professionalism and quality.</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">3. Interview in Person</h3>
              <p className="text-gray-700 text-sm">Meet the vendor (or the person who'll work on your wedding). Trust your gut. Do they listen? Are they excited about your vision?</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">4. Test the Product</h3>
              <p className="text-gray-700 text-sm">For caterers: attend a tasting. For florists: see samples. For DJs: ask about music demos.</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">5. Review the Contract</h3>
              <p className="text-gray-700 text-sm">Understand what's included, payment terms, cancellation policy, and contingency plans.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Red Flags to Watch For</h2>
          
          <ul className="space-y-3 text-gray-700">
            <li>❌ <strong>Poor communication:</strong> Slow to respond or unclear about details</li>
            <li>❌ <strong>Inflexible:</strong> Won't accommodate your vision or needs</li>
            <li>❌ <strong>No references:</strong> Can't or won't provide past client contact info</li>
            <li>❌ <strong>Vague pricing:</strong> Unclear about what's included or hidden costs appear</li>
            <li>❌ <strong>Unprofessional portfolio:</strong> Inconsistent quality or work that doesn't match your style</li>
            <li>❌ <strong>Pressure tactics:</strong> Pushing you to book immediately or make decisions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Questions to Ask Every Vendor</h2>
          
          <div className="bg-blue-50 p-6 rounded-lg space-y-3">
            <p className="text-gray-700"><strong>1. How much experience do you have with [cultural/religious] weddings?</strong></p>
            <p className="text-gray-700"><strong>2. Can you provide 3 recent references?</strong></p>
            <p className="text-gray-700"><strong>3. What's included in your package? What's extra?</strong></p>
            <p className="text-gray-700"><strong>4. What's your cancellation/refund policy?</strong></p>
            <p className="text-gray-700"><strong>5. How do you handle unexpected issues or last-minute changes?</strong></p>
            <p className="text-gray-700"><strong>6. Who specifically will be working on my wedding?</strong></p>
            <p className="text-gray-700"><strong>7. How do you stay in communication leading up to the wedding?</strong></p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Budget Allocation Tips</h2>
          
          <p className="text-gray-700 mb-4">Most couples allocate budget like this:</p>
          <ul className="space-y-2 text-gray-700">
            <li>• <strong>Venue:</strong> 30-35%</li>
            <li>• <strong>Catering:</strong> 25-30%</li>
            <li>• <strong>Photography:</strong> 10-15%</li>
            <li>• <strong>Flowers & Décor:</strong> 8-12%</li>
            <li>• <strong>Entertainment/DJ:</strong> 5-10%</li>
            <li>• <strong>Other (attire, invitations, transportation):</strong> 10-15%</li>
          </ul>
        </section>

        <section className="mt-12 pt-12 border-t-2 border-gray-200">
          <p className="text-center text-gray-700">Ready to book your vendors? Find experienced professionals in your area.</p>
          <div className="text-center mt-6">
            <a href="/" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
              Find Vendors in Your City
            </a>
          </div>
        </section>
      </div>
    </article>
  );
}
