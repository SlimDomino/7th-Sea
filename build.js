// Scans images/ and texts/ and writes files.json for the site to read.
const fs = require('fs');
const IMG = /\.(jpe?g|png|gif|webp|svg|jfif)$/i;
const TXT = /\.(txt|md)$/i;
const list = (dir, re) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => re.test(f)).sort() : [];
const out = { images: list('images', IMG), texts: list('texts', TXT) };
fs.writeFileSync('files.json', JSON.stringify(out, null, 2) + '\n');
console.log(`${out.images.length} images, ${out.texts.length} text files -> files.json`);
