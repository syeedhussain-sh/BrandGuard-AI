const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../src/data');
const destDir = path.resolve(__dirname, '../dist/data');

if (fs.existsSync(srcDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  const srcBrands = path.join(srcDir, 'brands.json');
  const destBrands = path.join(destDir, 'brands.json');
  if (fs.existsSync(srcBrands)) {
    fs.copyFileSync(srcBrands, destBrands);
  }
  console.log('[Build] Successfully synchronized brands.json from src/data to dist/data.');
}
