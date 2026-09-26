import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const IGNORE_LIST = [
  'node_modules',
  '.git',
  '.upm',
  'dist',
  'hisab-kitab-source.zip',
  'hisab-kitab-android.zip',
  '.vite',
  '.cache'
];

function addDirectoryToZip(zip, currentDir, rootPath) {
  const items = fs.readdirSync(currentDir);
  for (const item of items) {
    if (IGNORE_LIST.includes(item)) continue;
    const fullPath = path.join(currentDir, item);
    const relPath = path.relative(rootPath, fullPath).replace(/\\/g, '/');
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const folderZip = zip.folder(item);
      addDirectoryToZip(folderZip, fullPath, fullPath);
    } else {
      const fileData = fs.readFileSync(fullPath);
      zip.file(item, fileData);
    }
  }
}

async function packageAll() {
  const downloadsDir = path.join(rootDir, 'public', 'downloads');
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  // 1. Package complete source code
  console.log('Packaging full source code...');
  const sourceZip = new JSZip();
  addDirectoryToZip(sourceZip, rootDir, rootDir);

  const sourceContent = await sourceZip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const sourceZipPath = path.join(downloadsDir, 'hisab-kitab-source.zip');
  fs.writeFileSync(sourceZipPath, sourceContent);
  console.log(`Source code zip generated at: ${sourceZipPath} (${Math.round(sourceContent.length / 1024)} KB)`);

  // 2. Package Android project
  console.log('Packaging Android project...');
  const androidZip = new JSZip();
  const androidDir = path.join(rootDir, 'android');
  if (fs.existsSync(androidDir)) {
    addDirectoryToZip(androidZip, androidDir, androidDir);
    // Also include capacitor.config.json and README-ANDROID.md
    if (fs.existsSync(path.join(rootDir, 'capacitor.config.json'))) {
      androidZip.file('capacitor.config.json', fs.readFileSync(path.join(rootDir, 'capacitor.config.json')));
    }
    if (fs.existsSync(path.join(rootDir, 'README-ANDROID.md'))) {
      androidZip.file('README-ANDROID.md', fs.readFileSync(path.join(rootDir, 'README-ANDROID.md')));
    }

    const androidContent = await androidZip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    const androidZipPath = path.join(downloadsDir, 'hisab-kitab-android.zip');
    fs.writeFileSync(androidZipPath, androidContent);
    console.log(`Android project zip generated at: ${androidZipPath} (${Math.round(androidContent.length / 1024)} KB)`);
  }
}

packageAll().catch(console.error);
