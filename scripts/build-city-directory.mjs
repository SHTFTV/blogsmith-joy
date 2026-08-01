// Regenerates src/lib/cityDirectory.ts with enriched territory metadata.
// Source of truth for the /cities index + /cities/$slug pages.
import fs from 'node:fs';

// slug: [displayName, ISO2, population, cultures[], status]
// status: "available" | "coming-soon"
const SA = 'South Asian';
const CH = 'Chinese';
const PE = 'Persian';
const JE = 'Jewish';
const NO = 'Nordic';
const HI = 'Hispanic';
const SE = 'Southeast Asian';
const WE = 'Western';

const DATA = {
  abbotsford: ['Abbotsford', 'CA', 155000, [SA, WE]],
  'abu-dhabi': ['Abu Dhabi', 'AE', 1500000, [SA, PE, WE]],
  adelaide: ['Adelaide', 'AU', 1400000, [WE, CH, SA]],
  ajax: ['Ajax', 'CA', 130000, [SA, WE]],
  albuquerque: ['Albuquerque', 'US', 565000, [HI, WE]],
  alpharetta: ['Alpharetta', 'US', 67000, [SA, WE]],
  'arlington-tx': ['Arlington, TX', 'US', 400000, [HI, WE], 'coming-soon'],
  artesia: ['Artesia, CA', 'US', 17000, [SA], 'coming-soon'],
  'ashburn-va': ['Ashburn, VA', 'US', 44000, [SA, WE], 'coming-soon'],
  atlanta: ['Atlanta', 'US', 500000, [WE, SA]],
  auckland: ['Auckland', 'NZ', 1700000, [WE, SA, CH, SE]],
  austin: ['Austin', 'US', 975000, [HI, SA, WE]],
  baltimore: ['Baltimore', 'US', 570000, [WE, SA]],
  belfast: ['Belfast', 'GB', 345000, [WE]],
  bellevue: ['Bellevue', 'US', 152000, [CH, SA, WE]],
  berlin: ['Berlin', 'DE', 3700000, [WE, NO, PE]],
  birmingham: ['Birmingham', 'GB', 1150000, [SA, WE]],
  blackburn: ['Blackburn', 'GB', 150000, [SA], 'coming-soon'],
  boston: ['Boston', 'US', 655000, [WE, JE, SA]],
  bradford: ['Bradford', 'GB', 350000, [SA, WE]],
  brampton: ['Brampton', 'CA', 700000, [SA]],
  brent: ['Brent (London)', 'GB', 340000, [SA, WE], 'coming-soon'],
  brisbane: ['Brisbane', 'AU', 2600000, [WE, CH, SA]],
  bristol: ['Bristol', 'GB', 470000, [WE]],
  brooklyn: ['Brooklyn', 'US', 2600000, [JE, HI, CH, WE]],
  burlington: ['Burlington, ON', 'CA', 190000, [WE], 'coming-soon'],
  burnaby: ['Burnaby', 'CA', 250000, [CH, SA]],
  calgary: ['Calgary', 'CA', 1400000, [SA, WE]],
  'calgary-ne': ['Calgary NE', 'CA', 350000, [SA], 'coming-soon'],
  'calgary-se': ['Calgary SE', 'CA', 300000, [SA, WE], 'coming-soon'],
  canberra: ['Canberra', 'AU', 460000, [WE]],
  cardiff: ['Cardiff', 'GB', 370000, [WE]],
  charlotte: ['Charlotte', 'US', 900000, [SA, HI, WE]],
  chicago: ['Chicago', 'US', 2700000, [HI, JE, WE, SA]],
  'chicago-devon-ave': ['Chicago (Devon Ave)', 'US', 120000, [SA], 'coming-soon'],
  cincinnati: ['Cincinnati', 'US', 310000, [WE]],
  cleveland: ['Cleveland', 'US', 370000, [WE]],
  cologne: ['Cologne', 'DE', 1100000, [WE, PE]],
  columbus: ['Columbus', 'US', 910000, [WE, SA]],
  coquitlam: ['Coquitlam', 'CA', 150000, [PE, CH]],
  coventry: ['Coventry', 'GB', 345000, [SA, WE]],
  cupertino: ['Cupertino', 'US', 60000, [SA, CH], 'coming-soon'],
  dallas: ['Dallas', 'US', 1300000, [HI, SA, WE]],
  'dallas-north': ['Dallas North', 'US', 400000, [SA, WE], 'coming-soon'],
  delta: ['Delta, BC', 'CA', 110000, [SA, WE]],
  denver: ['Denver', 'US', 715000, [HI, WE]],
  detroit: ['Detroit', 'US', 630000, [WE, SA]],
  doha: ['Doha', 'QA', 2400000, [SA, PE, WE]],
  dubai: ['Dubai', 'AE', 3500000, [SA, PE, WE]],
  'dublin-ca': ['Dublin, CA', 'US', 73000, [SA, CH], 'coming-soon'],
  dusseldorf: ['Dusseldorf', 'DE', 620000, [WE, PE]],
  edinburgh: ['Edinburgh', 'GB', 530000, [WE]],
  edison: ['Edison, NJ', 'US', 110000, [SA]],
  'edison-nj': ['Edison NJ Metro', 'US', 110000, [SA], 'coming-soon'],
  edmonton: ['Edmonton', 'CA', 1050000, [SA, WE]],
  'edmonton-north': ['Edmonton North', 'CA', 300000, [SA], 'coming-soon'],
  'edmonton-south': ['Edmonton South', 'CA', 300000, [SA, WE], 'coming-soon'],
  etobicoke: ['Etobicoke', 'CA', 370000, [SA, WE]],
  fairfax: ['Fairfax, VA', 'US', 24000, [SA, PE]],
  'fairfax-va': ['Fairfax County, VA', 'US', 1150000, [SA, PE], 'coming-soon'],
  'fort-worth': ['Fort Worth', 'US', 960000, [HI, WE]],
  frankfurt: ['Frankfurt', 'DE', 770000, [WE, PE]],
  fremont: ['Fremont, CA', 'US', 230000, [SA, CH, PE]],
  fresno: ['Fresno', 'US', 545000, [HI, SA]],
  frisco: ['Frisco, TX', 'US', 220000, [SA, WE], 'coming-soon'],
  glasgow: ['Glasgow', 'GB', 635000, [SA, WE]],
  'gold-coast': ['Gold Coast', 'AU', 700000, [WE]],
  halifax: ['Halifax', 'CA', 480000, [WE, SA]],
  hamburg: ['Hamburg', 'DE', 1900000, [WE, NO]],
  hamilton: ['Hamilton, ON', 'CA', 580000, [WE, SA]],
  harrow: ['Harrow (London)', 'GB', 260000, [SA]],
  hayward: ['Hayward, CA', 'US', 160000, [HI, SA], 'coming-soon'],
  honolulu: ['Honolulu', 'US', 350000, [SE, WE]],
  hounslow: ['Hounslow (London)', 'GB', 290000, [SA]],
  houston: ['Houston', 'US', 2300000, [HI, SA, WE]],
  'houston-southwest': ['Houston Southwest', 'US', 400000, [SA, HI], 'coming-soon'],
  ilford: ['Ilford (London)', 'GB', 170000, [SA]],
  indianapolis: ['Indianapolis', 'US', 890000, [WE]],
  irvine: ['Irvine, CA', 'US', 310000, [PE, CH, SA], 'coming-soon'],
  irving: ['Irving, TX', 'US', 260000, [SA, HI]],
  'iselin-nj': ['Iselin, NJ', 'US', 20000, [SA], 'coming-soon'],
  jacksonville: ['Jacksonville', 'US', 970000, [WE]],
  jeddah: ['Jeddah', 'SA', 4700000, [SA, WE]],
  'jersey-city': ['Jersey City', 'US', 290000, [SA, HI]],
  'johns-creek': ['Johns Creek, GA', 'US', 82000, [SA, CH], 'coming-soon'],
  'kansas-city': ['Kansas City', 'US', 510000, [WE]],
  katy: ['Katy, TX', 'US', 25000, [SA, HI]],
  kitchener: ['Kitchener', 'CA', 260000, [WE, SA]],
  'kitchener-waterloo': ['Kitchener-Waterloo', 'CA', 400000, [SA, WE], 'coming-soon'],
  'kuala-lumpur': ['Kuala Lumpur', 'MY', 1800000, [SE, CH, SA]],
  'kuwait-city': ['Kuwait City', 'KW', 3100000, [SA, PE]],
  langley: ['Langley, BC', 'CA', 180000, [SA, WE]],
  'las-vegas': ['Las Vegas', 'US', 660000, [HI, WE]],
  leeds: ['Leeds', 'GB', 800000, [SA, WE]],
  leicester: ['Leicester', 'GB', 370000, [SA]],
  liverpool: ['Liverpool', 'GB', 500000, [WE]],
  london: ['London Central', 'GB', 9000000, [SA, JE, WE, PE]],
  'london-on': ['London, ON', 'CA', 425000, [WE]],
  'long-island': ['Long Island', 'US', 2900000, [JE, HI, WE], 'coming-soon'],
  'los-angeles': ['Los Angeles', 'US', 3900000, [HI, PE, JE, WE]],
  'los-angeles-central': ['Los Angeles Central', 'US', 1200000, [HI, PE], 'coming-soon'],
  louisville: ['Louisville', 'US', 630000, [WE]],
  luton: ['Luton', 'GB', 225000, [SA], 'coming-soon'],
  manchester: ['Manchester', 'GB', 550000, [SA, JE, WE]],
  manhattan: ['Manhattan', 'US', 1600000, [JE, WE, SA]],
  markham: ['Markham', 'CA', 340000, [CH, SA]],
  melbourne: ['Melbourne', 'AU', 5100000, [WE, CH, SA]],
  'melbourne-se': ['Melbourne SE', 'AU', 900000, [SA, SE], 'coming-soon'],
  'melbourne-west': ['Melbourne West', 'AU', 900000, [SA, WE], 'coming-soon'],
  memphis: ['Memphis', 'US', 630000, [WE]],
  miami: ['Miami', 'US', 450000, [HI, JE, WE]],
  milpitas: ['Milpitas, CA', 'US', 80000, [SA, CH], 'coming-soon'],
  milton: ['Milton, ON', 'CA', 145000, [SA], 'coming-soon'],
  milwaukee: ['Milwaukee', 'US', 570000, [WE, HI]],
  minneapolis: ['Minneapolis', 'US', 430000, [NO, WE]],
  mississauga: ['Mississauga', 'CA', 720000, [SA, CH]],
  'missouri-city': ['Missouri City, TX', 'US', 75000, [SA, HI], 'coming-soon'],
  montreal: ['Montreal', 'CA', 1800000, [WE, JE, SA]],
  munich: ['Munich', 'DE', 1500000, [WE, PE]],
  naperville: ['Naperville, IL', 'US', 150000, [SA, WE], 'coming-soon'],
  nashville: ['Nashville', 'US', 690000, [WE]],
  newark: ['Newark, NJ', 'US', 305000, [HI, SA], 'coming-soon'],
  newcastle: ['Newcastle upon Tyne', 'GB', 300000, [WE, SA]],
  'newcastle-au': ['Newcastle, NSW', 'AU', 325000, [WE]],
  newham: ['Newham (London)', 'GB', 350000, [SA], 'coming-soon'],
  'new-westminster': ['New Westminster', 'CA', 80000, [SA, CH]],
  'new-york': ['New York', 'US', 8300000, [JE, HI, CH, SA, WE]],
  'north-york': ['North York', 'CA', 870000, [PE, JE, SA]],
  nottingham: ['Nottingham', 'GB', 325000, [SA, WE]],
  oakville: ['Oakville', 'CA', 215000, [WE, SA]],
  'oklahoma-city': ['Oklahoma City', 'US', 700000, [WE, HI]],
  orlando: ['Orlando', 'US', 320000, [HI, WE]],
  ottawa: ['Ottawa', 'CA', 1020000, [WE, SA]],
  perth: ['Perth', 'AU', 2200000, [WE, SA]],
  philadelphia: ['Philadelphia', 'US', 1580000, [WE, SA, JE]],
  phoenix: ['Phoenix', 'US', 1650000, [HI, WE]],
  pickering: ['Pickering', 'CA', 100000, [SA, WE]],
  pittsburgh: ['Pittsburgh', 'US', 300000, [WE, SA]],
  plano: ['Plano, TX', 'US', 290000, [SA, CH]],
  portland: ['Portland', 'US', 650000, [WE]],
  'quebec-city': ['Quebec City', 'CA', 550000, [WE]],
  queens: ['Queens', 'US', 2300000, [SA, HI, CH, SE]],
  'queens-jackson-heights': ['Queens (Jackson Heights)', 'US', 110000, [SA, HI], 'coming-soon'],
  raleigh: ['Raleigh', 'US', 470000, [SA, WE]],
  'raleigh-durham': ['Raleigh-Durham', 'US', 750000, [SA, WE], 'coming-soon'],
  redmond: ['Redmond, WA', 'US', 75000, [SA, CH]],
  regina: ['Regina', 'CA', 230000, [SA, WE]],
  'richmond-bc': ['Richmond, BC', 'CA', 210000, [CH, SA]],
  'richmond-hill': ['Richmond Hill, ON', 'CA', 200000, [PE, CH, JE]],
  riyadh: ['Riyadh', 'SA', 7600000, [SA, WE]],
  sacramento: ['Sacramento', 'US', 525000, [SA, HI, SE]],
  'salt-lake-city': ['Salt Lake City', 'US', 200000, [WE]],
  'san-antonio': ['San Antonio', 'US', 1450000, [HI, WE]],
  'san-diego': ['San Diego', 'US', 1380000, [HI, SE, WE]],
  'san-francisco': ['San Francisco', 'US', 810000, [CH, SA, WE]],
  'san-jose': ['San Jose', 'US', 970000, [SA, SE, HI]],
  'santa-clara': ['Santa Clara', 'US', 130000, [SA, CH]],
  saskatoon: ['Saskatoon', 'CA', 270000, [SA, WE]],
  scarborough: ['Scarborough, ON', 'CA', 630000, [SA, CH]],
  schaumburg: ['Schaumburg, IL', 'US', 78000, [SA, WE]],
  seattle: ['Seattle', 'US', 750000, [SA, CH, WE]],
  sharjah: ['Sharjah', 'AE', 1800000, [SA, PE]],
  sheffield: ['Sheffield', 'GB', 580000, [SA, WE]],
  singapore: ['Singapore', 'SG', 5900000, [CH, SE, SA]],
  slough: ['Slough', 'GB', 160000, [SA]],
  southall: ['Southall (London)', 'GB', 70000, [SA]],
  'st-louis': ['St. Louis', 'US', 300000, [WE]],
  'sugar-land': ['Sugar Land, TX', 'US', 110000, [SA, CH]],
  sunnyvale: ['Sunnyvale, CA', 'US', 155000, [SA, CH]],
  surrey: ['Surrey, BC', 'CA', 600000, [SA]],
  sydney: ['Sydney', 'AU', 5300000, [WE, CH, SA]],
  'sydney-parramatta': ['Sydney (Parramatta)', 'AU', 260000, [SA], 'coming-soon'],
  'sydney-west': ['Sydney West', 'AU', 1000000, [SA, SE], 'coming-soon'],
  tampa: ['Tampa', 'US', 400000, [HI, WE]],
  toronto: ['Toronto', 'CA', 2900000, [SA, CH, JE, WE]],
  'toronto-downtown': ['Toronto Downtown', 'CA', 300000, [WE, CH], 'coming-soon'],
  tucson: ['Tucson', 'US', 545000, [HI, WE]],
  'union-city': ['Union City, CA', 'US', 70000, [SA, SE]],
  vancouver: ['Vancouver', 'CA', 675000, [CH, SA, PE]],
  vaughan: ['Vaughan', 'CA', 325000, [JE, SA, WE]],
  victoria: ['Victoria, BC', 'CA', 92000, [WE]],
  'washington-dc': ['Washington DC', 'US', 690000, [SA, WE]],
  wellington: ['Wellington', 'NZ', 215000, [WE]],
  wembley: ['Wembley (London)', 'GB', 100000, [SA]],
  westchester: ['Westchester, NY', 'US', 1000000, [JE, HI, WE], 'coming-soon'],
  windsor: ['Windsor, ON', 'CA', 230000, [SA, WE]],
  winnipeg: ['Winnipeg', 'CA', 750000, [SA, WE]],
};

