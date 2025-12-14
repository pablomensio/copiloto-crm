# 🚀 SPRINT 1: MULTI-TENANT CORE (Semana 1-2)

## 📋 OBJETIVO DEL SPRINT
Transformar la aplicación de single-tenant a multi-tenant, permitiendo que múltiples organizaciones (concesionarios) usen la misma instancia de la aplicación con datos completamente aislados.

**Resultado Esperado**: Sistema donde cada concesionario solo ve y gestiona sus propios datos, sin posibilidad de acceso cruzado.

---

## 🎯 IMPACTO EN LA APLICACIÓN

### **Antes del Sprint**:
- ❌ Todos los usuarios ven todos los vehículos
- ❌ Todos los usuarios ven todos los leads
- ❌ No hay concepto de "organización"
- ❌ Imposible tener múltiples clientes
- ❌ Datos mezclados sin separación

### **Después del Sprint**:
- ✅ Cada organización ve solo sus datos
- ✅ Aislamiento total entre concesionarios
- ✅ Base para sistema SaaS escalable
- ✅ Preparado para 300+ clientes
- ✅ Seguridad reforzada con Firestore Rules

### **Impacto en Usuarios Finales**:
- 🔒 **Seguridad**: Imposible ver datos de otros concesionarios
- ⚡ **Performance**: Queries más rápidas (menos datos por filtrar)
- 🎯 **Relevancia**: Solo ven información de su negocio
- 📊 **Escalabilidad**: Sistema preparado para crecer sin límites

---

## 📝 TAREAS DETALLADAS

### **TAREA 1: Actualizar Tipos con organizationId** ⏱️ 2 horas

**Archivo**: `types.ts`

**Cambios**:
```typescript
// ANTES
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  // ...
}

// DESPUÉS
export interface Vehicle {
  id: string;
  organizationId: string; // ← NUEVO
  make: string;
  model: string;
  // ...
}
```

**Interfaces a Modificar**:
1. `Vehicle` (línea ~8)
2. `Lead` (línea ~104)
3. `Task` (línea ~126)
4. `Menu` (línea ~137)
5. `MultiBudget` (línea ~148)
6. `TradeInAppraisal` (línea ~40)

**Impacto**:
- 🔴 **Breaking Change**: Todos los documentos existentes necesitarán migración
- 📊 **Queries**: Todas las queries necesitarán filtro adicional
- 🔒 **Seguridad**: Permite implementar reglas de aislamiento

**Testing**:
```bash
npm run typecheck
```

---

### **TAREA 2: Actualizar Firestore Rules** ⏱️ 1 hora

**Archivo**: `firestore.rules`

**Cambios Completos**:
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===== HELPERS =====
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserOrgId() {
      return request.auth.token.organizationId;
    }
    
    function belongsToUserOrg(orgId) {
      return isAuthenticated() && getUserOrgId() == orgId;
    }
    
    function isAdmin() {
      return isAuthenticated() && request.auth.token.role == 'admin';
    }

    // ===== ORGANIZATIONS =====
    match /organizations/{orgId} {
      allow read: if belongsToUserOrg(orgId);
      allow write: if belongsToUserOrg(orgId) && isAdmin();
    }

    // ===== USER PROFILES =====
    match /user_profiles/{userId} {
      allow read: if isAuthenticated() && 
                     getUserOrgId() == resource.data.organizationId;
      allow write: if belongsToUserOrg(resource.data.organizationId) && isAdmin();
    }

    // ===== VEHICLES =====
    match /vehicles/{vehicleId} {
      // Público para catálogos compartidos
      allow read: if true;
      
      // Solo crear vehículos de tu organización
      allow create: if isAuthenticated() && 
                       request.resource.data.organizationId == getUserOrgId();
      
      // Solo editar/eliminar vehículos de tu organización
      allow update, delete: if belongsToUserOrg(resource.data.organizationId);
    }

    // ===== LEADS =====
    match /leads/{leadId} {
      // Público puede crear (formularios web, chatbot)
      allow create: if true;
      
      // Solo leer/editar leads de tu organización
      allow read, update, delete: if belongsToUserOrg(resource.data.organizationId);
    }

    // ===== TASKS =====
    match /tasks/{taskId} {
      allow read, write: if belongsToUserOrg(resource.data.organizationId);
    }

    // ===== MENUS =====
    match /menus/{menuId} {
      // Público para catálogos compartidos
      allow read: if true;
      allow write: if belongsToUserOrg(resource.data.organizationId);
    }

    // ===== MULTI-BUDGETS =====
    match /multi_budgets/{budgetId} {
      allow read: if true; // Público para compartir
      allow write: if belongsToUserOrg(resource.data.organizationId);
    }

    // ===== APPRAISALS =====
    match /appraisals/{appraisalId} {
      allow read: if true; // Público para compartir
      allow write: if belongsToUserOrg(resource.data.organizationId);
    }

    // ===== DEFAULT: DENY ALL =====
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Impacto**:
- 🔒 **Seguridad Crítica**: Previene acceso cruzado entre organizaciones
- ⚠️ **Breaking Change**: Queries sin organizationId fallarán
- ✅ **Compliance**: Cumple con GDPR/LGPD

