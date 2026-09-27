import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const pwaUrl = 'https://ais-pre-qaulbh4ijzkmppa54iekp7-310310438182.asia-southeast1.run.app';

const options = {
  additionalTrustedOrigins: [],
  appVersion: "1.0.0.0",
  appVersionCode: 1,
  backgroundColor: "#090d16",
  display: "standalone",
  enableSiteSettingsShortcut: true,
  enableNotifications: false,
  includeSourceCode: false,
  fallbackType: "customtabs",
  features: {
    locationDelegation: { enabled: false },
    playBilling: { enabled: false }
  },
  host: pwaUrl,
  iconUrl: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/invoiceninja.png",
  launcherName: "Hisab Kitab",
  name: "HISAB KITAB",
  maskableIconUrl: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/invoiceninja.png",
  navigationColor: "#090d16",
  navigationColorDark: "#090d16",
  navigationDividerColor: "#090d16",
  navigationDividerColorDark: "#090d16",
  orientation: "portrait",
  packageId: "com.hisabkitab.billing",
  pwaUrl: pwaUrl,
  shortcuts: [],
  signingMode: "new",
  signing: {
    file: null,
    alias: "hisabkitab-key",
    fullName: "Hisab Kitab Official",
    organization: "Hisab Kitab Inc",
    organizationalUnit: "Engineering",
    countryCode: "PK",
    keyPassword: "HKBilling2026!",
    storePassword: "HKBilling2026!"
  },
  splashScreenFadeOutDuration: 300,
  startUrl: "/",
  themeColor: "#090d16",
  themeColorDark: "#090d16",
  webManifestUrl: `${pwaUrl}/manifest.json`
};

async function main() {
  console.log("Enqueuing package job to CloudAPK...");
  const res = await fetch("https://pwabuilder-cloudapk.azurewebsites.net/enqueuePackageJob", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "platform-identifier": "ServerUI",
      "platform-identifier-version": "1.0.0"
    },
    body: JSON.stringify(options)
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Failed to enqueue: ${res.status} ${res.statusText}`, text);
    return;
  }

  const jobId = await res.text();
  console.log(`Job enqueued with ID: ${jobId}. Polling status...`);

  let completed = false;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 4000));
    const pollRes = await fetch(`https://pwabuilder-cloudapk.azurewebsites.net/getPackageJob?id=${encodeURIComponent(jobId)}`);
    if (!pollRes.ok) {
      console.log(`Poll returned ${pollRes.status}`);
      continue;
    }
    const job = await pollRes.json();
    console.log(`Status [${i}]: ${job.status}`);

    if (job.status === "Completed") {
      completed = true;
      console.log("Job completed! Downloading package zip...");
      const zipRes = await fetch(`https://pwabuilder-cloudapk.azurewebsites.net/downloadPackageZip?id=${encodeURIComponent(jobId)}`);
      if (!zipRes.ok) {
        console.error(`Download failed: ${zipRes.status}`);
        return;
      }
      const arrayBuf = await zipRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      const tempZipPath = path.join(rootDir, 'public', 'downloads', 'cloudapk.zip');
      fs.writeFileSync(tempZipPath, buffer);
      console.log(`Saved package zip: ${tempZipPath} (${buffer.length} bytes)`);

      // Unpack using JSZip
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(buffer);

      // Find .apk inside zip
      let foundApk = false;
      for (const [relativePath, fileEntry] of Object.entries(zip.files)) {
        console.log(`Zip entry: ${relativePath}`);
        if (relativePath.endsWith('.apk')) {
          const apkData = await fileEntry.async('nodebuffer');
          const apkDest = path.join(rootDir, 'public', 'downloads', 'hisab-kitab.apk');
          fs.writeFileSync(apkDest, apkData);
          console.log(`Successfully extracted APK to: ${apkDest} (${apkData.length} bytes)`);
          foundApk = true;
        }
        if (relativePath.endsWith('.aab')) {
          const aabData = await fileEntry.async('nodebuffer');
          const aabDest = path.join(rootDir, 'public', 'downloads', 'hisab-kitab.aab');
          fs.writeFileSync(aabDest, aabData);
          console.log(`Successfully extracted AAB to: ${aabDest} (${aabData.length} bytes)`);
        }
      }

      if (foundApk) {
        console.log("ALL DONE! hisab-kitab.apk and hisab-kitab.aab generated!");
      }
      break;
    } else if (job.status === "Failed") {
      console.error("Job failed with logs:", job.logs);
      break;
    }
  }
}

main().catch(console.error);
