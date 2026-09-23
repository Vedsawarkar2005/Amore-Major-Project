const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const srcDir = path.resolve(__dirname, '../public/products');
const destDirImages = path.resolve(__dirname, '../public/images/products');
const destDirProducts = path.resolve(__dirname, '../public/products');

fs.mkdirSync(destDirImages, { recursive: true });

async function convert() {
  for (let i = 1; i <= 12; i++) {
    const srcFile = path.join(srcDir, 'H' + i + ' LIPSTICK.png');
    const skuName = 'hvl' + String(i).padStart(3, '0');

    if (!fs.existsSync(srcFile)) {
      console.error('Source file not found:', srcFile);
      continue;
    }

    // Generate .jpg in public/images/products
    await sharp(srcFile)
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 95 })
      .toFile(path.join(destDirImages, skuName + '.jpg'));

    // Generate .png in public/images/products
    await sharp(srcFile)
      .png({ quality: 95 })
      .toFile(path.join(destDirImages, skuName + '.png'));

    // Also place in public/products for fallback
    await sharp(srcFile)
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 95 })
      .toFile(path.join(destDirProducts, skuName + '.jpg'));

    await sharp(srcFile)
      .png({ quality: 95 })
      .toFile(path.join(destDirProducts, skuName + '.png'));

    console.log('Successfully generated ' + skuName + '.jpg and ' + skuName + '.png');
  }
}

convert()
  .then(() => console.log('All product images generated successfully!'))
  .catch((err) => {
    console.error('Conversion failed:', err);
    process.exit(1);
  });
