import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Guide to Interfaith Wedding Planning | Honor Both Traditions',
  description: 'Plan an interfaith wedding that honors both cultural and religious traditions. Master ceremony design, family dynamics, and inclusive celebration.',
  keywords: 'interfaith wedding planning, mixed religion wedding, cultural integration, inclusive ceremony',
};

export default function InterfaithWeddingPlanningGuide() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12 bg-white">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <a href="/" className="hover:text-blue-600">Home</a> / 
        <a href="/guides" className="hover:text-blue-600"> Guides</a> / 
        <span> Interfaith Wedding Planning</span>
      </nav>

      {/* Header */}
      <header className="mb-12 pb-8 border-b-2 border-gray-200">
        <h1 className="text-4xl font-serif text-gray-900 mb-4">
          The Complete Guide to Interfaith Wedding Planning
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Create a ceremony that honors both traditions. Master the art of blending cultures, managing family expectations, and designing a celebration that's authentically yours.
        </p>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>📚 12 min read</span>
          <span>✍️ Expert guide</span>
          <span>🤝 Inclusive approach</span>
        </div>
      </header>

      {/* Table of Contents */}
      <nav className="bg-gray-50 p-6 rounded-lg mb-12">
        <h2 className="font-bold text-gray-900 mb-4">Table of Contents</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li><a href="#unique" className="hover:text-blue-600">What Makes Interfaith Weddings Unique</a></li>
          <li><a href="#ceremony" className="hover:text-blue-600">Designing Your Ceremony</a></li>
          <li><a href="#families" className="hover:text-blue-600">Managing Family Expectations</a></li>
          <li><a href="#timeline" className="hover:text-blue-600">Planning Timeline</a></li>
          <li><a href="#vendors" className="hover:text-blue-600">Choosing Inclusive Vendors</a></li>
          <li><a href="#logistics" className="hover:text-blue-600">Logistics & Details</a></li>
          <li><a href="#budget" className="hover:text-blue-600">Budget Considerations</a></li>
          <li><a href="#tips" className="hover:text-blue-600">Expert Tips for Success</a></li>
        </ul>
      </nav>

      {/* Content Sections */}
      <section id="unique" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">What Makes Interfaith Weddings Unique</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Interfaith weddings celebrate the union of two people from different religious and cultural backgrounds. They present unique opportunities to honor both traditions while creating something entirely new.
        </p>
        <p className="text-gray-700 mb-4 leading-relaxed">
          The most successful interfaith weddings are designed with intention. Rather than trying to do everything from both traditions, couples thoughtfully select elements that are meaningful to them and blend them cohesively.
        </p>
        
        <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Key Challenges & Opportunities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 p-6 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-3">Common Challenges</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Family expectations differ</li>
              <li>• Religious traditions may conflict</li>
              <li>• Finding inclusive vendors</li>
              <li>• Guest comfort with differences</li>
              <li>• Logistics of dual ceremonies</li>
            </ul>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-3">Key Opportunities</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Create a unique celebration</li>
              <li>• Bridge two communities</li>
              <li>• Teach guests about both cultures</li>
              <li>• Design ceremony from scratch</li>
              <li>• Authentic personal expression</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="ceremony" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Designing Your Interfaith Ceremony</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          The ceremony is your chance to honor both traditions. There are several approaches to consider:
        </p>
        
        <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Ceremony Design Approaches</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-600 pl-6 py-3">
            <h4 className="font-bold text-gray-900">Sequential Ceremonies</h4>
            <p className="text-gray-700 text-sm">Perform both religious ceremonies back-to-back. Example: Christian vows followed by Hindu rituals. Usually 60-90 minutes total.</p>
            <p className="text-gray-700 text-sm mt-2"><strong>Pros:</strong> Each tradition gets full respect. Guests see both ceremonies.</p>
            <p className="text-gray-700 text-sm"><strong>Cons:</strong> Long, can lose guest attention. Logistical complexity.</p>
          </div>

          <div className="border-l-4 border-blue-600 pl-6 py-3">
            <h4 className="font-bold text-gray-900">Blended Ceremony</h4>
            <p className="text-gray-700 text-sm">Weave elements from both traditions into one cohesive ceremony. Example: Exchange rings (Christian) then have family blessings (Hindu).</p>
            <p className="text-gray-700 text-sm mt-2"><strong>Pros:</strong> Unified narrative. Honors both traditions without feeling fragmented.</p>
            <p className="text-gray-700 text-sm"><strong>Cons:</strong> Requires careful planning. May not satisfy traditionalists.</p>
          </div>

          <div className="border-l-4 border-blue-600 pl-6 py-3">
            <h4 className="font-bold text-gray-900">Multi-Day Celebration</h4>
            <p className="text-gray-700 text-sm">Host separate ceremonies on different days. Example: Hindu wedding on Saturday, Christian commitment ceremony on Sunday.</p>
            <p className="text-gray-700 text-sm mt-2"><strong>Pros:</strong> Each tradition gets dedicated time and focus.</p>
            <p className="text-gray-700 text-sm"><strong>Cons:</strong> Expensive. Demanding on guests. Complex coordination.</p>
          </div>

          <div className="border-l-4 border-blue-600 pl-6 py-3">
            <h4 className="font-bold text-gray-900">Secular + Religious</h4>
            <p className="text-gray-700 text-sm">Hold a secular/civil ceremony as the official marriage, then honor religious elements in celebration.</p>
            <p className="text-gray-700 text-sm mt-2"><strong>Pros:</strong> Clean separation. Everyone attends the same ceremony.</p>
            <p className="text-gray-700 text-sm"><strong>Cons:</strong> Traditionalists may feel their religion wasn't honored.</p>
          </div>
        </div>
      </section>

      <section id="families" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Managing Family Expectations</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Family dynamics can be the biggest challenge in interfaith weddings. Open, honest communication early is essential.
        </p>
        
        <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Family Conversation Strategy</h3>
        <div className="bg-blue-50 p-6 rounded-lg space-y-4">
          <div>
            <h4 className="font-bold text-gray-900">Step 1: Understand Their Values</h4>
            <p className="text-gray-700 text-sm">Ask each family what matters most to them in the ceremony. Is it religious elements? Cultural traditions? Specific rituals?</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Step 2: Share Your Vision</h4>
            <p className="text-gray-700 text-sm">Explain your ceremony design thoughtfully. Show how both traditions are honored. Use examples or visual mockups.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Step 3: Find Compromise</h4>
            <p className="text-gray-700 text-sm">If there's resistance, identify what's non-negotiable vs. flexible. Are there symbolic ways to honor their tradition?</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Step 4: Involve Religious Leaders</h4>
            <p className="text-gray-700 text-sm">Priests, rabbis, imams, or monks can often help bridge gaps and explain what's possible within their traditions.</p>
          </div>
        </div>
      </section>

      <section id="timeline" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Interfaith Wedding Planning Timeline</h2>
        
        <div className="space-y-4">
          <div className="border-l-4 border-blue-600 pl-6 py-3">
            <h4 className="font-bold text-gray-900">Months 12-10: Foundation</h4>
            <p className="text-gray-700 text-sm">Decide on ceremony approach (sequential, blended, etc.). Talk with both families. Consult religious leaders. Book officiant who understands interfaith.</p>
          </div>
          <div className="border-l-4 border-blue-600 pl-6 py-3">
            <h4 className="font-bold text-gray-900">Months 9-7: Vendor Selection</h4>
            <p className="text-gray-700 text-sm">Book venues that can accommodate both ceremonies/traditions. Hire photographer experienced with interfaith weddings. Book caterer familiar with both cuisines.</p>
          </div>
          <div className="border-l-4 border-blue-600 pl-6 py-3">
            <h4 className="font-bold text-gray-900">Months 6-4: Ceremony Planning</h4>
            <p className="text-gray-700 text-sm">Work with religious leaders to finalize ceremony details. Create unified program/timeline. Design invitations that explain both traditions.</p>
          </div>
          <div className="border-l-4 border-blue-600 pl-6 py-3">
            <h4 className="font-bold text-gray-900">Months 3-1: Coordination</h4>
            <p className="text-gray-700 text-sm">Confirm all vendor details. Send detailed invitations explaining both ceremonies. Brief vendors on cultural sensitivities. Final rehearsal with both officiant teams.</p>
          </div>
        </div>
      </section>

      <section id="vendors" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Choosing Inclusive Vendors</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Vendors experienced with interfaith weddings understand the unique logistics and sensitivities involved.
        </p>
        
        <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Vendor Selection Criteria</h3>
        <ul className="space-y-4 text-gray-700">
          <li>
            <strong>Interfaith Experience:</strong> Ask specifically about previous interfaith weddings. What traditions have they worked with? Can they provide references?
          </li>
          <li>
            <strong>Flexibility:</strong> Are they adaptable to timeline changes, religious requirements, or cultural protocols?
          </li>
          <li>
            <strong>Communication:</strong> Will they work with multiple families, religious leaders, and coordinate accordingly?
          </li>
          <li>
            <strong>Understanding:</strong> Do they understand why certain traditions matter? Can they explain options respectfully?
          </li>
          <li>
            <strong>Catering Knowledge:</strong> Caterers should know dietary restrictions from both traditions (vegetarian for Hindus, halal for Muslims, kosher for Jews, etc.)
          </li>
        </ul>
      </section>

      <section id="logistics" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Key Logistics to Plan</h2>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-2">Program & Signage</h4>
            <p className="text-gray-700 text-sm">Create a detailed program explaining both traditions. Help guests understand what's happening and why it matters.</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-2">Dress Code</h4>
            <p className="text-gray-700 text-sm">Consider if one tradition requires specific attire (saris, kippahs, headscarves). Communicate clearly what's expected and what's optional.</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-2">Dietary Restrictions</h4>
            <p className="text-gray-700 text-sm">Work with caterer to offer options from both traditions. Many guests may be vegetarian, vegan, or have religious dietary restrictions.</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-2">Multiple Locations</h4>
            <p className="text-gray-700 text-sm">If doing sequential ceremonies, coordinate venue changes smoothly. Allow 30-45 min between locations for transport and setup.</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-2">Guest Welcome</h4>
            <p className="text-gray-700 text-sm">Assign someone to explain traditions to unfamiliar guests. Have ushers who understand both cultures available to answer questions.</p>
          </div>
        </div>
      </section>

      <section id="budget" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Interfaith Wedding Budget Considerations</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Interfaith weddings often cost more due to dual ceremonies, multiple venues, or extended celebrations. Budget accordingly:
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
                <td className="p-3">Religious Leaders/Officiants</td>
                <td className="p-3">$500-2,000</td>
                <td className="p-3 text-gray-600">May need 2 priests/rabbis</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Venues (ceremonies)</td>
                <td className="p-3">$1,000-5,000</td>
                <td className="p-3 text-gray-600">May need 2 if sequential</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Reception Venue</td>
                <td className="p-3">$3,000-8,000</td>
                <td className="p-3 text-gray-600">Accessible to both communities</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Catering</td>
                <td className="p-3">$5,000-15,000</td>
                <td className="p-3 text-gray-600">Multiple menu options</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Photography/Video</td>
                <td className="p-3">$2,500-6,000</td>
                <td className="p-3 text-gray-600">Longer day if dual ceremonies</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Florals & Décor</td>
                <td className="p-3">$2,500-7,000</td>
                <td className="p-3 text-gray-600">May design for 2 spaces</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Attire</td>
                <td className="p-3">$2,000-10,000</td>
                <td className="p-3 text-gray-600">May need multiple outfits per person</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">TOTAL</td>
                <td className="p-3 font-bold">$18,000-53,000</td>
                <td className="p-3 text-gray-600">For ~200 guests</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="tips" className="mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Expert Tips for Successful Interfaith Weddings</h2>
        
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">1. Make It Intentional, Not Superficial</h3>
            <p className="text-gray-700">Don't include traditions just to check a box. Each element should be meaningful to you both. Guests respect authenticity.</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">2. Educate Your Guests</h3>
            <p className="text-gray-700">A detailed program explaining what's happening, why it matters, and what guests should do helps everyone feel included and respectful.</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">3. Work With Religious Leaders Early</h3>
            <p className="text-gray-700">Priests, rabbis, imams, and monks can often find creative solutions within their traditions. They're your biggest allies.</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">4. Prioritize Family Buy-In</h3>
            <p className="text-gray-700">Family support makes the wedding meaningful. Invest time in conversations, involve them in planning, and seek compromises that work for everyone.</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">5. Create Neutral Spaces</h3>
            <p className="text-gray-700">Choose neutral venues when possible. Some families may not feel comfortable in the other tradition's religious space.</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">6. Tell Your Story</h3>
            <p className="text-gray-700">Use your invitation, program, and reception to tell how your two traditions came together. It helps guests understand and celebrate with you.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-12 pt-12 border-t-2 border-gray-200 text-center">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Ready to Plan Your Interfaith Wedding?</h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          Find experienced planners, interfaith-friendly venues, and vendors who understand your vision.
        </p>
        <a href="/" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
          Find Interfaith-Friendly Vendors
        </a>
      </section>
    </article>
  );
}
