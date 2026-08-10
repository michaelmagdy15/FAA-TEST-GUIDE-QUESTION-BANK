const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
const files = ['questions.json', 'cpl_questions.json'];

files.forEach(f => {
  const filePath = path.join(dataDir, f);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const before = data.length;
  
  // Remove questions with < 3 options
  const cleaned = data.filter(q => {
    const optCount = Object.keys(q.options).length;
    if (optCount < 3) {
      console.log(`REMOVING from ${f}: ID ${q.id} | PLT: ${q.plt} | Options: ${optCount}`);
      return false;
    }
    return true;
  });
  
  const removed = before - cleaned.length;
  fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2));
  console.log(`${f}: Removed ${removed} corrupted questions (${before} -> ${cleaned.length})`);
});