**Testing**:
```bash
# Validar reglas
firebase deploy --only firestore:rules

# Probar en Firebase Console > Firestore > Rules Playground
```

---

### **TAREA 3: Modificar Queries en firebase.ts** ⏱️ 4 horas

**Archivo**: `services/firebase.ts`

**Cambios Necesarios**:

#### **3.1. Agregar función para obtener organizationId**:
```typescript
// NUEVO - Agregar al inicio del archivo
export const getCurrentUserOrgId = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  
  const idTokenResult = await user.getIdTokenResult();
  return idTokenResult.claims.organizationId as string || null;
};
```

#### **3.2. Modificar fetchVehicles()**:
```typescript
// ANTES
export const fetchVehicles = async (): Promise<Record<string, Vehicle>> => {
  const vehiclesRef = collection(db, 'vehicles');
  const snapshot = await getDocs(vehiclesRef);
  // ...
};

// DESPUÉS
export const fetchVehicles = async (): Promise<Record<string, Vehicle>> => {
  const orgId = await getCurrentUserOrgId();
  if (!orgId) throw new Error('No organization ID found');
  
  const vehiclesRef = collection(db, 'vehicles');
  const q = query(
    vehiclesRef,
    where('organizationId', '==', orgId),
    orderBy('createdAt', 'desc'),
    limit(100) // Paginación
  );
  
  const snapshot = await getDocs(q);
  // ...
};
```

#### **3.3. Modificar fetchLeads()**:
```typescript
export const fetchLeads = async (): Promise<Lead[]> => {
  const orgId = await getCurrentUserOrgId();
  if (!orgId) throw new Error('No organization ID found');
  
  const leadsRef = collection(db, 'leads');
  const q = query(
    leadsRef,
    where('organizationId', '==', orgId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  // ...
};
```

#### **3.4. Modificar fetchTasks()**:
```typescript
export const fetchTasks = async (): Promise<Task[]> => {
  const orgId = await getCurrentUserOrgId();
  if (!orgId) throw new Error('No organization ID found');
  
  const tasksRef = collection(db, 'tasks');
  const q = query(
    tasksRef,
    where('organizationId', '==', orgId),
    orderBy('date', 'asc')
  );
  
  const snapshot = await getDocs(q);
  // ...
};
```

#### **3.5. Modificar fetchMenus()**:
```typescript
export const fetchMenus = async (): Promise<Menu[]> => {
  const orgId = await getCurrentUserOrgId();
  if (!orgId) throw new Error('No organization ID found');
  
  const menusRef = collection(db, 'menus');
  const q = query(
    menusRef,
    where('organizationId', '==', orgId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  // ...
};
```

#### **3.6. Modificar saveVehicle()**:
```typescript
export const saveVehicle = async (vehicle: Vehicle): Promise<void> => {
  const orgId = await getCurrentUserOrgId();
  if (!orgId) throw new Error('No organization ID found');
  
  // Asegurar que el vehículo tenga organizationId
  const vehicleWithOrg = {
    ...vehicle,
    organizationId: orgId,
    updatedAt: serverTimestamp()
  };
  
  const vehicleRef = doc(db, 'vehicles', vehicle.id);
  await setDoc(vehicleRef, vehicleWithOrg);
};
```

