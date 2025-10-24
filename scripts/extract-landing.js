const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
const outputPath = path.join(__dirname, '..', 'public', 'landing-content.json');

const html = fs.readFileSync(htmlPath, 'utf8');

const startMarker = '<section id="izz4qv"';
const endMarker = '<script id="scriptData"';
const startIndex = html.indexOf(startMarker);
const endIndex = html.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
  throw new Error('Unable to locate landing sections in index.html.');
}

const landingBlock = html.slice(startIndex, endIndex).trim();

const sectionRegex = /<section[^>]*>[^]*?<\/section>/g;
const sections = [];

let match;
while ((match = sectionRegex.exec(landingBlock))) {
  const sectionHtml = match[0].trim();
  const idMatch = sectionHtml.match(/id="([^"]+)"/);

  sections.push({
    id: idMatch ? idMatch[1] : `section-${sections.length + 1}`,
    html: sectionHtml,
  });
}

const payload = {
  sections,
};

fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

console.log(`Landing content extracted to ${outputPath}`);
