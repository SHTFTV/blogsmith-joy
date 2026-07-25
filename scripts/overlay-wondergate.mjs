import sharp from "sharp";
const SRC = "src/assets/wondergate-payment-infrastructure-hero.jpg";
const OUT = "/tmp/wondergate-hero-branded.jpg";
const meta = await sharp(SRC).metadata();
const W = meta.width, H = meta.height;
const svg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="cg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f7c873"/>
      <stop offset="1" stop-color="#e0a94a"/>
    </linearGradient>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
  </defs>
  <!-- Top-left badge -->
  <g transform="translate(${Math.round(W*0.045)}, ${Math.round(H*0.05)})">
    <rect x="0" y="0" rx="6" ry="6" width="${Math.round(W*0.20)}" height="42" fill="#000" opacity="0.55" filter="url(#sh)"/>
    <rect x="0" y="0" rx="6" ry="6" width="${Math.round(W*0.20)}" height="42" fill="#000" opacity="0.7" stroke="url(#cg)" stroke-width="1.2"/>
    <text x="16" y="27" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="700" fill="url(#cg)" letter-spacing="3">WONDERGATE · PAYMENTS</text>
  </g>
  <!-- Bottom-right ribbon -->
  <g transform="translate(${W - Math.round(W*0.44)}, ${H - Math.round(H*0.16)})">
    <rect x="0" y="0" rx="4" ry="4" width="${Math.round(W*0.40)}" height="90" fill="#000" opacity="0.6"/>
    <text x="20" y="36" font-family="Georgia, 'Times New Roman', serif" font-size="26" fill="#ffffff" font-weight="700">Cross-Border Wedding Payments</text>
    <text x="20" y="66" font-family="'Helvetica Neue', Arial, sans-serif" font-size="16" fill="#f7c873" letter-spacing="2">100+ METHODS · 200+ COUNTRIES</text>
  </g>
</svg>`);
await sharp(SRC).composite([{ input: svg, top: 0, left: 0 }]).jpeg({ quality: 86, mozjpeg: true }).toFile(OUT);
console.log("wrote", OUT);
