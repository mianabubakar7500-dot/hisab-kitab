import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Exact vector reproduction of user's iconHK image:
// An emerald squircle with a 3D open ledger book in the shape of capital 'H'
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient matching user's image -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0e8a5b" />
      <stop offset="35%" stop-color="#09734a" />
      <stop offset="70%" stop-color="#065436" />
      <stop offset="100%" stop-color="#023420" />
    </linearGradient>

    <!-- Top Ambient Radial Highlight -->
    <radialGradient id="topGlow" cx="50%" cy="20%" r="65%">
      <stop offset="0%" stop-color="#22c55e" stop-opacity="0.3" />
      <stop offset="60%" stop-color="#10b981" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#064e3b" stop-opacity="0" />
    </radialGradient>

    <!-- Book Green Outer Rim Gradient -->
    <linearGradient id="pageRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#15803d" />
      <stop offset="50%" stop-color="#22c55e" />
      <stop offset="100%" stop-color="#16a34a" />
    </linearGradient>

    <!-- Page Depth Shading -->
    <linearGradient id="innerPageGleam" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="85%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>

    <!-- Drop Shadow Filter for the H Book -->
    <filter id="bookShadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#011b11" flood-opacity="0.55" />
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#022c1d" flood-opacity="0.35" />
    </filter>

    <!-- Soft bottom curve shadow -->
    <filter id="baseShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#021c12" flood-opacity="0.6" />
    </filter>
  </defs>

  <!-- 1. Squircle Background Container -->
  <!-- Outer smooth squircle with rounded corners matching 115px radius -->
  <rect x="28" y="28" width="456" height="456" rx="114" ry="114" fill="url(#bgGrad)" />
  <rect x="28" y="28" width="456" height="456" rx="114" ry="114" fill="url(#topGlow)" />
  
  <!-- Subtle interior border ring -->
  <rect x="29" y="29" width="454" height="454" rx="113" ry="113" fill="none" stroke="#34d399" stroke-width="1.5" stroke-opacity="0.2" />

  <!-- 2. Main "H" Open Book Element with Shadow -->
  <g filter="url(#bookShadow)">

    <!-- A. Green Book Outer Flaps / Cover Edges (Left & Right green book layers) -->
    <!-- Left outer green book flap -->
    <path d="M 116 160 
             C 116 150, 122 144, 134 146 
             L 145 148 
             L 145 304 
             C 133 304, 116 300, 116 290 
             Z" 
          fill="#16a34a" />
    <path d="M 116 162 
             C 116 152, 122 146, 132 148 
             L 142 150 
             L 142 300 
             C 130 300, 116 296, 116 288 
             Z" 
          fill="#4ade80" />

    <!-- Right outer green book flap -->
    <path d="M 396 160 
             C 396 150, 390 144, 378 146 
             L 367 148 
             L 367 304 
             C 379 304, 396 300, 396 290 
             Z" 
          fill="#16a34a" />
    <path d="M 396 162 
             C 396 152, 390 146, 380 148 
             L 370 150 
             L 370 300 
             C 382 300, 396 296, 396 288 
             Z" 
          fill="#4ade80" />

    <!-- B. Lower Curved Spine Base (Green outer thickness underneath open pages) -->
    <!-- Left lower green book base -->
    <path d="M 116 306 
             C 120 322, 140 336, 190 354 
             C 218 364, 244 374, 256 384 
             C 256 376, 240 364, 212 352 
             C 166 332, 130 318, 116 306 Z" 
          fill="#0f5132" />
    <path d="M 116 322 
             C 126 334, 150 348, 196 364 
             C 222 372, 246 382, 256 392 
             C 254 382, 232 370, 204 358 
             C 158 340, 128 328, 116 322 Z" 
          fill="#198754" />

    <!-- Right lower green book base -->
    <path d="M 396 306 
             C 392 322, 372 336, 322 354 
             C 294 364, 268 374, 256 384 
             C 256 376, 272 364, 300 352 
             C 346 332, 382 318, 396 306 Z" 
          fill="#0f5132" />
    <path d="M 396 322 
             C 386 334, 362 348, 316 364 
             C 290 372, 266 382, 256 392 
             C 258 382, 280 370, 308 358 
             C 354 340, 384 328, 396 322 Z" 
          fill="#198754" />

    <!-- C. The Iconic Pure White "H" Shaped Open Book -->
    <!-- Left Page Column & Crossbar Half -->
    <path d="M 144 140 
             C 144 136, 148 134, 154 135 
             L 218 152 
             C 224 154, 227 158, 227 165 
             L 227 225 
             L 256 225 
             L 285 225 
             L 285 165 
             C 285 158, 288 154, 294 152 
             L 358 135 
             C 364 134, 368 136, 368 140 
             L 368 296 
             C 368 300, 364 304, 356 305 
             L 285 316 
             L 285 258 
             L 227 258 
             L 227 316 
             L 156 305 
             C 148 304, 144 300, 144 296 
             Z" 
          fill="url(#innerPageGleam)" />

    <!-- Bottom Open Page Wings (curving gracefully downwards to the spine) -->
    <!-- Left Bottom Curving Page -->
    <path d="M 116 308 
             C 134 308, 160 316, 202 334 
             C 230 346, 250 360, 256 372 
             C 253 360, 230 342, 198 328 
             C 156 310, 128 304, 116 308 Z" 
          fill="#f8fafc" />
    <path d="M 116 309 
             L 227 296 
             L 227 316 
             L 156 322 
             C 138 322, 124 316, 116 309 Z" 
          fill="#e2e8f0" opacity="0.3" />

    <!-- Right Bottom Curving Page -->
    <path d="M 396 308 
             C 378 308, 352 316, 310 334 
             C 282 346, 262 360, 256 372 
             C 259 360, 282 342, 314 328 
             C 356 310, 384 304, 396 308 Z" 
          fill="#f8fafc" />

    <!-- Center Spine Crease Line -->
    <path d="M 256 372 L 256 392" stroke="#022c1d" stroke-width="2.5" stroke-linecap="round" />

    <!-- Soft green bottom page bevel trim matching user's image -->
    <path d="M 118 316 
             C 140 318, 172 328, 212 348 
             C 236 360, 252 372, 256 378 
             C 254 372, 236 356, 210 342 
             C 168 322, 136 314, 118 316 Z" 
          fill="#22c55e" />

    <path d="M 394 316 
             C 372 318, 340 328, 300 348 
             C 276 360, 260 372, 256 378 
             C 258 372, 276 356, 302 342 
             C 344 322, 376 314, 394 316 Z" 
          fill="#22c55e" />
  </g>
