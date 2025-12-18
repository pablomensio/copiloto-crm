import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Función para servir páginas públicas de vehículos con Open Graph dinámico
 * Cuando alguien comparte un link de /public/car/:id, esta función intercepta
 * y genera el HTML con las meta tags correctas para WhatsApp/Facebook
 */
export const servePublicVehicle = functions.https.onRequest(async (req, res) => {
  try {
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
    const imageUrl = vehicle?.imageUrl || vehicle?.imageUrls?.[0] || 'https://copiloto-crm-1764216245.web.app/assets/chatbot_avatar.png';
    const title = `${vehicle?.make} ${vehicle?.model} ${vehicle?.year}`;
    const description = vehicle?.description || `Vehículo disponible: ${title}. ¡Consultá hoy!`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://copiloto-crm-1764216245.web.app/public/car/${vehicleId}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content="${title}" />
  <meta property="twitter:description" content="${description}" />
  <meta property="twitter:image" content="${imageUrl}" />
  
  <title>${title} | Meny Cars</title>
  <meta http-equiv="refresh" content="0; url=/?vehicle=${vehicleId}" />
  <script>window.location.href = "/?vehicle=${vehicleId}";</script>
</head>
<body><p>Redirigiendo a ${title}...</p></body>
</html>`.trim();

    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=7200');
    res.send(html);
  } catch (error) {
    console.error('Error in servePublicVehicle:', error);
    res.status(500).send('Internal server error');
  }
});

export const servePublicMenu = functions.https.onRequest(async (req, res) => {
  try {
    const pathParts = req.path.split('/');
    const menuId = pathParts[pathParts.length - 1];

    if (!menuId) {
      res.status(404).send('Menu not found');
      return;
    }

    const db = admin.firestore();
    const menuDoc = await db.collection('menus').doc(menuId).get();

    if (!menuDoc.exists) {
      res.status(404).send('Menu not found');
      return;
    }

    const menu = menuDoc.data();
    let previewImage = 'https://copiloto-crm-1764216245.web.app/assets/chatbot_avatar.png';

    // Intentar sacar la foto del primer auto del menú
    if (menu?.vehicleIds && menu.vehicleIds.length > 0) {
      const firstVehicleId = menu.vehicleIds[0];
      const vDoc = await db.collection('vehicles').doc(firstVehicleId).get();
      if (vDoc.exists) {
        const vData = vDoc.data();
        previewImage = vData?.imageUrl || vData?.imageUrls?.[0] || previewImage;
      }
    }

    const title = menu?.name || 'Catálogo de Vehículos';
    const description = `Mirá nuestra selección exclusiva de vehículos en Meny Cars.`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://copiloto-crm-1764216245.web.app/public/menu/${menuId}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${previewImage}" />
  
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content="${title}" />
  <meta property="twitter:description" content="${description}" />
  <meta property="twitter:image" content="${previewImage}" />
  
  <title>${title} | Meny Cars</title>
  <meta http-equiv="refresh" content="0; url=/?menu=${menuId}" />
  <script>window.location.href = "/?menu=${menuId}";</script>
</head>
<body><p>Redirigiendo al catálogo ${title}...</p></body>
</html>`.trim();

    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=7200');
    res.send(html);
  } catch (error) {
    console.error('Error in servePublicMenu:', error);
    res.status(500).send('Internal server error');
  }
});
