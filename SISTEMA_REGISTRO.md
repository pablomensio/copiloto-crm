# Sistema de Registro Multi-Tenant - AutoSales CRM

## 📋 Resumen del Sistema

Este documento describe el **sistema de registro y onboarding** para convertir AutoSales CRM en una plataforma SaaS multi-tenant que puede soportar **300+ clientes** de forma escalable.

---

## 🏗️ Arquitectura General

### **Flujo Completo de Registro**

```
1. Usuario visita landing page
   ↓
2. Completa formulario de registro
   ↓
3. Cloud Function crea:
   - Usuario en Firebase Auth
   - Documento en /organizations/{orgId}
   - Documento en /user_profiles/{userId}
   - Custom Claims (organizationId + role)
   ↓
4. Usuario es redirigido a Onboarding
   ↓
5. Configura WhatsApp (opcional)
   ↓
6. Configura Depósitos (opcional)
   ↓
7. Accede al Dashboard
```

---

## 🗂️ Estructura de Datos en Firestore

### **Colección: `/organizations/{orgId}`**

```typescript
{
  id: "org_1702345678901",
  name: "AutoMax S.A.",
  businessType: "concesionario",
  plan: "pro",
  ownerId: "user123",
  createdAt: "2024-01-15T10:30:00Z",
  active: true,
  
  settings: {
    maxUsers: 5,
    maxWhatsAppNumbers: 3,
    maxVehicles: 999999
  },
  
  whatsappConfig: {
    phoneNumber: "+54 9 11 1234-5678",
    maytapiProductId: "abc123",
    maytapiPhoneId: "12345",
    apiKey: "encrypted_key",
    configuredAt: "2024-01-15T10:35:00Z"
  },
  
  deposits: ["hum001", "pilar002", "caba003"],
  
  billing: {
    plan: "pro",
    status: "trial",
    trialEndsAt: "2024-01-29T10:30:00Z",
    nextBillingDate: null
  },
  
  onboardingCompleted: true,
  onboardingCompletedAt: "2024-01-15T10:40:00Z"
}
```

### **Colección: `/user_profiles/{userId}`**

```typescript
{
  id: "user123", // Mismo que Firebase Auth UID
  organizationId: "org_1702345678901",
  email: "admin@automax.com",
  displayName: "Juan Pérez",
  phone: "+54 9 11 1234-5678",
  role: "admin",
  createdAt: "2024-01-15T10:30:00Z",
  avatarUrl: "https://ui-avatars.com/api/?name=Juan+Perez",
  assignedDeposits: [], // Vacío = ve todos
  active: true
}
```

### **Colección: `/vehicles/{vehicleId}` (MODIFICADA)**

```typescript
{
  id: "vehicle_123",
  organizationId: "org_1702345678901", // ← NUEVO CAMPO
  make: "Toyota",
  model: "Corolla",
  year: 2023,
  price: 25000,
  status: "Disponible",
  depositId: "hum001", // Opcional
  // ... resto de campos
}
```

### **Colección: `/leads/{leadId}` (MODIFICADA)**

```typescript
{
  id: "lead_456",
  organizationId: "org_1702345678901", // ← NUEVO CAMPO
  name: "Cliente Ejemplo",
  phone: "+54 9 11 9876-5432",
  // ... resto de campos
}
```

---

