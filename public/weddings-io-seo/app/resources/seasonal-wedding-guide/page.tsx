import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seasonal Wedding Planning Guide | Best Time to Get Married',
  description: 'Plan your wedding by season. Learn the pros and cons of spring, summer, fall, winter weddings and how to plan accordingly.',
  keywords: 'seasonal wedding planning, spring wedding, summer wedding, fall wedding, winter wedding',
};

export default function SeasonalWeddingGuide() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12 bg-white">
      <nav className="text-sm text-gray-600 mb-6">
        <a href="/" className="hover:text-blue-600">Home</a> / 
        <a href="/resources" className="hover:text-blue-600"> Resources</a> / 
        <span> Seasonal Wedding Guide</span>
      </nav>

      <header className="mb-12 pb-8 border-b-2 border-gray-200">
        <h1 className="text-4xl font-serif text-gray-900 mb-4">
          Seasonal Wedding Planning: Choose the Best Time for Your Wedding
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Each season offers unique advantages and challenges. Learn what to expect and how to plan for spring, summer, fall, and winter weddings.
        </p>
      </header>

      <div className="space-y-8">
        <section>
          <h2 className="text-3xl font-serif text-gray-900">Spring Weddings (March-May)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Advantages ✓</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Mild, pleasant weather</li>
                <li>• Flowers in bloom (natural beauty)</li>
                <li>• Longer daylight for photos</li>
                <li>• Budget-friendly (off-peak)</li>
                <li>• Great outdoor options</li>
              </ul>
            </div>
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Challenges ✗</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Unpredictable weather (rain)</li>
                <li>• Tax season (lower attendance)</li>
                <li>• Pollen allergies</li>
                <li>• Limited indoor options</li>
                <li>• Variable temperatures</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700"><strong>Planning tip:</strong> Have a weather backup plan. Invest in outdoor heating/cooling. Book venues early (spring is popular).</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Summer Weddings (June-August)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Advantages ✓</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Beautiful weather</li>
                <li>• Longest daylight hours</li>
                <li>• Outdoor venue options</li>
                <li>• Peak vacation season (guests travel easily)</li>
                <li>• Great for destination weddings</li>
              </ul>
            </div>
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Challenges ✗</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Most expensive season</li>
                <li>• Hottest temperatures</li>
                <li>• AC costs increase</li>
                <li>• Vendors book quickly</li>
                <li>• Guests have competing events</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700"><strong>Planning tip:</strong> Book vendors 12-14 months in advance. Plan for heat (fans, shading, hydration). Consider morning or evening ceremonies to avoid peak heat.</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Fall Weddings (September-November)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Advantages ✓</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Stunning foliage/colors</li>
                <li>• Perfect weather (not too hot)</li>
                <li>• Natural décor (leaves, pumpkins)</li>
                <li>• Great for photography</li>
                <li>• Moderate pricing</li>
              </ul>
            </div>
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Challenges ✗</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Daylight decreases quickly</li>
                <li>• Variable weather</li>
                <li>• Competing holiday events</li>
                <li>• Allergies (ragweed)</li>
                <li>• School schedules (lower attendance)</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700"><strong>Planning tip:</strong> Schedule ceremony earlier to avoid losing daylight. Embrace fall colors and themes. Have backup plans for cool/rainy weather.</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Winter Weddings (December-February)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Advantages ✓</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Most affordable season</li>
                <li>• Venues and vendors available</li>
                <li>• Beautiful snow/holiday décor</li>
                <li>• Intimate indoor gatherings</li>
                <li>• Unique experience</li>
              </ul>
            </div>
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Challenges ✗</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Cold weather</li>
                <li>• Snow/ice travel issues</li>
                <li>• Limited outdoor options</li>
                <li>• Holiday competing events</li>
                <li>• Less daylight for photos</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700"><strong>Planning tip:</strong> Choose indoor venues. Plan earlier ceremony for natural light. Budget for heating/lighting. Provide coat check. Clear snow/ice contingency plan.</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Seasonal Flower & Décor Options</h2>
          
          <table className="w-full text-sm mt-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Season</th>
                <th className="p-3 text-left">Available Flowers</th>
                <th className="p-3 text-left">Color Palette</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3 font-bold">Spring</td>
                <td className="p-3">Tulips, daffodils, cherry blossoms</td>
                <td className="p-3">Pastels, soft pinks, whites</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-bold">Summer</td>
                <td className="p-3">Roses, peonies, sunflowers</td>
                <td className="p-3">Vibrant, bright colors</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-bold">Fall</td>
                <td className="p-3">Dahlias, sunflowers, foliage</td>
                <td className="p-3">Oranges, reds, golds, browns</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">Winter</td>
                <td className="p-3">Roses, holly, evergreens</td>
                <td className="p-3">Reds, whites, silvers, golds</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-3xl font-serif text-gray-900">Seasonal Budget Comparison</h2>
          
          <p className="text-gray-700 mb-4">Average wedding costs by season (for 150 guests):</p>
          <ul className="space-y-2 text-gray-700">
            <li>• <strong>Spring:</strong> $20,000-35,000 (moderate budget)</li>
            <li>• <strong>Summer:</strong> $25,000-50,000 (peak prices)</li>
            <li>• <strong>Fall:</strong> $20,000-40,000 (moderate-high budget)</li>
            <li>• <strong>Winter:</strong> $15,000-30,000 (lowest prices)</li>
          </ul>
        </section>

        <section className="mt-12 pt-12 border-t-2 border-gray-200">
          <p className="text-center text-gray-700">Ready to plan your seasonal wedding? Find venues and vendors perfect for your chosen season.</p>
          <div className="text-center mt-6">
            <a href="/" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
              Find Seasonal Wedding Venues
            </a>
          </div>
        </section>
      </div>
    </article>
  );
}
