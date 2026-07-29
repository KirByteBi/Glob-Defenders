const fs = require('fs');
const content = fs.readFileSync('game.js', 'utf8');
const lines = content.split('\n');
const patterns = ['updateMetaUI', 'pass-xp', 'xp-fill'];
lines.forEach((line, index) => {
  if (patterns.some(p => line.includes(p))) {
    console.log(`game.js:${index + 1}: ${line.trim()}`);
  }
});
