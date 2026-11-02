// Scans images/, texts/, pdfs/ and documents/ and writes files.json for the site to read.
// Picture categories come from images/categories.txt (see that file) and from
// subfolders of images/ (images/Places & Maps/foo.jpg goes in "Places & Maps").
const fs = require('fs');
const path = require('path');
const IMG = /\.(jpe?g|png|gif|webp|svg|jfif|avif)$/i;
const TXT = /\.(txt|md)$/i;
const PDF = /\.pdf$/i;
const DOC = /\.(docx?|rtf|odt)$/i;
const list = (dir, re) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => re.test(f)).sort() : [];
// Word-style documents may sit in any of these folders; entries are full paths.
const docs = ['texts', 'pdfs', 'documents'].flatMap(d => list(d, DOC).map(f => `${d}/${f}`));

// --- Pictures -------------------------------------------------------------
const OTHER = 'Other';
const order = [];          // category order, as written in categories.txt
const assigned = {};       // file name -> { category, title, n }
const catFile = 'images/categories.txt';
if (fs.existsSync(catFile)) {
  let current = null;
  for (const raw of fs.readFileSync(catFile, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const head = line.match(/^\[(.+)\]$/);
    if (head) { current = head[1].trim(); if (!order.includes(current)) order.push(current); continue; }
    if (!current) continue;
    const [file, title] = line.split(/\s+=\s+/);
    assigned[file.trim()] = { category: current, title: title && title.trim(), n: Object.keys(assigned).length };
  }
}
const nice = f => f.replace(/\.[^.]+$/, '');
const images = [];
if (fs.existsSync('images')) {
  for (const entry of fs.readdirSync('images', { withFileTypes: true })) {
    if (entry.isFile() && IMG.test(entry.name)) {
      const a = assigned[entry.name] || {};
      images.push({ src: `images/${entry.name}`, title: a.title || nice(entry.name), category: a.category || OTHER, n: a.n ?? Infinity });
    } else if (entry.isDirectory()) {
      for (const f of list(path.join('images', entry.name), IMG)) {
        const a = assigned[f] || {};
        images.push({ src: `images/${entry.name}/${f}`, title: a.title || nice(f), category: a.category || entry.name, n: a.n ?? Infinity });
      }
    }
  }
}
for (const img of images) if (!order.includes(img.category)) order.push(img.category);
// Keep "Other" last, and only list categories that actually have pictures.
const categories = order.filter(c => c !== OTHER).concat(OTHER).filter(c => images.some(i => i.category === c));
// Pictures keep the order they're listed in categories.txt; unlisted ones go after, A to Z.
images.sort((a, b) => categories.indexOf(a.category) - categories.indexOf(b.category) || (a.n - b.n) || a.title.localeCompare(b.title));
for (const img of images) delete img.n;

const out = { categories, images, texts: list('texts', TXT), pdfs: list('pdfs', PDF), docs };
fs.writeFileSync('files.json', JSON.stringify(out, null, 2) + '\n');
console.log(`${out.images.length} images in ${categories.length} categories, ${out.texts.length} text files, ${out.pdfs.length} PDFs, ${out.docs.length} documents -> files.json`);
