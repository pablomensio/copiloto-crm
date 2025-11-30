import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const email = 'pablokmen@gmail.com';
const password = '156736614'; // User provided password

async function createAdminUser() {
    try {
        // Check if user exists
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            console.log('User already exists:', userRecord.uid);
            // Update password just in case
            await admin.auth().updateUser(userRecord.uid, {
                password: password
            });
            console.log('Password updated successfully.');
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                // Create new user
                const userRecord = await admin.auth().createUser({
                    email: email,
                    password: password,
                    emailVerified: true,
                    displayName: 'Super Admin'
                });
                console.log('Successfully created new user:', userRecord.uid);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error creating/updating user:', error);
    }
}

createAdminUser();
