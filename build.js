// Scans images/, texts/, pdfs/ and documents/ and writes files.json for the site to read.
const fs = require('fs');
const IMG = /\.(jpe?g|png|gif|webp|svg|jfif)$/i;
const TXT = /\.(txt|md)$/i;
const PDF = /\.pdf$/i;
const DOC = /\.(docx?|rtf|odt)$/i;
const list = (dir, re) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => re.test(f)).sort() : [];
// Word-style documents may sit in any of these folders; entries are full paths.
const docs = ['texts', 'pdfs', 'documents'].flatMap(d => list(d, DOC).map(f => `${d}/${f}`));
const out = { images: list('images', IMG), texts: list('texts', TXT), pdfs: list('pdfs', PDF), docs };
fs.writeFileSync('files.json', JSON.stringify(out, null, 2) + '\n');
console.log(`${out.images.length} images, ${out.texts.length} text files, ${out.pdfs.length} PDFs, ${out.docs.length} documents -> files.json`);
