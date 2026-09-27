import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const svgPath = path.join(rootDir, 'public', 'iconHK.svg');
const resDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');

const svgContent = fs.readFileSync(svgPath, 'utf8');

const sizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

for (const { folder, size } of sizes) {
  const targetFolder = path.join(resDir, folder);
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  const resvg = new Resvg(svgContent, {
    fitTo: { mode: 'width', value: size }
  });
  const pngBuffer = resvg.render().asPng();

  fs.writeFileSync(path.join(targetFolder, 'ic_launcher.png'), pngBuffer);
  fs.writeFileSync(path.join(targetFolder, 'ic_launcher_round.png'), pngBuffer);
  console.log(`Generated ${folder}/ic_launcher.png (${size}x${size})`);
}

console.log('All Android mipmap launcher icons created successfully!');
