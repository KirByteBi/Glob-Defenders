const fs = require('fs');
const cp1252 = {
  '\u20AC': 0x80, '\u201A': 0x82, '\u0192': 0x83, '\u201E': 0x84, '\u2026': 0x85, '\u2020': 0x86,
  '\u2021': 0x87, '\u02C6': 0x88, '\u2030': 0x89, '\u0160': 0x8A, '\u2039': 0x8B, '\u0152': 0x8C,
  '\u017D': 0x8E, '\u2018': 0x91, '\u2019': 0x92, '\u201C': 0x93, '\u201D': 0x94, '\u2022': 0x95,
  '\u2013': 0x96, '\u2014': 0x97, '\u02DC': 0x98, '\u2122': 0x99, '\u0161': 0x9A, '\u203A': 0x9B,
  '\u0153': 0x9C, '\u017E': 0x9E, '\u0178': 0x9F
};

function charToByte(c) {
  if (cp1252[c] !== undefined) return cp1252[c];
  return c.charCodeAt(0) & 0xFF;
}

function fixMojibake(file) {
  if (!fs.existsSync(file)) return;
  let t = fs.readFileSync(file, 'utf8');
  t = t.replace(/([ð][\s\S]{3})|([Ã][\s\S])/g, match => {
    try {
      const buf = Buffer.alloc(match.length);
      for(let i=0; i<match.length; i++) {
        buf[i] = charToByte(match[i]);
      }
      const decoded = buf.toString('utf8');
      if (decoded.includes('\uFFFD') || decoded.length === 0) return match;
      // Also prevent decoding into standard ASCII text if it was just a coincidence
      if (/^[\x00-\x7F]+$/.test(decoded)) return match;
      return decoded;
    } catch(e) {
      return match;
    }
  });
  fs.writeFileSync(file, t, 'utf8');
}

fixMojibake('config.js');
fixMojibake('game.js');
console.log('Done');
