// lib/seo.ts
export const generateMetadata = (page: {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}) => {
  return {
    title: page.title,
    description: page.description,
    robots: page.noindex ? 'noindex, nofollow' : 'index, follow',
    canonical: page.canonical || '',
    openGraph: {
      title: page.title,
      description: page.description,
      url: page.canonical,
      type: 'website',
      images: [
        {
          url: page.ogImage || 'https://weddings.io/og-image.png',
          width: 1200,
          height: 630
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: [page.ogImage || 'https://weddings.io/og-image.png']
    }
  };
};

export const cities = [
  // Top 10 US cities by wedding volume
  { name: 'New York', state: 'NY', vendors: 285 },
  { name: 'Los Angeles', state: 'CA', vendors: 312 },
  { name: 'Chicago', state: 'IL', vendors: 198 },
  { name: 'Houston', state: 'TX', vendors: 156 },
  { name: 'Phoenix', state: 'AZ', vendors: 124 },
  { name: 'Philadelphia', state: 'PA', vendors: 142 },
  { name: 'San Antonio', state: 'TX', vendors: 98 },
  { name: 'San Diego', state: 'CA', vendors: 167 },
  { name: 'Dallas', state: 'TX', vendors: 189 },
  { name: 'San Jose', state: 'CA', vendors: 145 },
  
  // Top Canadian cities
  { name: 'Toronto', state: 'ON', vendors: 267 },
  { name: 'Vancouver', state: 'BC', vendors: 198 },
  { name: 'Montreal', state: 'QC', vendors: 156 },
  { name: 'Calgary', state: 'AB', vendors: 89 },
  { name: 'Edmonton', state: 'AB', vendors: 76 },
  
  // Additional US Cities (Top 25 by population with large South Asian communities)
  { name: 'Austin', state: 'TX', vendors: 134 },
  { name: 'Jacksonville', state: 'FL', vendors: 87 },
  { name: 'Fort Worth', state: 'TX', vendors: 98 },
  { name: 'Columbus', state: 'OH', vendors: 112 },
  { name: 'Charlotte', state: 'NC', vendors: 106 },
  { name: 'San Francisco', state: 'CA', vendors: 178 },
  { name: 'Indianapolis', state: 'IN', vendors: 94 },
  { name: 'Seattle', state: 'WA', vendors: 145 },
  { name: 'Denver', state: 'CO', vendors: 128 },
  { name: 'Washington DC', state: 'DC', vendors: 167 },
  { name: 'Boston', state: 'MA', vendors: 156 },
  { name: 'El Paso', state: 'TX', vendors: 76 },
  { name: 'Memphis', state: 'TN', vendors: 67 },
  { name: 'Nashville', state: 'TN', vendors: 89 },
  { name: 'Detroit', state: 'MI', vendors: 104 },
  { name: 'Oklahoma City', state: 'OK', vendors: 72 },
  { name: 'Portland', state: 'OR', vendors: 112 },
  { name: 'Las Vegas', state: 'NV', vendors: 134 },
  { name: 'Louisville', state: 'KY', vendors: 78 },
  { name: 'Baltimore', state: 'MD', vendors: 98 },
  { name: 'Milwaukee', state: 'WI', vendors: 87 },
  { name: 'Albuquerque', state: 'NM', vendors: 67 },
  { name: 'Tucson', state: 'AZ', vendors: 72 },
  { name: 'Fresno', state: 'CA', vendors: 89 },
  { name: 'Sacramento', state: 'CA', vendors: 104 },
  { name: 'Long Beach', state: 'CA', vendors: 112 },
  { name: 'Kansas City', state: 'MO', vendors: 94 },
  { name: 'Mesa', state: 'AZ', vendors: 76 },
  { name: 'Virginia Beach', state: 'VA', vendors: 101 },
  { name: 'Atlanta', state: 'GA', vendors: 178 },
  { name: 'Miami', state: 'FL', vendors: 145 },
  { name: 'Cleveland', state: 'OH', vendors: 82 },
  { name: 'New Orleans', state: 'LA', vendors: 98 },
  { name: 'Phoenix Metro', state: 'AZ', vendors: 124 },
  { name: 'Scottsdale', state: 'AZ', vendors: 95 },
  
  // Additional Canadian Cities
  { name: 'Winnipeg', state: 'MB', vendors: 67 },
  { name: 'Quebec City', state: 'QC', vendors: 72 },
  { name: 'Hamilton', state: 'ON', vendors: 84 },
  { name: 'Kitchener', state: 'ON', vendors: 76 },
  { name: 'London', state: 'ON', vendors: 68 },
  { name: 'Ottawa', state: 'ON', vendors: 92 },
  { name: 'Mississauga', state: 'ON', vendors: 98 },
  { name: 'Brampton', state: 'ON', vendors: 112 },
  { name: 'Markham', state: 'ON', vendors: 128 },
  { name: 'Oakville', state: 'ON', vendors: 87 },
  { name: 'Surrey', state: 'BC', vendors: 72 },
  { name: 'Richmond', state: 'BC', vendors: 68 },
  { name: 'Burnaby', state: 'BC', vendors: 76 },
  
  // NEW: 30 Additional US Cities (Mid-sized markets with growing South Asian populations)
  { name: 'Irving', state: 'TX', vendors: 87 },
  { name: 'Garland', state: 'TX', vendors: 76 },
  { name: 'Coral Springs', state: 'FL', vendors: 65 },
  { name: 'Tampa', state: 'FL', vendors: 98 },
  { name: 'Orlando', state: 'FL', vendors: 94 },
  { name: 'St Paul', state: 'MN', vendors: 82 },
  { name: 'Minneapolis', state: 'MN', vendors: 87 },
  { name: 'Anaheim', state: 'CA', vendors: 89 },
  { name: 'Irvine', state: 'CA', vendors: 94 },
  { name: 'Santa Ana', state: 'CA', vendors: 78 },
  { name: 'Riverside', state: 'CA', vendors: 72 },
  { name: 'Stockton', state: 'CA', vendors: 68 },
  { name: 'Cincinnati', state: 'OH', vendors: 87 },
  { name: 'Toledo', state: 'OH', vendors: 72 },
  { name: 'Pittsburgh', state: 'PA', vendors: 94 },
  { name: 'Philadelphia Metro', state: 'PA', vendors: 108 },
  { name: 'Providence', state: 'RI', vendors: 76 },
  { name: 'Hartford', state: 'CT', vendors: 82 },
  { name: 'New Haven', state: 'CT', vendors: 74 },
  { name: 'Syracuse', state: 'NY', vendors: 68 },
  { name: 'Buffalo', state: 'NY', vendors: 72 },
  { name: 'Rochester', state: 'NY', vendors: 68 },
  { name: 'Albany', state: 'NY', vendors: 65 },
  { name: 'Stamford', state: 'CT', vendors: 78 },
  { name: 'Yonkers', state: 'NY', vendors: 84 },
  { name: 'Jersey City', state: 'NJ', vendors: 89 },
  { name: 'Newark', state: 'NJ', vendors: 92 },
  { name: 'Trenton', state: 'NJ', vendors: 76 },
  { name: 'Salt Lake City', state: 'UT', vendors: 98 },
  { name: 'Provo', state: 'UT', vendors: 72 },
  
  // NEW: 6 Additional Canadian Cities (Tier 2 metros)
  { name: 'London', state: 'ON', vendors: 68 },
  { name: 'Windsor', state: 'ON', vendors: 62 },
  { name: 'Oshawa', state: 'ON', vendors: 68 },
  { name: 'St Catharines', state: 'ON', vendors: 64 },
  { name: 'Guelph', state: 'ON', vendors: 61 },
  { name: 'Waterloo', state: 'ON', vendors: 67 },
  { name: 'Halifax', state: 'NS', vendors: 58 },
  { name: 'Saskatoon', state: 'SK', vendors: 52 },
  { name: 'Regina', state: 'SK', vendors: 48 },
  { name: 'Laval', state: 'QC', vendors: 76 },
  { name: 'Longueuil', state: 'QC', vendors: 72 },
  { name: 'Montreal Metro', state: 'QC', vendors: 142 },
];