## 🔒 Firestore Security Rules (Actualizado)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper: Verificar autenticación
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper: Obtener organizationId del usuario
    function getUserOrgId() {
      return request.auth.token.organizationId;
    }
    
    // Helper: Verificar que el documento pertenece a la org del usuario
    function belongsToUserOrg(orgId) {
      return isAuthenticated() && getUserOrgId() == orgId;
    }
    
    // Helper: Verificar si es admin
    function isAdmin() {
      return isAuthenticated() && request.auth.token.role == 'admin';
    }

    // Organizations: Solo tu propia organización
    match /organizations/{orgId} {
      allow read: if belongsToUserOrg(orgId);
      allow write: if belongsToUserOrg(orgId) && isAdmin();
    }

    // User Profiles: Solo de tu organización
    match /user_profiles/{userId} {
      allow read: if belongsToUserOrg(resource.data.organizationId);
      allow write: if belongsToUserOrg(resource.data.organizationId) && isAdmin();
    }

    // Vehicles: Público para catálogos, write solo de tu org
    match /vehicles/{vehicleId} {
      allow read: if true; // Público para compartir
      allow create: if isAuthenticated() && 
                       request.resource.data.organizationId == getUserOrgId();
      allow update, delete: if belongsToUserOrg(resource.data.organizationId);
    }

    // Leads: Solo de tu organización
    match /leads/{leadId} {
      allow create: if true; // Chatbot/Forms públicos pueden crear
      allow read, update, delete: if belongsToUserOrg(resource.data.organizationId);
    }

    // Tasks: Solo de tu organización
    match /tasks/{taskId} {
      allow read, write: if belongsToUserOrg(resource.data.organizationId);
    }

    // Menus: Solo de tu organización
    match /menus/{menuId} {
      allow read: if true; // Público para compartir
      allow write: if belongsToUserOrg(resource.data.organizationId);
    }
  }
}
```

---

## ⚙️ Cloud Function: `createOrganization`

### **Endpoint**
```
POST https://us-central1-{project-id}.cloudfunctions.net/createOrganization
```

### **Request Body**
```json
{
  "organizationName": "AutoMax S.A.",
  "businessType": "concesionario",
  "fullName": "Juan Pérez",
  "email": "admin@automax.com",
  "password": "securePassword123",
  "phone": "+54 9 11 1234-5678",
  "plan": "pro"
}
```

### **Response (Success)**
```json
{
  "success": true,
  "organizationId": "org_1702345678901",
  "userId": "user123",
  "message": "Organización creada exitosamente"
}
```

### **Response (Error)**
```json
{
  "error": "El email ya está registrado"
}
```

### **Proceso Interno**
1. Valida datos del request
2. Crea usuario en Firebase Auth
3. Crea documento en `/organizations/{orgId}`
4. Crea documento en `/user_profiles/{userId}`
5. Asigna Custom Claims (`organizationId`, `role`)
6. Crea datos de ejemplo (si plan = 'basic')
7. Retorna `organizationId` y `userId`

---

## 🎨 Componentes Frontend

### **1. RegisterView.tsx**
- **Ubicación**: `/components/RegisterView.tsx`
- **Propósito**: Landing page de registro
- **Features**:
  - Selección de plan (Basic, Pro, Enterprise)
  - Formulario de datos de empresa
  - Formulario de datos de usuario admin
  - Validación de formulario
  - Llamada a Cloud Function
  - Estados de loading y success

### **2. OnboardingView.tsx**
- **Ubicación**: `/components/OnboardingView.tsx`
- **Propósito**: Configuración inicial post-registro
- **Steps**:
  1. **Bienvenida**: Mensaje de bienvenida
  2. **WhatsApp**: Configurar número y Maytapi (opcional)
  3. **Depósitos**: Definir depósitos/sucursales (opcional)
  4. **Completado**: Redirigir al dashboard

---

## 🔄 Integración con App.tsx

### **Modificaciones Necesarias**

```typescript
// En App.tsx
import RegisterView from './components/RegisterView';
import OnboardingView from './components/OnboardingView';

const [appState, setAppState] = useState<'register' | 'onboarding' | 'app'>('register');
const [organizationId, setOrganizationId] = useState<string | null>(null);

// Lógica de renderizado
if (appState === 'register') {
  return (
    <RegisterView 
      onRegisterSuccess={(orgId) => {
        setOrganizationId(orgId);
        setAppState('onboarding');
      }}
      onSwitchToLogin={() => {
        // Mostrar LoginView
      }}
    />
  );
}

if (appState === 'onboarding') {
  return (
    <OnboardingView 
      organizationId={organizationId!}
      onComplete={() => {
        setAppState('app');
      }}
    />
  );
}

