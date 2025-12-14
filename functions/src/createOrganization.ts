import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

interface RegistrationData {
    organizationName: string;
    businessType: string;
    fullName: string;
    email: string;
    password: string;
    phone: string;
    plan: 'basic' | 'pro' | 'enterprise';
}

/**
 * Cloud Function para crear una nueva organización y su usuario administrador
 * Este endpoint es llamado desde el formulario de registro público
 */
export const createOrganization = functions.https.onRequest(async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const data: RegistrationData = req.body;

        // Validación básica
        if (!data.organizationName || !data.email || !data.password || !data.fullName) {
            res.status(400).json({ error: 'Faltan campos requeridos' });
            return;
        }

        // 1. Crear el usuario en Firebase Auth
        const userRecord = await admin.auth().createUser({
            email: data.email,
            password: data.password,
            displayName: data.fullName,
            phoneNumber: data.phone.startsWith('+') ? data.phone : `+${data.phone}`
        });

        // 2. Crear el documento de organización
        const organizationId = `org_${Date.now()}`;
        const organizationRef = admin.firestore().collection('organizations').doc(organizationId);

        await organizationRef.set({
            id: organizationId,
            name: data.organizationName,
            businessType: data.businessType,
            plan: data.plan,
            ownerId: userRecord.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            active: true,
            settings: {
                maxUsers: data.plan === 'basic' ? 1 : data.plan === 'pro' ? 5 : 999,
                maxWhatsAppNumbers: data.plan === 'basic' ? 1 : data.plan === 'pro' ? 3 : 999,
                maxVehicles: data.plan === 'basic' ? 100 : 999999
            },
            whatsappConfig: null, // Se configurará después en onboarding
            billing: {
                plan: data.plan,
                status: 'trial', // 14 días de prueba
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                nextBillingDate: null
            }
        });

        // 3. Crear el perfil de usuario con referencia a la organización
        const userProfileRef = admin.firestore().collection('user_profiles').doc(userRecord.uid);

        await userProfileRef.set({
            id: userRecord.uid,
            organizationId: organizationId,
            email: data.email,
            displayName: data.fullName,
            phone: data.phone,
            role: 'admin',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=6366f1&color=fff`,
            assignedDeposits: [], // Admin ve todo por defecto
            active: true
        });

        // 4. Asignar custom claims (organizationId y role)
        await admin.auth().setCustomUserClaims(userRecord.uid, {
            organizationId: organizationId,
            role: 'admin'
        });

        // 5. Crear datos de ejemplo (opcional, solo para plan básico)
        if (data.plan === 'basic') {
            await createSampleData(organizationId);
        }

        // 6. Enviar email de bienvenida (opcional)
        // TODO: Implementar con SendGrid o similar

        // Respuesta exitosa
        res.status(200).json({
            success: true,
            organizationId: organizationId,
            userId: userRecord.uid,
            message: 'Organización creada exitosamente'
        });

    } catch (error: any) {
        console.error('Error creating organization:', error);

        // Manejo de errores específicos
        if (error.code === 'auth/email-already-exists') {
            res.status(400).json({ error: 'El email ya está registrado' });
            return;
        }

        if (error.code === 'auth/invalid-phone-number') {
            res.status(400).json({ error: 'Número de teléfono inválido' });
            return;
        }

        res.status(500).json({
            error: 'Error al crear la organización',
            details: error.message
        });
    }
});

/**
 * Crea datos de ejemplo para nuevas organizaciones
 */
async function createSampleData(organizationId: string) {
    const db = admin.firestore();
    const batch = db.batch();

    // Crear 3 vehículos de ejemplo
    const sampleVehicles = [
        {
            id: `vehicle_${Date.now()}_1`,
            organizationId,
            make: 'Toyota',
            model: 'Corolla',
            year: 2023,
            price: 25000,
            status: 'Disponible',
            imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
            mileage: 15000,
            transmission: 'Automática',
            fuelType: 'Híbrido',
            description: 'Vehículo de ejemplo - Toyota Corolla 2023',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
            id: `vehicle_${Date.now()}_2`,
            organizationId,
            make: 'Honda',
            model: 'Civic',
            year: 2022,
            price: 22000,
            status: 'Disponible',
            imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800',
            mileage: 25000,
            transmission: 'Manual',
            fuelType: 'Gasolina',
            description: 'Vehículo de ejemplo - Honda Civic 2022',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }
    ];

    sampleVehicles.forEach(vehicle => {
        const vehicleRef = db.collection('vehicles').doc(vehicle.id);
        batch.set(vehicleRef, vehicle);
    });

    // Crear 1 lead de ejemplo
    const sampleLead = {
        id: `lead_${Date.now()}`,
        organizationId,
        name: 'Cliente de Prueba',
        phone: '+54 9 11 1234-5678',
        email: 'cliente@ejemplo.com',
        budget: 25000,
        interestLevel: 'High',
        interestedVehicleId: sampleVehicles[0].id,
        status: 'new',
        source: 'web',
        history: [],
        avatarUrl: 'https://ui-avatars.com/api/?name=Cliente+Prueba&background=10b981&color=fff',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const leadRef = db.collection('leads').doc(sampleLead.id);
    batch.set(leadRef, sampleLead);

    await batch.commit();
}