#### **3.7. Modificar saveLead()**:
```typescript
export const saveLead = async (lead: Lead): Promise<void> => {
  const orgId = await getCurrentUserOrgId();
  if (!orgId) throw new Error('No organization ID found');
  
  const leadWithOrg = {
    ...lead,
    organizationId: orgId,
    updatedAt: serverTimestamp()
  };
  
  const leadRef = doc(db, 'leads', lead.id);
  await setDoc(leadRef, leadWithOrg);
};
```

#### **3.8. Modificar saveTask()**:
```typescript
export const saveTask = async (task: Task): Promise<void> => {
  const orgId = await getCurrentUserOrgId();
  if (!orgId) throw new Error('No organization ID found');
  
  const taskWithOrg = {
    ...task,
    organizationId: orgId,
    updatedAt: serverTimestamp()
  };
  
  const taskRef = doc(db, 'tasks', task.id);
  await setDoc(taskRef, taskWithOrg);
};
```

#### **3.9. Modificar saveMenu()**:
```typescript
export const saveMenu = async (menu: Menu): Promise<void> => {
  const orgId = await getCurrentUserOrgId();
  if (!orgId) throw new Error('No organization ID found');
  
  const menuWithOrg = {
    ...menu,
    organizationId: orgId,
    updatedAt: serverTimestamp()
  };
  
  const menuRef = doc(db, 'menus', menu.id);
  await setDoc(menuRef, menuWithOrg);
};
```

**Impacto**:
- 🎯 **Aislamiento de Datos**: Cada query solo retorna datos de la organización
- ⚡ **Performance**: Queries más rápidas (menos documentos)
- 🔒 **Seguridad**: Doble capa (Rules + Query filter)

**Testing**:
```typescript
// Probar cada función
const vehicles = await fetchVehicles();
console.log('Vehicles:', vehicles); // Solo de mi org

const leads = await fetchLeads();
console.log('Leads:', leads); // Solo de mi org
```

---

### **TAREA 4: Implementar Custom Claims en App.tsx** ⏱️ 2 horas

**Archivo**: `App.tsx`

**Cambios**:

#### **4.1. Agregar estado para organizationId**:
```typescript
// Agregar después de línea 38
const [userOrgId, setUserOrgId] = useState<string | null>(null);
const [userRole, setUserRole] = useState<string | null>(null);
```

#### **4.2. Modificar useEffect de autenticación**:
```typescript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    // ... código existente de public views ...

    if (user) {
      setCurrentUser(user);
      
      // NUEVO: Leer custom claims
      try {
        const idTokenResult = await user.getIdTokenResult();
        const orgId = idTokenResult.claims.organizationId as string;
        const role = idTokenResult.claims.role as string;
        
        if (!orgId) {
          console.error('Usuario sin organizationId');
          // Redirigir a onboarding o mostrar error
          setAuthLoading(false);
          return;
        }
        
        setUserOrgId(orgId);
        setUserRole(role);
        
        console.log('User authenticated:', {
          uid: user.uid,
          organizationId: orgId,
          role: role
        });
        
      } catch (error) {
        console.error('Error reading custom claims:', error);
      }
    } else {
      setUserOrgId(null);
      setUserRole(null);
    }

    setAuthLoading(false);
    setIsLoadingData(false);
  });
  
  return () => unsubscribe();
}, []);
```

#### **4.3. Validar organizationId antes de cargar datos**:
```typescript
// Modificar useEffect de loadData (línea ~188)
useEffect(() => {
  if (!currentUser || !userOrgId) return; // ← Agregar validación
  
  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [fetchedVehicles, fetchedLeads, fetchedTasks, fetchedMenus] = await Promise.all([
        fetchVehicles(),
        fetchLeads(),
        fetchTasks(),
        fetchMenus()
      ]);
      
      // ...
    } catch (error) {
      console.error("Error fetching data:", error);
      setDbError(true);
    } finally {
      setIsLoadingData(false);
    }
  };

  loadData();
}, [currentUser, userOrgId]); // ← Agregar userOrgId como dependencia
```

