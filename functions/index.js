const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

admin.initializeApp();

const db = admin.firestore();

exports.app = functions.https.onRequest(async (req, res) => {
    const userAgent = req.headers["user-agent"] || "";
    // const isBot = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|slackbot/i.test(userAgent);

    const menuId = req.query.menu;
    const vehicleId = req.query.vehicle;

    let title = "Meny Cars | Catálogo Digital Premium";
    let description = "Descubre nuestra selección exclusiva de vehículos. Financiación a medida y las mejores oportunidades del mercado.";
    let imageUrl = "https://copiloto-crm-1764216245.web.app/assets/chatbot_avatar.png";
    let url = "https://copiloto-crm-1764216245.web.app/";

    try {
        if (vehicleId) {
            const vehicleDoc = await db.collection("vehicles").doc(vehicleId).get();
            if (vehicleDoc.exists) {
                const vehicle = vehicleDoc.data();
                title = `${vehicle.make} ${vehicle.model} ${vehicle.year} | Meny Cars`;
                description = `Precio: $${vehicle.price.toLocaleString()} - ${vehicle.mileage.toLocaleString()} km. ${vehicle.description || ''}`;
                if (vehicle.imageUrls && vehicle.imageUrls.length > 0) {
                    imageUrl = vehicle.imageUrls[0];
                }
                url = `https://copiloto-crm-1764216245.web.app/?vehicle=${vehicleId}`;
            }
        } else if (menuId) {
            const menuDoc = await db.collection("menus").doc(menuId).get();
            if (menuDoc.exists) {
                const menu = menuDoc.data();
                title = `${menu.name || 'Catálogo Personalizado'} | Meny Cars`;

                // Try to get the first vehicle image
                if (menu.vehicleIds && menu.vehicleIds.length > 0) {
                    const firstVehicleId = menu.vehicleIds[0];
                    const vehicleDoc = await db.collection("vehicles").doc(firstVehicleId).get();
                    if (vehicleDoc.exists) {
                        const vehicle = vehicleDoc.data();
                        if (vehicle.imageUrls && vehicle.imageUrls.length > 0) {
                            imageUrl = vehicle.imageUrls[0];
                        } else if (vehicle.imageUrl) {
                            imageUrl = vehicle.imageUrl;
                        }
                    }
                }
                url = `https://copiloto-crm-1764216245.web.app/?menu=${menuId}`;
            }
        }
    } catch (error) {
        console.error("Error fetching data for OG tags:", error);
    }

    const indexHtmlPath = path.join(__dirname, "index.html");
    let html = fs.readFileSync(indexHtmlPath, "utf8");

    // Replace Meta Tags - Robust Regex
    const replaceMeta = (html, property, content) => {
        // Match: <meta property="prop" [whitespace] content="value" />
        // We use [\s\S]*? to match across newlines between property and content
        return html.replace(new RegExp(`<meta\\s+property="${property}"[\\s\\S]*?content="([^"]*)"\\s*/>`, 'gi'), `<meta property="${property}" content="${content}" />`);
    };

    html = replaceMeta(html, "og:title", title);
    html = replaceMeta(html, "og:description", description);
    html = replaceMeta(html, "og:image", imageUrl);
    html = replaceMeta(html, "og:url", url);

    html = replaceMeta(html, "twitter:title", title);
    html = replaceMeta(html, "twitter:description", description);
    html = replaceMeta(html, "twitter:image", imageUrl);
    html = replaceMeta(html, "twitter:url", url);

    // Also update standard title
    html = html.replace(/<title>[\s\S]*?<\/title>/gi, `<title>${title}</title>`);

    res.set("X-Function-Processed", "true");
    res.set("Cache-Control", "public, max-age=300, s-maxage=600");
    res.send(html);
});

/**
 * Trigger: Detect High Interest on Budget Views
 * Listens for updates on leads and sends notification if viewCount >= 5
 */
exports.onLeadUpdate = functions.firestore
    .document('leads/{leadId}')
    .onUpdate(async (change, context) => {
        const beforeData = change.before.data();
        const afterData = change.after.data();
        const leadId = context.params.leadId;

        // Check if history changed
        const beforeHistory = beforeData.history || [];
        const afterHistory = afterData.history || [];

        if (JSON.stringify(beforeHistory) === JSON.stringify(afterHistory)) {
            return null;
        }

        // Find interactions with increased viewCount
        const notifications = [];

        for (const afterInteraction of afterHistory) {
            const beforeInteraction = beforeHistory.find(i => i.id === afterInteraction.id);

            // Check if it's a budget and viewCount increased
            if (afterInteraction.type === 'budget' && afterInteraction.viewCount) {
                const oldViews = beforeInteraction ? (beforeInteraction.viewCount || 0) : 0;
                const newViews = afterInteraction.viewCount;

                // Threshold condition: Just hit 5 views
                if (oldViews < 5 && newViews >= 5) {
                    notifications.push({
                        title: '🔥 ¡Cliente Interesado!',
                        body: `${afterData.name} ha visto el presupuesto ${newViews} veces. ¡Es momento de llamar!`
                    });
                }
                // Optional: Notify on first view
                else if (oldViews === 0 && newViews === 1) {
                    notifications.push({
                        title: '👀 Presupuesto Visto',
                        body: `${afterData.name} acaba de abrir el presupuesto.`
                    });
                }
            }
        }

        if (notifications.length === 0) return null;

        // Get the seller/user to notify (assuming single user for now or lead has ownerId)
        // For this MVP, we'll notify all users with tokens or a specific one if we had ownerId
        // We will fetch all user profiles and send to them (broadcasting to sales team)

        try {
            const usersSnapshot = await db.collection('user_profiles').get();
            const tokens = [];

            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                if (userData.fcmTokens && Array.isArray(userData.fcmTokens)) {
                    tokens.push(...userData.fcmTokens);
                }
            });

            if (tokens.length === 0) {
                console.log("No FCM tokens found.");
                return null;
            }

            // Send notifications
            const sendPromises = notifications.map(notification => {
                const message = {
                    notification: {
                        title: notification.title,
                        body: notification.body,
                    },
                    tokens: tokens
                };
                return admin.messaging().sendMulticast(message);
            });

            await Promise.all(sendPromises);
            console.log(`Sent ${notifications.length} notifications to ${tokens.length} devices.`);

        } catch (error) {
            console.error("Error sending notifications:", error);
        }

        return null;
    });
