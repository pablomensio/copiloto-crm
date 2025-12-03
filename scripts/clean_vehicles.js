import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { createRequire } from 'module';

// --- CONFIGURACIÓN ---
const BUCKET_NAME = 'copiloto-crm-1764216245.firebasestorage.app';
// --- FIN CONFIGURACIÓN ---

const require = createRequire(import.meta.url);
// Try to find service account key
const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
const serviceAccountProdPath = path.resolve(process.cwd(), 'serviceAccountKey.prod.json');

let serviceAccount;
try {
    if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = require(serviceAccountPath);
    } else if (fs.existsSync(serviceAccountProdPath)) {
        serviceAccount = require(serviceAccountProdPath);
        console.log('[INFO] Usando serviceAccountKey.prod.json');
    } else {
        throw new Error('No se encontró serviceAccountKey.json ni serviceAccountKey.prod.json');
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: BUCKET_NAME,
    });
} catch (error) {
    console.error('\n[ERROR] No se pudo inicializar Firebase Admin:', error.message);
    process.exit(1);
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function deleteAllCars() {
    console.log('Obteniendo vehículos...');
    const snapshot = await db.collection('vehicles').get();

    if (snapshot.empty) {
        return { success: true, message: 'No hay vehículos para eliminar.' };
    }

    console.log(`Se encontraron ${snapshot.size} vehículos.`);

    const batchSize = 500;
    const batches = [];
    let batch = db.batch();
    let count = 0;

    // Collect all image URLs to delete from storage
    const allImageUrls = [];

    for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.imageUrl) allImageUrls.push(data.imageUrl);
        if (data.imageUrls && Array.isArray(data.imageUrls)) {
            allImageUrls.push(...data.imageUrls);
        }
        if (data._allImages && Array.isArray(data._allImages)) {
            allImageUrls.push(...data._allImages);
        }

        batch.delete(doc.ref);
        count++;

        if (count % batchSize === 0) {
            batches.push(batch.commit());
            batch = db.batch();
        }
    }

    if (count % batchSize !== 0) {
        batches.push(batch.commit());
    }

    await Promise.all(batches);
    console.log('Vehículos eliminados de Firestore.');

    // Delete images from Storage
    if (allImageUrls.length > 0) {
        console.log(`Eliminando ${allImageUrls.length} imágenes (puede haber duplicados)...`);
        // Deduplicate
        const uniqueUrls = [...new Set(allImageUrls)];

        // Extract paths from URLs
        // URL format: https://firebasestorage.googleapis.com/v0/b/BUCKET/o/PATH?token=...
        // We need to decode the PATH part.

        const deletePromises = uniqueUrls.map(async (url) => {
            try {
                if (!url.includes(BUCKET_NAME)) return; // Skip external images

                // Extract path between /o/ and ?
                const matches = url.match(/\/o\/(.+?)\?/);
                if (matches && matches[1]) {
                    const filePath = decodeURIComponent(matches[1]);
                    await bucket.file(filePath).delete();
                }
            } catch (e) {
                // Ignore errors (file might not exist)
                // console.warn('Error deleting file:', e.message);
            }
        });

        await Promise.all(deletePromises);
        console.log('Imágenes eliminadas de Storage.');
    }

    return { success: true, message: `Se eliminaron ${snapshot.size} vehículos y sus imágenes.` };
}

async function main() {
    console.log('--- Iniciando Proceso de Limpieza de Vehículos ---');
    console.warn('\n[ADVERTENCIA] Esta acción es irreversible y eliminará TODOS los vehículos y sus imágenes de la base de datos.');

    rl.question('¿Estás seguro de que quieres continuar? (s/n): ', async (answer) => {
        if (answer.toLowerCase() === 's') {
            console.log('\nProcediendo con la eliminación...');
            try {
                const result = await deleteAllCars();
                if (result.success) {
                    console.log(`\n[¡ÉXITO!] ${result.message}`);
                } else {
                    console.error(`\n[FALLO] ${result.message}`);
                }
            } catch (error) {
                console.error('\n[ERROR CRÍTICO] Ocurrió un error al ejecutar el proceso de limpieza:', error.message);
            }
        } else {
            console.log('\nProceso de limpieza cancelado.');
        }
        rl.close();
        process.exit(0);
    });
}

main();
