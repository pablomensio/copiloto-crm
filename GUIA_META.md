# Guía para obtener credenciales de WhatsApp Business API (Meta)

Sigue estos pasos para obtener las credenciales necesarias para tu archivo `.env`.

## 1. Acceder al Panel de Desarrolladores
1. Ve a [Meta for Developers](https://developers.facebook.com/).
2. Haz clic en "Mis Apps" (My Apps) en la esquina superior derecha.
3. Selecciona tu aplicación (o crea una nueva si no tienes: Tipo "Business" -> "WhatsApp").

## 2. Obtener Phone ID y Token Temporal
1. En el panel lateral izquierdo, despliega **WhatsApp** y haz clic en **API Setup** (Configuración de API).
2. En esta pantalla verás:
   - **Temporary Access Token**: Copia este token. (Nota: Dura 24h. Para producción necesitarás un Token de Sistema Permanente).
   - **Phone Number ID**: Copia este número (ID del número de teléfono).
   - **WhatsApp Business Account ID**: Copia este número también (a veces es útil).

**Pega estos valores en tu archivo `.env`:**
```env
META_ACCESS_TOKEN=tu_token_temporal_pegado_aqui
META_PHONE_ID=tu_phone_number_id_pegado_aqui
```

## 3. Configurar el Webhook (Para recibir mensajes)
1. En el panel lateral izquierdo, bajo **WhatsApp**, haz clic en **Configuration** (Configuración).
2. Busca la sección **Webhook** y haz clic en **Edit** (Editar).
3. **Callback URL**: Aquí debes poner la URL de tu Cloud Function desplegada.
   - **URL REAL:** `https://us-central1-copiloto-crm-1764216245.cloudfunctions.net/receiveWhatsapp`
   - (Cópiala y pégala en Meta)
4. **Verify Token**: Escribe una palabra clave segura que tú inventes.
   - Ejemplo: `mi_super_secreto_verify_token_2024`

**Actualiza tu `.env` con este token:**
```env
META_VERIFY_TOKEN=mi_super_secreto_verify_token_2024
```

5. Haz clic en **Verify and Save**. (Esto fallará si tu función no está desplegada o corriendo).

## 4. Suscribirse a los campos
1. Una vez verificado el Webhook, en la misma página de **Configuration**, busca **Webhook fields**.
2. Haz clic en **Manage** (Administrar).
3. Marca la casilla **messages** (es la más importante para recibir textos).
4. Haz clic en **Subscribe**.

---
**Nota sobre Token Permanente (Producción):**
Para que el token no caduque, debes ir a [Business Settings](https://business.facebook.com/settings) -> Users -> System Users, crear un usuario admin, y generarle un token con permisos `whatsapp_business_management` y `whatsapp_business_messaging`.