const COUNTRY_NAMES = {
  CA: 'Canada',
  US: 'United States',
  GB: 'United Kingdom',
  AU: 'Australia',
  NZ: 'New Zealand',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  QA: 'Qatar',
  KW: 'Kuwait',
  DE: 'Germany',
  MY: 'Malaysia',
  SG: 'Singapore',
};

const FLAGS = {
  CA: '🇨🇦',
  US: '🇺🇸',
  GB: '🇬🇧',
  AU: '🇦🇺',
  NZ: '🇳🇿',
  AE: '🇦🇪',
  SA: '🇸🇦',
  QA: '🇶🇦',
  KW: '🇰🇼',
  DE: '🇩🇪',
  MY: '🇲🇾',
  SG: '🇸🇬',
};

const slugs = Object.keys(DATA).sort();
const rows = slugs.map((slug) => {
  const [name, country, population, cultures, status = 'available'] = DATA[slug];
  return `  { slug: ${JSON.stringify(slug)}, name: ${JSON.stringify(name)}, country: ${JSON.stringify(country)}, countryName: ${JSON.stringify(COUNTRY_NAMES[country])}, flag: ${JSON.stringify(FLAGS[country])}, population: ${population}, cultures: [${cultures.map((c) => JSON.stringify(c)).join(', ')}], status: ${JSON.stringify(status)} },`;
});

