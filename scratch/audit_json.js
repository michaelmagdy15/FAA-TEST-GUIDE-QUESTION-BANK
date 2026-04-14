const fs = require('fs');
const path = require('path');

function auditFile(filepath) {
    console.log(`Auditing ${filepath}...`);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    // Pattern for question headers (e.g. 1-1 \n PLT123 or 1-1 CA.I.A.K1)
    const headerPattern = /\d+-\d+\s+PLT\d+/;
    const headerPattern2 = /\d+-\d+\s+CA\.[A-Z]\.[A-Z]\.[A-Z]\d+/;
    const answerPattern = /\d+-\d+\.\s*Answer\s+[A-D]\./;

    let issues = {
        bleedOver: 0,
        answerPrefix: 0,
        trashChars: 0
    };

    data.forEach(q => {
        let q_id = q.id;
        let fields = ['text', 'explanation'];
        if (q.options) {
            Object.values(q.options).forEach(opt => {
                if (headerPattern.test(opt) || headerPattern2.test(opt)) issues.bleedOver++;
                if (answerPattern.test(opt)) issues.answerPrefix++;
            });
        }

        fields.forEach(field => {
            let val = q[field];
            if (val) {
                if (headerPattern.test(val) || headerPattern2.test(val)) issues.bleedOver++;
                if (answerPattern.test(val)) issues.answerPrefix++;
                if (/[■·•\-\s]*"'\s*\.\.\.\s*,\s*C\s*Cl\)/.test(val)) issues.trashChars++;
            }
        });
    });

    console.log(`Issues in ${filepath}:`);
    console.log(`  Bleed-over: ${issues.bleedOver}`);
    console.log(`  Answer Prefixes in content: ${issues.answerPrefix}`);
    console.log(`  Trash/OCR symbols: ${issues.trashChars}`);
    console.log(`Total questions: ${data.length}`);
    console.log("--------------------");
}

const baseDir = 'h:\\FAA TEST GUIDE QUESTION BANK';
auditFile(path.join(baseDir, 'ir_questions.json'));
auditFile(path.join(baseDir, 'cpl_questions.json'));
auditFile(path.join(baseDir, 'questions_v2.json'));
