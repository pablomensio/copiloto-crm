import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

/**
 * Tool 1: Buscar Vehículos
 * Esta función busca vehículos en Firestore según los criterios especificados
 */
export const toolBuscarVehiculos = functions.https.onRequest(async (req, res) => {
    // Configurar CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Método no permitido' });
        return;
    }

    try {
        const { marca, modelo, año_min, año_max, precio_max } = req.body;

        console.log('[TOOL_BUSCAR] Parámetros recibidos:', { marca, modelo, año_min, año_max, precio_max });

        const db = admin.firestore();
        let query: admin.firestore.Query = db.collection('vehicles')
            .where('status', '==', 'Available');

        // Aplicar filtros
        if (marca) {
            query = query.where('make', '==', marca);
        }
        if (modelo) {
            query = query.where('model', '==', modelo);
        }
        if (año_min) {
            query = query.where('year', '>=', año_min);
        }
        if (año_max) {
            query = query.where('year', '<=', año_max);
        }
        if (precio_max) {
            query = query.where('price', '<=', precio_max);
        }

        const snapshot = await query.limit(10).get();

        const vehiculos = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                marca: data.make,
                modelo: data.model,
                año: data.year,
                precio: data.price,
                url: `https://copiloto-crm-1764216245.web.app/public/car/${doc.id}`,
                imageUrl: data.imageUrl || (data.imageUrls && data.imageUrls[0]) || null,
            };
        });

        console.log(`[TOOL_BUSCAR] Encontrados ${vehiculos.length} vehículos`);

        res.status(200).json({
            success: true,
            count: vehiculos.length,
            vehiculos: vehiculos
        });

    } catch (error: any) {
        console.error('[TOOL_BUSCAR] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Tool 2: Enviar Ficha de Vehículo
 * Esta función obtiene los datos completos de un vehículo y devuelve la info para enviar
 */
export const toolEnviarFicha = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Método no permitido' });
        return;
    }

    try {
        const { vehiculo_id } = req.body;

        if (!vehiculo_id) {
            res.status(400).json({ error: 'vehiculo_id es requerido' });
            return;
        }

        console.log('[TOOL_FICHA] Buscando vehículo:', vehiculo_id);

        const db = admin.firestore();
        const vehiculoDoc = await db.collection('vehicles').doc(vehiculo_id).get();

        if (!vehiculoDoc.exists) {
            res.status(404).json({ error: 'Vehículo no encontrado' });
            return;
        }

        const data = vehiculoDoc.data()!;
        const ficha = {
            id: vehiculoDoc.id,
            marca: data.make,
            modelo: data.model,
            año: data.year,
            precio: data.price,
            kilometraje: data.mileage,
            transmision: data.transmission,
            combustible: data.fuelType,
            descripcion: data.description,
            url: `https://copiloto-crm-1764216245.web.app/public/car/${vehiculoDoc.id}`,
            imageUrl: data.imageUrl,
            imageUrls: data.imageUrls || []
        };

        console.log('[TOOL_FICHA] Ficha generada para:', `${data.make} ${data.model}`);

        res.status(200).json({
            success: true,
            ficha: ficha
        });

    } catch (error: any) {
        console.error('[TOOL_FICHA] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Tool 3: Abrir Calculadora
 * Esta función genera el link de la calculadora de financiación
 */
export const toolAbrirCalculadora = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Método no permitido' });
        return;
    }

    try {
        const { vehiculo_id, monto } = req.body;

        let calculadoraUrl = 'https://copiloto-crm-1764216245.web.app/calculadora';

        // Agregar parámetros si existen
        const params = new URLSearchParams();
        if (vehiculo_id) params.append('vehiculo', vehiculo_id);
        if (monto) params.append('monto', monto.toString());

        if (params.toString()) {
            calculadoraUrl += `?${params.toString()}`;
        }

        console.log('[TOOL_CALCULADORA] URL generada:', calculadoraUrl);

        res.status(200).json({
            success: true,
            url: calculadoraUrl,
            mensaje: `Acá podés simular la financiación: ${calculadoraUrl}`
        });

    } catch (error: any) {
        console.error('[TOOL_CALCULADORA] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Tool 4: Crear Tarea
 * Esta función crea una tarea/cita en el CRM
 */
export const toolCrearTarea = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Método no permitido' });
        return;
    }

    try {
        const { lead_id, fecha, hora, descripcion } = req.body;

        if (!lead_id || !fecha || !hora || !descripcion) {
            res.status(400).json({
                error: 'Faltan parámetros requeridos: lead_id, fecha, hora, descripcion'
            });
            return;
        }

        console.log('[TOOL_TAREA] Creando tarea para lead:', lead_id);

        const db = admin.firestore();
        const taskId = db.collection('tasks').doc().id;

        // Combinar fecha y hora en formato ISO
        const fechaHora = `${fecha}T${hora}:00`;

        await db.collection('tasks').doc(taskId).set({
            id: taskId,
            title: `Cita WhatsApp: ${descripcion}`,
            description: descripcion,
            date: fechaHora,
            isCompleted: false,
            priority: 'High',
            type: 'FollowUp',
            relatedLeadId: lead_id,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'bot'
        });

        console.log('[TOOL_TAREA] Tarea creada:', taskId);

        res.status(200).json({
            success: true,
            task_id: taskId,
            mensaje: `Perfecto, te agendé para el ${fecha} a las ${hora}. Pablo te va a confirmar.`
        });

    } catch (error: any) {
        console.error('[TOOL_TAREA] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
