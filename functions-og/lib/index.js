"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.servePublicVehicle = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
/**
 * Función para servir páginas públicas de vehículos con Open Graph dinámico
 * Cuando alguien comparte un link de /public/car/:id, esta función intercepta
 * y genera el HTML con las meta tags correctas para WhatsApp/Facebook
 */
exports.servePublicVehicle = functions.https.onRequest(async (req, res) => {
    var _a;
    try {
        // Extraer el ID del vehículo de la URL
        // La URL vendrá como /public/car/ID
        // req.path puede ser /public/car/ID o simplemente /ID dependiendo de cómo firebase haga el rewrite
        // Asumimos que el rewrite envía todo a la función
        const pathParts = req.path.split('/');
        const vehicleId = pathParts[pathParts.length - 1];
        if (!vehicleId) {
            res.status(404).send('Vehicle not found');
            return;
        }
        const db = admin.firestore();
        const vehicleDoc = await db.collection('vehicles').doc(vehicleId).get();
        if (!vehicleDoc.exists) {
            res.status(404).send('Vehicle not found');
            return;
        }
        const vehicle = vehicleDoc.data();
        const imageUrl = (vehicle === null || vehicle === void 0 ? void 0 : vehicle.imageUrl) || ((_a = vehicle === null || vehicle === void 0 ? void 0 : vehicle.imageUrls) === null || _a === void 0 ? void 0 : _a[0]) || 'https://copiloto-crm-1764216245.web.app/assets/chatbot_avatar.png';
        const title = `${vehicle === null || vehicle === void 0 ? void 0 : vehicle.make} ${vehicle === null || vehicle === void 0 ? void 0 : vehicle.model} ${vehicle === null || vehicle === void 0 ? void 0 : vehicle.year}`;
        const description = (vehicle === null || vehicle === void 0 ? void 0 : vehicle.description) || `Vehículo disponible: ${title}`;
        // HTML básico con meta tags dinámicos
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://copiloto-crm-1764216245.web.app/public/car/${vehicleId}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://copiloto-crm-1764216245.web.app/public/car/${vehicleId}" />
  <meta property="twitter:title" content="${title}" />
  <meta property="twitter:description" content="${description}" />
  <meta property="twitter:image" content="${imageUrl}" />
  
  <title>${title} | Meny Cars</title>
  
  <!-- Redirigir a la SPA real -->
  <meta http-equiv="refresh" content="0; url=/?vehicle=${vehicleId}" />
  <script>
    window.location.href = "/?vehicle=${vehicleId}";
  </script>
</head>
<body>
  <p>Redirigiendo...</p>
</body>
</html>
    `.trim();
        res.set('Content-Type', 'text/html');
        res.send(html);
    }
    catch (error) {
        console.error('Error in servePublicVehicle:', error);
        res.status(500).send('Internal server error');
    }
});
//# sourceMappingURL=index.js.map