**Impacto**:
- 🔐 **Autenticación Mejorada**: Validación de permisos desde el inicio
- 🎯 **UX**: Usuario solo ve datos relevantes desde el primer momento
- 🚫 **Prevención de Errores**: No carga datos si no tiene organización

**Testing**:
```bash
# En consola del navegador
console.log('Current User:', auth.currentUser);
auth.currentUser.getIdTokenResult().then(r => console.log('Claims:', r.claims));
```

---

### **TAREA 5: Script de Migración de Datos** ⏱️ 3 horas

**Archivo**: `scripts/migrate_to_multitenant.js`

**Código Completo**:
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.dev.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ID de organización por defecto para datos existentes
const DEFAULT_ORG_ID = 'org_default_1702345678901';

async function migrateToMultiTenant() {
  console.log('🚀 Iniciando migración a multi-tenant...\n');

  try {
    // PASO 1: Crear organización default
    console.log('📋 Paso 1: Creando organización default...');
    const orgRef = db.collection('organizations').doc(DEFAULT_ORG_ID);
    await orgRef.set({
      id: DEFAULT_ORG_ID,
      name: 'Organización Principal',
      businessType: 'concesionario',
      plan: 'pro',
      ownerId: 'admin_user', // Cambiar por UID real
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true,
      settings: {
        maxUsers: 999,
        maxWhatsAppNumbers: 999,
        maxVehicles: 999999
      },
      billing: {
        plan: 'pro',
        status: 'active'
      }
    });
    console.log('✅ Organización creada\n');

    // PASO 2: Migrar vehículos
    console.log('📋 Paso 2: Migrando vehículos...');
    const vehiclesSnapshot = await db.collection('vehicles').get();
    let vehicleCount = 0;
    
    const vehicleBatch = db.batch();
    vehiclesSnapshot.forEach(doc => {
      const vehicleRef = db.collection('vehicles').doc(doc.id);
      vehicleBatch.update(vehicleRef, {
        organizationId: DEFAULT_ORG_ID,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      vehicleCount++;
    });
    
    await vehicleBatch.commit();
    console.log(`✅ ${vehicleCount} vehículos migrados\n`);

    // PASO 3: Migrar leads
    console.log('📋 Paso 3: Migrando leads...');
    const leadsSnapshot = await db.collection('leads').get();
    let leadCount = 0;
    
    const leadBatch = db.batch();
    leadsSnapshot.forEach(doc => {
      const leadRef = db.collection('leads').doc(doc.id);
      leadBatch.update(leadRef, {
        organizationId: DEFAULT_ORG_ID,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      leadCount++;
    });
    
    await leadBatch.commit();
    console.log(`✅ ${leadCount} leads migrados\n`);

    // PASO 4: Migrar tasks
    console.log('📋 Paso 4: Migrando tasks...');
    const tasksSnapshot = await db.collection('tasks').get();
    let taskCount = 0;
    
    const taskBatch = db.batch();
    tasksSnapshot.forEach(doc => {
      const taskRef = db.collection('tasks').doc(doc.id);
      taskBatch.update(taskRef, {
        organizationId: DEFAULT_ORG_ID,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      taskCount++;
    });
    
    await taskBatch.commit();
    console.log(`✅ ${taskCount} tasks migrados\n`);

    // PASO 5: Migrar menus
    console.log('📋 Paso 5: Migrando menus...');
    const menusSnapshot = await db.collection('menus').get();
    let menuCount = 0;
    
    const menuBatch = db.batch();
    menusSnapshot.forEach(doc => {
      const menuRef = db.collection('menus').doc(doc.id);
      menuBatch.update(menuRef, {
        organizationId: DEFAULT_ORG_ID,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      menuCount++;
    });
    
    await menuBatch.commit();
    console.log(`✅ ${menuCount} menus migrados\n`);

    // PASO 6: Crear user_profiles para usuarios existentes
    console.log('📋 Paso 6: Creando user profiles...');
    const users = await admin.auth().listUsers();
    let userCount = 0;
    
    for (const user of users.users) {
      const userProfileRef = db.collection('user_profiles').doc(user.uid);
      await userProfileRef.set({
        id: user.uid,
        organizationId: DEFAULT_ORG_ID,
        email: user.email,
        displayName: user.displayName || 'Usuario',
        role: 'admin', // Todos admin por defecto
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        active: true,
        assignedDeposits: []
      });
      
      // Asignar custom claims
      await admin.auth().setCustomUserClaims(user.uid, {
        organizationId: DEFAULT_ORG_ID,
        role: 'admin'
      });
      
      userCount++;
    }
    console.log(`✅ ${userCount} user profiles creados\n`);

    // RESUMEN
    console.log('🎉 MIGRACIÓN COMPLETADA\n');
    console.log('📊 Resumen:');
    console.log(`   - Organización: ${DEFAULT_ORG_ID}`);
    console.log(`   - Vehículos: ${vehicleCount}`);
    console.log(`   - Leads: ${leadCount}`);
    console.log(`   - Tasks: ${taskCount}`);
    console.log(`   - Menus: ${menuCount}`);
    console.log(`   - Usuarios: ${userCount}`);
    console.log('\n✅ Todos los datos ahora tienen organizationId');

  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Ejecutar migración
migrateToMultiTenant();
```

**Impacto**:
- 🔄 **Migración Segura**: Todos los datos existentes se preservan
- 🏢 **Organización Default**: Datos actuales agrupados en una org
- 👥 **Usuarios Migrados**: Custom claims asignados automáticamente

**Ejecución**:
```bash
# Instalar dependencias
cd scripts
npm install firebase-admin

# Ejecutar migración
node migrate_to_multitenant.js
```

---

### **TAREA 6: Desplegar Cloud Function createOrganization** ⏱️ 30 min

**Comandos**:
```bash
# 1. Ir a carpeta de functions
cd functions

# 2. Instalar dependencias (si no están)
npm install

# 3. Verificar que createOrganization esté exportado en index.ts
# Ya está hecho en archivos anteriores

# 4. Compilar TypeScript
npm run build

# 5. Desplegar solo esta función
firebase deploy --only functions:createOrganization

# 6. Verificar deployment
firebase functions:log --only createOrganization
```

**Configurar CORS**:
```typescript
// En functions/src/createOrganization.ts
// Ya está configurado en el código creado anteriormente
```

**Testing**:
```bash
# Probar con curl
curl -X POST https://us-central1-[PROJECT-ID].cloudfunctions.net/createOrganization \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "Test Concesionario",
    "businessType": "concesionario",
    "fullName": "Juan Test",
    "email": "test@example.com",
    "password": "test123456",
    "phone": "+54911123456",
    "plan": "basic"
  }'
```

**Impacto**:
- 🚀 **Auto-Registro**: Clientes pueden registrarse sin intervención
- ⚡ **Automatización**: Todo el setup se hace en segundos
- 🔒 **Seguridad**: Validaciones en backend

---

### **TAREA 7: Integrar RegisterView y OnboardingView** ⏱️ 2 horas

**Archivo**: `App.tsx`

**Cambios**:

#### **7.1. Importar componentes**:
```typescript
// Agregar al inicio del archivo (después de línea 26)
import RegisterView from './components/RegisterView';
import OnboardingView from './components/OnboardingView';
```

#### **7.2. Agregar estados**:
```typescript
// Agregar después de línea 40
const [appState, setAppState] = useState<'register' | 'login' | 'onboarding' | 'app'>('login');
const [pendingOrgId, setPendingOrgId] = useState<string | null>(null);
```

#### **7.3. Modificar lógica de renderizado**:
```typescript
// Reemplazar la sección de renderizado (línea ~730)

// Si está en registro
if (appState === 'register') {
  return (
    <RegisterView
      onRegisterSuccess={(orgId) => {
        setPendingOrgId(orgId);
        setAppState('onboarding');
      }}
      onSwitchToLogin={() => setAppState('login')}
    />
  );
}

// Si está en onboarding
if (appState === 'onboarding' && pendingOrgId) {
  return (
    <OnboardingView
      organizationId={pendingOrgId}
      onComplete={() => {
        setAppState('app');
        setPendingOrgId(null);
        // Recargar usuario para obtener custom claims actualizados
        window.location.reload();
      }}
    />
  );
}

// Si no está logueado y no es vista pública
if (!currentUser && !authLoading && 
    currentView !== 'public_menu' && 
    currentView !== 'public_vehicle' &&
    currentView !== 'multi_budget') {
  
  return (
    <LoginView 
      onLoginSuccess={() => setAppState('app')}
      onSwitchToRegister={() => setAppState('register')}
    />
  );
}

// App normal...
```

#### **7.4. Modificar LoginView para agregar link de registro**:
```typescript
// En components/LoginView.tsx - Agregar prop
interface LoginViewProps {
  onLoginSuccess: () => void;
  onSwitchToRegister?: () => void; // ← NUEVO
}

// Agregar botón al final del formulario
<p className="text-center text-gray-600 mt-4">
  ¿No tienes cuenta?{' '}
  <button
    type="button"
    onClick={onSwitchToRegister}
    className="text-indigo-600 font-semibold hover:underline"
  >
    Regístrate aquí
  </button>
</p>
```

**Impacto**:
- 🎯 **Flujo Completo**: Registro → Onboarding → Dashboard
- 👥 **Auto-Servicio**: Clientes se registran sin ayuda
- ⚡ **UX Mejorada**: Transiciones suaves entre estados

**Testing**:
1. Abrir app en navegador
2. Click en "Regístrate aquí"
3. Completar formulario de registro
4. Verificar que se crea organización
5. Completar onboarding
6. Verificar acceso al dashboard

---

## 🔍 ÍNDICES COMPUESTOS EN FIRESTORE

**Archivo**: `firestore.indexes.json`

```json
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
      "collectionGroup": "vehicles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
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
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "menus",
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

**Desplegar**:
```bash
firebase deploy --only firestore:indexes
```

---

## ✅ CHECKLIST DE VALIDACIÓN

### **Pre-Deployment**:
- [ ] Todos los tipos tienen `organizationId`
- [ ] Firestore Rules actualizadas y validadas
- [ ] Todas las queries filtran por `organizationId`
- [ ] Custom claims se leen correctamente
- [ ] Script de migración probado en dev
- [ ] Cloud Function desplegada y probada
- [ ] RegisterView y OnboardingView integrados

### **Post-Deployment**:
- [ ] Crear cuenta de prueba desde registro
- [ ] Verificar que solo ve sus datos
- [ ] Crear segunda cuenta de prueba
- [ ] Verificar aislamiento entre cuentas
- [ ] Probar todas las funcionalidades (crear vehículo, lead, task)
- [ ] Verificar performance de queries
- [ ] Revisar logs de errores en Firebase Console

---

## 📊 MÉTRICAS DE ÉXITO

**KPIs del Sprint**:
- ✅ 100% de colecciones con `organizationId`
- ✅ 0 errores de acceso cruzado entre organizaciones
- ✅ Tiempo de query < 500ms (con índices)
- ✅ 2+ organizaciones de prueba funcionando simultáneamente
- ✅ 0 breaking changes en vistas públicas (catálogos)

---

## 🚨 RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Pérdida de datos en migración | Baja | Crítico | Backup completo antes de migrar |
| Queries lentas sin índices | Media | Alto | Crear índices antes de desplegar |
| Usuarios sin organizationId | Media | Alto | Validación en App.tsx + error handling |
| Breaking changes en producción | Alta | Crítico | Desplegar primero en dev, testing exhaustivo |

---

## 📚 DOCUMENTACIÓN ADICIONAL

**Para Desarrolladores**:
- Leer `SISTEMA_REGISTRO.md` completo
- Revisar Firestore Rules en Firebase Console
- Entender flujo de custom claims

**Para QA**:
- Probar aislamiento de datos
- Verificar que no se puede acceder a datos de otra org
- Probar registro completo end-to-end

---

## 🎯 RESULTADO FINAL

Al completar este sprint, la aplicación estará lista para:
- ✅ Soportar múltiples clientes simultáneos
- ✅ Escalar a 300+ organizaciones
- ✅ Cumplir con estándares de seguridad SaaS
- ✅ Base sólida para implementar billing y features avanzados

**Tiempo Total Estimado**: 14-16 horas de desarrollo