</svg>`;

async function main() {
  const publicDir = path.join(rootDir, 'public');
  const srcAssetsDir = path.join(rootDir, 'src', 'assets');
  if (!fs.existsSync(srcAssetsDir)) {
    fs.mkdirSync(srcAssetsDir, { recursive: true });
  }

  // 1. Write public/iconHK.svg
  const svgPath = path.join(publicDir, 'iconHK.svg');
  fs.writeFileSync(svgPath, svgContent, 'utf8');
  console.log('Saved SVG to:', svgPath);

  // 2. Render to PNG 512x512
  const resvg512 = new Resvg(svgContent, {
    fitTo: { mode: 'width', value: 512 }
  });
  const pngData512 = resvg512.render();
  const pngBuffer512 = pngData512.asPng();
  
  const pngPath512 = path.join(publicDir, 'icon-512.png');
  const pngPathHK = path.join(publicDir, 'iconHK.png');
  const pngPathJpeg = path.join(publicDir, 'iconHK.jpeg');
  fs.writeFileSync(pngPath512, pngBuffer512);
  fs.writeFileSync(pngPathHK, pngBuffer512);
  fs.writeFileSync(pngPathJpeg, pngBuffer512);
  console.log('Saved 512x512 PNG to:', pngPath512);

  // 3. Render to PNG 192x192
  const resvg192 = new Resvg(svgContent, {
    fitTo: { mode: 'width', value: 192 }
  });
  const pngData192 = resvg192.render();
  const pngBuffer192 = pngData192.asPng();
  const pngPath192 = path.join(publicDir, 'icon-192.png');
  fs.writeFileSync(pngPath192, pngBuffer192);
  console.log('Saved 192x192 PNG to:', pngPath192);

  // 4. Save to src/assets as well
  fs.writeFileSync(path.join(srcAssetsDir, 'iconHK.svg'), svgContent, 'utf8');
  fs.writeFileSync(path.join(srcAssetsDir, 'iconHK.png'), pngBuffer512);
  fs.writeFileSync(path.join(srcAssetsDir, 'iconHK.jpeg'), pngBuffer512);
  console.log('All icons generated successfully!');
}

main().catch(console.error);
