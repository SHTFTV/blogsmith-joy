import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '50 Expert Wedding Planning Tips | Secrets from Experienced Planners',
  description: 'Learn 50 expert wedding planning tips from experienced professionals. Avoid common mistakes and plan a stress-free wedding.',
  keywords: 'wedding planning tips, wedding planning advice, wedding planning hacks, wedding planning secrets',
};

export default function WeddingPlanningTips() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12 bg-white">
      <nav className="text-sm text-gray-600 mb-6">
        <a href="/" className="hover:text-blue-600">Home</a> / 
        <a href="/resources" className="hover:text-blue-600"> Resources</a> / 
        <span> Wedding Planning Tips</span>
      </nav>

      <header className="mb-12 pb-8 border-b-2 border-gray-200">
        <h1 className="text-4xl font-serif text-gray-900 mb-4">
          50 Expert Wedding Planning Tips from Experienced Professionals
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Learn insider secrets to plan your perfect wedding. Avoid common mistakes, save money, and create a celebration you'll never forget.
        </p>
      </header>

      <div className="space-y-8">
        <section>
          <h2 className="text-3xl font-serif text-gray-900">Budget & Money Tips (10)</h2>
          <div className="space-y-3">
            <p className="text-gray-700"><strong>1.</strong> Set your total budget FIRST. Let that guide all decisions.</p>
            <p className="text-gray-700"><strong>2.</strong> Book venues and photographers 12-14 months in advance for better availability and pricing.</p>
            <p className="text-gray-700"><strong>3.</strong> Build a 10-15% contingency fund for unexpected expenses.</p>
            <p className="text-gray-700"><strong>4.</strong> Consider off-season or weekday weddings to save 30-40% on venue costs.</p>
            <p className="text-gray-700"><strong>5.</strong> DIY invitations and programs to save $500-1,000.</p>
            <p className="text-gray-700"><strong>6.</strong> Buy flowers from wholesale markets or warehouse clubs.</p>
            <p className="text-gray-700"><strong>7.</strong> Choose 3-4 signature cocktails instead of a full bar (saves $1,000+).</p>
            <p className="text-gray-700"><strong>8.</strong> Limit guest list to keep per-person costs down.</p>
            <p className="text-gray-700"><strong>9.</strong> Get written quotes from vendors AND ask for package deals.</p>
            <p className="text-gray-700"><strong>10.</strong> Pay deposits on credit cards for fraud protection and points.</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Planning & Organization Tips (10)</h2>
          <div className="space-y-3">
            <p className="text-gray-700"><strong>11.</strong> Create a master spreadsheet: vendors, costs, contact info, payment schedule.</p>
            <p className="text-gray-700"><strong>12.</strong> Use a planning app (Zola, The Knot) for centralized tracking.</p>
            <p className="text-gray-700"><strong>13.</strong> Set milestone deadlines (invitations, photos, seating) and stick to them.</p>
            <p className="text-gray-700"><strong>14.</strong> Create a detailed day-of timeline and share with all vendors.</p>
            <p className="text-gray-700"><strong>15.</strong> Assign a wedding day coordinator (paid vendor or trusted friend) to execute timeline.</p>
            <p className="text-gray-700"><strong>16.</strong> Keep all contracts in one digital folder with password backup.</p>
            <p className="text-gray-700"><strong>17.</strong> Take screenshots of email confirmations (vendors change email addresses).</p>
            <p className="text-gray-700"><strong>18.</strong> Confirm EVERY vendor 1-2 weeks before the wedding.</p>
            <p className="text-gray-700"><strong>19.</strong> Keep vendor phone numbers handy on wedding day.</p>
            <p className="text-gray-700"><strong>20.</strong> Break tasks into monthly "focus areas" to avoid overwhelm.</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Vendor Selection Tips (10)</h2>
          <div className="space-y-3">
            <p className="text-gray-700"><strong>21.</strong> Always request references and actually call them.</p>
            <p className="text-gray-700"><strong>22.</strong> Meet vendors in person (or video call) before booking.</p>
            <p className="text-gray-700"><strong>23.</strong> Ask vendors about their experience with YOUR type of wedding (cultural, interfaith, etc).</p>
            <p className="text-gray-700"><strong>24.</strong> Request a proposal in writing with specifics (what's included, what's extra, payment terms).</p>
            <p className="text-gray-700"><strong>25.</strong> Taste food from caterers before hiring.</p>
            <p className="text-gray-700"><strong>26.</strong> Look at photographer portfolios for consistency (not just "best" photos).</p>
            <p className="text-gray-700"><strong>27.</strong> Avoid vendor "packages"—build custom packages to fit your budget.</p>
            <p className="text-gray-700"><strong>28.</strong> Ask vendors about their cancellation/refund policies upfront.</p>
            <p className="text-gray-700"><strong>29.</strong> Check references with recent clients (not from 5 years ago).</p>
            <p className="text-gray-700"><strong>30.</strong> Trust your gut—if vendor seems unprofessional now, they'll be unprofessional at your wedding.</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Design & Aesthetic Tips (10)</h2>
          <div className="space-y-3">
            <p className="text-gray-700"><strong>31.</strong> Create a Pinterest board of aesthetic inspiration before meeting vendors.</p>
            <p className="text-gray-700"><strong>32.</strong> Choose a cohesive color palette (3-4 colors max).</p>
            <p className="text-gray-700"><strong>33.</strong> Let florals guide your aesthetic—they're the most expensive element.</p>
            <p className="text-gray-700"><strong>34.</strong> Use dramatic lighting (uplighting, candles) to transform any venue.</p>
            <p className="text-gray-700"><strong>35.</strong> Consider renting vs. buying décor (rental is usually cheaper).</p>
            <p className="text-gray-700"><strong>36.</strong> Invest in GOOD photography—it's what you'll have forever.</p>
            <p className="text-gray-700"><strong>37.</strong> Plan ceremony first, then design reception around it.</p>
            <p className="text-gray-700"><strong>38.</strong> Use seasonal flowers for better prices and availability.</p>
            <p className="text-gray-700"><strong>39.</strong> Simple is elegant—don't over-decorate.</p>
            <p className="text-gray-700"><strong>40.</strong> Get a wedding planner's design recommendations (they have relationships with florists).</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Day-of Execution Tips (10)</h2>
          <div className="space-y-3">
            <p className="text-gray-700"><strong>41.</strong> Eat breakfast before the ceremony (seriously—you'll be hungry).</p>
            <p className="text-gray-700"><strong>42.</strong> Have a "emergency kit" with sewing, stain remover, bobby pins, safety pins.</p>
            <p className="text-gray-700"><strong>43.</strong> Assign someone to greet vendors and make sure they're set up correctly.</p>
            <p className="text-gray-700"><strong>44.</strong> Do a full walk-through with ALL vendors the week before.</p>
            <p className="text-gray-700"><strong>45.</strong> Start everything 15 minutes early (florist, photographer, caterer).</p>
            <p className="text-gray-700"><strong>46.</strong> Have a backup audio system for ceremony (microphones, speakers).</p>
            <p className="text-gray-700"><strong>47.</strong> Keep timeline visible to wedding day coordinator and key vendors.</p>
            <p className="text-gray-700"><strong>48.</strong> Assign someone to collect vendor invoices for final payment.</p>
            <p className="text-gray-700"><strong>49.</strong> Designate a "gift table guard" to prevent theft.</p>
            <p className="text-gray-700"><strong>50.</strong> Take a moment alone together before the ceremony to breathe and be present.</p>
          </div>
        </section>

        <section className="mt-12 pt-12 border-t-2 border-gray-200">
          <p className="text-center text-gray-700">Ready to apply these tips? Find experienced wedding professionals in your area.</p>
          <div className="text-center mt-6">
            <a href="/" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
              Find Wedding Professionals
            </a>
          </div>
        </section>
      </div>
    </article>
  );
}
