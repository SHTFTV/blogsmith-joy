import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '12-Month Wedding Planning Timeline | Complete Month-by-Month Guide',
  description: 'Follow our complete 12-month wedding planning timeline. Never miss a deadline with this comprehensive month-by-month guide.',
  keywords: 'wedding timeline, 12 month wedding planning, wedding planning checklist, wedding timeline guide',
};

export default function WeddingTimelineGuide() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12 bg-white">
      <nav className="text-sm text-gray-600 mb-6">
        <a href="/" className="hover:text-blue-600">Home</a> / 
        <a href="/resources" className="hover:text-blue-600"> Resources</a> / 
        <span> Wedding Timeline</span>
      </nav>

      <header className="mb-12 pb-8 border-b-2 border-gray-200">
        <h1 className="text-4xl font-serif text-gray-900 mb-4">
          The Complete 12-Month Wedding Planning Timeline
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Master your wedding planning with this month-by-month roadmap. Stay organized, never miss a deadline, and enjoy the planning process.
        </p>
      </header>

      <div className="prose prose-lg max-w-none space-y-8">
        <section>
          <h2 className="text-3xl font-serif text-gray-900">Month 12-11: The Big Picture</h2>
          <p>This is when it gets real. You've decided to get married. Now it's time to plan the actual wedding.</p>
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="font-bold text-gray-900 mb-2">Key Tasks:</p>
            <p className="text-gray-700 text-sm">✓ Set your wedding date (consider season, venue availability, important dates)</p>
            <p className="text-gray-700 text-sm">✓ Determine approximate guest count</p>
            <p className="text-gray-700 text-sm">✓ Set overall budget</p>
            <p className="text-gray-700 text-sm">✓ Start venue search and book your top choice</p>
            <p className="text-gray-700 text-sm">✓ Book photographer (they book early)</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Month 10-9: Build Your Team</h2>
          <p>Once you have a venue and date, book your key vendors quickly. The good ones are booked fast.</p>
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="font-bold text-gray-900 mb-2">Key Tasks:</p>
            <p className="text-gray-700 text-sm">✓ Book wedding planner (if using one)</p>
            <p className="text-gray-700 text-sm">✓ Book caterer and finalize menu options</p>
            <p className="text-gray-700 text-sm">✓ Book florist</p>
            <p className="text-gray-700 text-sm">✓ Book music/DJ</p>
            <p className="text-gray-700 text-sm">✓ Send out save-the-dates</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Month 8-6: Make It Personal</h2>
          <p>Now that the vendors are locked in, personalize your wedding and plan pre-wedding events.</p>
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="font-bold text-gray-900 mb-2">Key Tasks:</p>
            <p className="text-gray-700 text-sm">✓ Design and send formal invitations</p>
            <p className="text-gray-700 text-sm">✓ Plan and host engagement party or Mehendi</p>
            <p className="text-gray-700 text-sm">✓ Start wedding dress/attire shopping</p>
            <p className="text-gray-700 text-sm">✓ Create wedding website</p>
            <p className="text-gray-700 text-sm">✓ Book accommodations for out-of-town guests</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Month 5-3: Final Details</h2>
          <p>As the wedding gets closer, finalize all the details and confirm everything with vendors.</p>
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="font-bold text-gray-900 mb-2">Key Tasks:</p>
            <p className="text-gray-700 text-sm">✓ Confirm final guest count and get seating chart started</p>
            <p className="text-gray-700 text-sm">✓ Finalize all vendor details (timing, menu, music, flowers)</p>
            <p className="text-gray-700 text-sm">✓ Plan honeymoon</p>
            <p className="text-gray-700 text-sm">✓ Get dress fitted and tailored</p>
            <p className="text-gray-700 text-sm">✓ Plan wedding day timeline</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Month 2-1: Go Time</h2>
          <p>The final stretch! Everything comes together now.</p>
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="font-bold text-gray-900 mb-2">Key Tasks:</p>
            <p className="text-gray-700 text-sm">✓ Final headcount and seating assignments</p>
            <p className="text-gray-700 text-sm">✓ Final vendor walk-throughs</p>
            <p className="text-gray-700 text-sm">✓ Confirm all transportation</p>
            <p className="text-gray-700 text-sm">✓ Final dress fitting</p>
            <p className="text-gray-700 text-sm">✓ Wedding rehearsal</p>
          </div>
        </section>

        <section className="mt-12 pt-12 border-t-2 border-gray-200">
          <p className="text-center text-gray-700">Need help planning your wedding? Find experienced planners and vendors in your city.</p>
          <div className="text-center mt-6">
            <a href="/" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
              Find Wedding Vendors
            </a>
          </div>
        </section>
      </div>
    </article>
  );
}
