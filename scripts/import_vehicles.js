import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs/promises';
import { createRequire } from 'module';
import { v4 as uuidv4 } from 'uuid';

// --- CONFIGURACIÓN ---
const BUCKET_NAME = 'copiloto-crm-1764216245.firebasestorage.app';
// --- FIN CONFIGURACIÓN ---

const require = createRequire(import.meta.url);
const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: BUCKET_NAME,
  });
} catch (error) {
  console.error('\n[ERROR] No se pudo encontrar o leer el archivo `serviceAccountKey.json`.');
  process.exit(1);
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

const IMPORTER_DIR = path.resolve(process.cwd(), 'importer');
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const getMimeType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.jpg': case '.jpeg': return 'image/jpeg';
        case '.png': return 'image/png';
        case '.webp': return 'image/webp';
        default: return 'application/octet-stream';
    }
}

async function main() {
    console.log('--- Iniciando Proceso de Importación (Versión Tokenizada) ---');
    
    // Check directory
    try { await fs.access(IMPORTER_DIR); } catch {
        console.warn(`[!] Directorio 'importer' no encontrado.`); return;
    }

    const dirContents = await fs.readdir(IMPORTER_DIR, { withFileTypes: true });
    const carFolders = dirContents.filter(dirent => dirent.isDirectory());

    if (carFolders.length === 0) {
        console.warn("[!] No hay carpetas en 'importer/'.");
        return;
    }
    console.log(`[OK] Procesando ${carFolders.length} vehículos...`);

    for (const folder of carFolders) {
        const folderPath = path.join(IMPORTER_DIR, folder.name);
        console.log(`\n> ${folder.name}`);

        try {
            // Parsing
            const parts = folder.name.split('-');
            if (parts.length < 5) throw new Error(`Nombre inválido.`);
            
            const make = parts[0];
            const model = parts.slice(1, parts.length - 4).join('-');
            const year = parseInt(parts[parts.length - 4], 10);
            const mileage = parseInt(parts[parts.length - 3], 10);
            const price = parseFloat(parts[parts.length - 2]);
            const depositId = parts[parts.length - 1];

            if (isNaN(year) || isNaN(price)) throw new Error(`Datos numéricos inválidos.`);

            // Description
            let description = 'Vehículo importado.';
            try { description = await fs.readFile(path.join(folderPath, 'descripcion.txt'), 'utf-8'); } catch {}

            // Images
            const filesInFolder = await fs.readdir(folderPath);
            const imageFiles = filesInFolder.filter(file => ALLOWED_IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase()));
            
            if (imageFiles.length === 0) throw new Error(`Carpeta sin imágenes.`);

            const imageUrls = [];
            for (const imageFile of imageFiles) {
                const imagePath = path.join(folderPath, imageFile);
                const destination = `vehicles/${uuidv4()}-${imageFile}`;
                const token = uuidv4(); // Create a download token
                
                // Upload with token metadata
                await bucket.upload(imagePath, {
                    destination: destination,
                    metadata: {
                        contentType: getMimeType(imagePath),
                        metadata: {
                            firebaseStorageDownloadTokens: token // This enables the URL below
                        }
                    },
                });

                // Construct the Firebase Client SDK compatible URL
                const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(destination)}?alt=media&token=${token}`;
                imageUrls.push(publicUrl);
            }
            console.log(`  - ${imageUrls.length} imágenes subidas.`);

            // Database Record
            const newVehicle = {
                id: uuidv4(),
                make, model, year, price, mileage, description,
                status: 'Disponible',
                imageUrl: imageUrls[0], // Main image
                transmission: 'Manual',
                fuelType: 'Gasolina',
                _depositId: depositId,
                _importedAt: new Date().toISOString(),
                _allImages: imageUrls,
            };

            await db.collection('vehicles').doc(newVehicle.id).set(newVehicle);
            console.log(`  [OK] Guardado en Firestore.`);

        } catch (error) {
            console.error(`  [ERROR] ${error.message}`);
        }
    }
    console.log('\n--- Finalizado ---');
}

main();