// App normal...
```

---

## 📊 Planes y Precios Sugeridos

| Plan | Precio/mes | Usuarios | WhatsApp | Vehículos | Soporte |
|------|------------|----------|----------|-----------|---------|
| **Basic** | $50 USD | 1 | 1 número | 100 | Email |
| **Pro** | $100 USD | 5 | 3 números | Ilimitados | Prioritario |
| **Enterprise** | Custom | Ilimitados | Ilimitados | Ilimitados | 24/7 + API |

---

## 🚀 Cómo Configurar Nuevos Clientes

### **Opción 1: Auto-Registro (Recomendado)**
1. Cliente visita `/register`
2. Completa formulario
3. Sistema crea todo automáticamente
4. Cliente configura WhatsApp desde dashboard

### **Opción 2: Registro Manual (Admin)**
1. Admin accede a panel de administración
2. Crea organización manualmente
3. Envía credenciales al cliente
4. Cliente completa onboarding

---

## 🔧 Configuración de WhatsApp por Cliente

### **Desde el Dashboard**

Crear página `/settings/whatsapp`:

```typescript
// WhatsAppSettings.tsx
function WhatsAppSettings() {
  const [config, setConfig] = useState({
    phoneNumber: '',
    maytapiProductId: '',
    maytapiPhoneId: '',
    apiKey: ''
  });

  const handleSave = async () => {
    // Validar con Maytapi
    const isValid = await validateMaytapiConfig(config);
    
    if (isValid) {
      // Guardar en Firestore
      await updateDoc(doc(db, 'organizations', orgId), {
        whatsappConfig: config
      });
      
      // Configurar webhook automáticamente
      await configureWebhook(config);
    }
  };

  return (/* UI de configuración */);
}
```

### **Webhook Dinámico**

La Cloud Function `receiveWhatsapp` debe leer la configuración de la organización:

```typescript
// En whatsappReceiver.ts
export const receiveWhatsapp = functions.https.onRequest(async (req, res) => {
  const { phoneNumber, message } = req.body;
  
  // 1. Buscar organización por número de WhatsApp
  const orgSnapshot = await db.collection('organizations')
    .where('whatsappConfig.phoneNumber', '==', phoneNumber)
    .limit(1)
    .get();
  
  if (orgSnapshot.empty) {
    res.status(404).json({ error: 'Organización no encontrada' });
    return;
  }
  
  const org = orgSnapshot.docs[0].data();
  
  // 2. Procesar mensaje con el contexto de la organización
  await processMessage(message, org.id, org.whatsappConfig);
  
  res.status(200).json({ success: true });
});
```

---

## 📈 Escalabilidad y Performance

### **Índices Compuestos Necesarios**

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "vehicles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "leads",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "organizations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "whatsappConfig.phoneNumber", "order": "ASCENDING" }
      ]
    }
  ]
}
```

### **Queries Optimizadas**

```typescript
// Siempre filtrar por organizationId primero
const vehiclesRef = collection(db, 'vehicles');
const q = query(
  vehiclesRef,
  where('organizationId', '==', userOrgId), // ← Siempre primero
  where('status', '==', 'Disponible'),
  limit(50) // ← Siempre paginar
);
```

### **Costos Estimados (300 clientes)**

| Servicio | Uso Estimado | Costo/mes |
|----------|--------------|-----------|
| Firestore Reads | ~10M reads | $200 |
| Firestore Writes | ~2M writes | $100 |
| Cloud Functions | ~500K invocations | $150 |
| Storage | ~100GB | $50 |
| **TOTAL** | | **~$500/mes** |

**Ingresos**: 300 clientes × $50/mes = **$15,000/mes**  
**Margen**: **$14,500/mes** (96.7%)

---

## ✅ Checklist de Implementación

### **Fase 1: Fundamentos (Semana 1-2)**
- [x] Crear tipos `Organization` y `UserProfile`
- [x] Crear `RegisterView.tsx`
- [x] Crear `OnboardingView.tsx`
- [x] Crear Cloud Function `createOrganization`
- [ ] Actualizar Firestore Rules
- [ ] Agregar `organizationId` a todas las colecciones existentes
- [ ] Actualizar todas las queries para filtrar por `organizationId`

### **Fase 2: Migración de Datos (Semana 3)**
- [ ] Script para agregar `organizationId` a datos existentes
- [ ] Crear organización "default" para datos actuales
- [ ] Asignar custom claims a usuarios existentes
- [ ] Testing de queries con multi-tenancy

### **Fase 3: Dashboard de Configuración (Semana 4)**
- [ ] Crear página `/settings/whatsapp`
- [ ] Implementar validación de Maytapi
- [ ] Configuración dinámica de webhooks
- [ ] Panel de gestión de usuarios (para admins)

### **Fase 4: Testing y Lanzamiento (Semana 5-6)**
- [ ] Testing con 3-5 clientes piloto
- [ ] Ajustes de performance
- [ ] Documentación de usuario
- [ ] Landing page de marketing
- [ ] Sistema de pagos (Stripe/MercadoPago)

---

## 🎯 Próximos Pasos Recomendados

1. **Actualizar Firestore Rules** con las reglas multi-tenant
2. **Migrar datos existentes** agregando `organizationId`
3. **Integrar RegisterView en App.tsx**
4. **Desplegar Cloud Function** `createOrganization`
5. **Testing completo** del flujo de registro

---

## 📞 Soporte

Para dudas sobre la implementación, contactar al equipo de desarrollo.