const out = `// AUTO-GENERATED by scripts/build-city-directory.mjs — do not edit by hand.
// Territory directory powering the /cities index and /cities/$slug routes.
import { pppPrice } from "@/lib/territoryPricing";

export type TerritoryStatus = "available" | "coming-soon";

export const CULTURES = [
  "South Asian",
  "Chinese",
  "Persian",
  "Jewish",
  "Nordic",
  "Hispanic",
  "Southeast Asian",
  "Western",
] as const;

export type Culture = (typeof CULTURES)[number];

export interface CityEntry {
  slug: string;
  name: string;
  country: string;
  countryName: string;
  flag: string;
  population: number;
  cultures: Culture[];
  status: TerritoryStatus;
}

export const CITY_ENTRIES: readonly CityEntry[] = [
${rows.join('\n')}
];

export function findCityEntry(slug: string): CityEntry | undefined {
  const needle = slug.trim().toLowerCase();
  return CITY_ENTRIES.find((c) => c.slug === needle);
}

/** PPP-adjusted monthly territory price for a city. */
export function cityPrice(city: CityEntry): number {
  return pppPrice(city.population, city.country);
}

export function formatCityPrice(city: CityEntry): string {
  return \`$\${cityPrice(city).toLocaleString("en-US")}/mo\`;
}

export const COUNTRY_OPTIONS: readonly { code: string; name: string; flag: string }[] =
  Array.from(new Map(CITY_ENTRIES.map((c) => [c.country, { code: c.country, name: c.countryName, flag: c.flag }])).values()).sort(
    (a, b) => a.name.localeCompare(b.name),
  );
`;

fs.writeFileSync('src/lib/cityDirectory.ts', out);
console.log(`Wrote src/lib/cityDirectory.ts with ${slugs.length} cities.`);
