import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

console.log('📦 Packaging SlopScan for distribution...');

// Ensure fresh build
execSync('npm run build', { stdio: 'inherit' });

const zipPath = path.resolve('slopscan-extension.zip');
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

// Windows PowerShell archive command
const psCmd = `$ProgressPreference = 'SilentlyContinue'; Compress-Archive -Path dist\\* -DestinationPath slopscan-extension.zip -Force`;
execSync(`powershell -Command "${psCmd}"`, { stdio: 'inherit' });

if (fs.existsSync(zipPath)) {
  const stats = fs.statSync(zipPath);
  console.log(`\n🎉 Package created successfully!`);
  console.log(`📁 File: ${zipPath}`);
  console.log(`⚖️ Size: ${(stats.size / 1024).toFixed(1)} KB`);
  console.log(`\nYou can now send "slopscan-extension.zip" directly to your friends!`);
}
