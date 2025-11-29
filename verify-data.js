
import admin from 'firebase-admin';
import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);
const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    console.error('Error loading service account:', error);
    process.exit(1);
}

const db = admin.firestore();

async function verify() {
    console.log('Verifying vehicles in Firestore...');
    const snapshot = await db.collection('vehicles').get();
    console.log(`Found ${snapshot.size} vehicles.`);

    if (!snapshot.empty) {
        const firstDoc = snapshot.docs[0].data();
        console.log('Sample vehicle:', JSON.stringify(firstDoc, null, 2));
    } else {
        console.log('No vehicles found.');
    }
}

verify();
