# 🗺️ Plan Maestro: Ecosistema Copiloto CRM (Genkit + Vertex AI)

Este documento es la guía técnica para la implementación del asistente de ventas con "Buffer de Mensajes" y cerebro Genkit.

## 🏛️ Arquitectura del Sistema "Buffer & Brain"

1.  **Entrada (Oído):** `receiveWhatsapp` (Cloud Function).
    *   Recibe mensajes de Meta.
    *   **Lógica de Buffer:** Agrupa mensajes consecutivos (ej: "Hola"..."Precio"..."Cronos") en una ventana de 3.5s.
2.  **Procesamiento (Cerebro):** `cerebroVentas` (Genkit Flow).
    *   Usa **Gemini 2.0 Flash** via Vertex AI.
    *   Recibe: Texto agrupado + Historial + Inventario + Contexto.
    *   Salida: JSON Estricto (Zod Schema).
3.  **Almacenamiento:** Firestore.
    *   Colección `chats/{id}`: Guarda el buffer y el estado.
    *   Subcolección `chats/{id}/history`: Historial persistente para la memoria del agente.

---

## ✅ Checklist de Implementación y Configuración

### 🛠️ Fase 0: Configuración en Google Cloud & Firebase
- [ ] **Habilitar APIs (Consola GCP):**
    - [ ] [Vertex AI API](https://console.cloud.google.com/vertex-ai) (aiplatform.googleapis.com)
    - [ ] Cloud Functions API
- [ ] **Permisos IAM:**
    - [ ] Asegurar que la Service Account de la función (`App Engine default service account` o la que uses) tenga el rol: **Vertex AI User**.
- [ ] **Base de Datos (Firestore):**
    - [ ] Crear índice compuesto (ver sección Índices abajo).

### 🧠 Fase 1: Backend (Functions + Genkit)
- [x] **Configurar TypeScript:** Inicializar `functions/src` y `tsconfig.json`.
- [x] **Instalar Dependencias:** `zod`, `@genkit-ai/*`, `firebase-admin`.
- [x] **Implementar Prompt Maestro:** `src/prompts.ts` con reglas de persistencia y buffer.
- [x] **Implementar Flujo Genkit:** `src/genkitFlow.ts` con esquema de salida estricto.
- [x] **Implementar Receptor WhatsApp:** `src/whatsappReceiver.ts` con lógica de debounce (3.5s).

### 🚀 Fase 2: Despliegue y Pruebas
- [ ] **Deploy:** `firebase deploy --only functions`.
- [ ] **Configurar Webhook:** Poner la URL de `receiveWhatsapp` en el panel de desarrollador de Meta.
- [ ] **Prueba de Estrés:** Enviar 3 mensajes seguidos y verificar que solo hay 1 respuesta.

---

## ⚙️ Configuración de Base de Datos (Firestore)

### Índices Requeridos
Para que el historial funcione rápido (`orderBy` + `limit`), necesitas este índice en `firestore.indexes.json`:

```json
{
  "collectionGroup": "history",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "timestamp", "order": "DESCENDING" }
  ]
}
```

## 📝 Esquema de Datos (Chats)

**Documento `chats/{whatsapp_number}`:**
```json
{
  "buffer": ["Hola", "Precio", "Del Cronos"],
  "lastMessageTime": 1715623400000,
  "processing": false,
  "leadData": { ... },
  "contexto_origen": "catalogo_web"
}
```
