import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Load service account key from the path provided by the user
const serviceAccountPath = '../faa-test-guide-v2-firebase-adminsdk-fbsvc-c82363f3e7.json';
const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(serviceAccountPath), 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrate() {
  const modes = {
    ppl: './src/data/questions.json',
    ir: './src/data/ir_questions.json',
    cpl: './src/data/cpl_questions.json'
  };

  for (const [mode, relativePath] of Object.entries(modes)) {
    const fullPath = path.resolve(relativePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`Skipping ${mode} - file not found: ${fullPath}`);
      continue;
    }

    console.log(`Migrating ${mode}...`);
    const questions = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    
    let batch = db.batch();
    let count = 0;
    let total = 0;

    for (const q of questions) {
      const docId = `${mode}_${q.id}`;
      const docRef = db.collection('questions').doc(docId);
      
      const chapter = q.id.includes('-') ? q.id.split('-')[0] : '';
      
      batch.set(docRef, {
        json_id: q.id,
        test_mode: mode,
        plt: q.plt || '',
        text: q.text || '',
        options: q.options || {},
        correct: q.correct || '',
        explanation: q.explanation || '',
        chapter: chapter
      });

      count++;
      total++;

      if (count === 400) {
        await batch.commit();
        console.log(`  Committed ${total} documents...`);
        batch = db.batch();
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
      console.log(`  Committed final ${count} documents for ${mode}. Total: ${total}`);
    }
  }

  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
