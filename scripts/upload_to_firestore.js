const admin = require('h:\\FAA TEST GUIDE QUESTION BANK\\pilot-test-guide\\node_modules\\firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('h:\\FAA TEST GUIDE QUESTION BANK\\faa-test-guide-v2-firebase-adminsdk-fbsvc-c82363f3e7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const CLEANED_DIR = 'h:\\FAA TEST GUIDE QUESTION BANK\\cleaned';
const BANKS = ['ppl_cleaned.json', 'ir_cleaned.json', 'cpl_cleaned.json'];

async function uploadBank(bankFile) {
    const filePath = path.join(CLEANED_DIR, bankFile);
    console.log(`Uploading ${bankFile}...`);
    
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const collectionRef = db.collection('questions');

    // Batch size limit for Firestore is 500
    const BATCH_SIZE = 450;
    
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = db.batch();
        const chunk = data.slice(i, i + BATCH_SIZE);
        
        chunk.forEach(question => {
            const docRef = collectionRef.doc(question.id);
            batch.set(docRef, {
                ...question,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();
        console.log(`  Uploaded batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} docs)`);
    }

    console.log(`Finished uploading ${bankFile} (${data.length} total docs).`);
}

async function run() {
    try {
        for (const bank of BANKS) {
            await uploadBank(bank);
        }
        console.log('All migrations complete!');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

run();
