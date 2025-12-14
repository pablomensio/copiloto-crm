# 🚀 SPRINT 3: USUARIOS Y BILLING (Semana 4)

## 📋 OBJETIVO DEL SPRINT
Implementar gestión de usuarios con roles/permisos y sistema de suscripciones con Stripe, convirtiendo la aplicación en un SaaS completamente monetizable.

**Resultado Esperado**: Admin puede invitar usuarios, asignar roles, y el sistema cobra automáticamente según el plan contratado.

---

## 🎯 IMPACTO EN LA APLICACIÓN

### **Antes del Sprint**:
- ❌ Solo un usuario por organización
- ❌ Sin sistema de pagos
- ❌ Sin límites por plan
- ❌ No hay ingresos recurrentes
- ❌ Gestión manual de suscripciones

### **Después del Sprint**:
- ✅ Múltiples usuarios por organización
- ✅ Roles y permisos granulares
- ✅ Pagos automáticos con Stripe
- ✅ Límites enforced por plan
- ✅ MRR (Monthly Recurring Revenue) automatizado

### **Impacto en el Negocio**:
- 💰 **Ingresos Recurrentes**: Cobro automático mensual
- 📈 **Upselling**: Clientes upgradeán cuando necesitan más
- 🔒 **Retención**: Billing automático reduce churn
- 👥 **Colaboración**: Equipos completos usan la plataforma

---

## 📝 TAREAS DETALLADAS

### **TAREA 1: Gestión de Usuarios** ⏱️ 6 horas

**Archivo**: `components/UserManagementView.tsx`

**Código Completo**: Ver documento completo en archivo

**Funcionalidades**:
- Lista de usuarios de la organización
- Invitar nuevos usuarios
- Asignar roles (Admin, Supervisor, Vendedor, Revendedor)
- Asignar depósitos específicos
- Activar/Desactivar usuarios
- Eliminar usuarios

**Impacto**:
- 👥 **Colaboración**: Equipos completos trabajan juntos
- 🔒 **Seguridad**: Permisos granulares por rol
- 📊 **Visibilidad**: Admin ve quién tiene acceso

---

### **TAREA 2: Cloud Function inviteUser** ⏱️ 3 horas

**Archivo**: `functions/src/inviteUser.ts`

**Funcionalidades**:
- Crear usuario en Firebase Auth
- Crear user_profile con organizationId
- Asignar custom claims (organizationId, role)
- Enviar email de invitación
- Generar contraseña temporal

**Impacto**:
- ⚡ **Automatización**: Invitación en 1 click
- 📧 **Comunicación**: Email automático al nuevo usuario
- 🔐 **Seguridad**: Contraseña temporal que debe cambiar

---

### **TAREA 3: Sistema de Permisos por Rol** ⏱️ 4 horas

**Archivo**: `hooks/usePermissions.ts`

**Código**:
```typescript
export const usePermissions = () => {
  const { userRole } = useAuth();
  
  return {
    canCreateVehicle: ['admin', 'supervisor'].includes(userRole),
    canDeleteVehicle: ['admin'].includes(userRole),
    canInviteUsers: ['admin'].includes(userRole),
    canEditSettings: ['admin'].includes(userRole),
    canCreateMenu: ['admin', 'supervisor', 'vendedor'].includes(userRole),
    canViewAllLeads: ['admin', 'supervisor'].includes(userRole)
  };
};
```

**Uso en componentes**:
```typescript
const { canCreateVehicle } = usePermissions();

{canCreateVehicle && (
  <button onClick={handleCreate}>Crear Vehículo</button>
)}
```

**Impacto**:
- 🔒 **Seguridad**: UI se adapta a permisos
- 🎯 **UX**: Usuario solo ve lo que puede hacer
- 🚫 **Prevención**: Evita errores de permisos

---

### **TAREA 4: Integración con Stripe** ⏱️ 8 horas

**Archivos**:
- `components/BillingView.tsx`
- `functions/src/billing/createCheckoutSession.ts`
- `functions/src/billing/handleWebhook.ts`
- `functions/src/billing/updateSubscription.ts`

**Flujo Completo**:

#### **4.1. Cliente selecciona plan**:
```typescript
// BillingView.tsx
const handleUpgrade = async (plan: 'basic' | 'pro' | 'enterprise') => {
  const response = await fetch('/api/createCheckoutSession', {
    method: 'POST',
    body: JSON.stringify({ plan, organizationId })
  });
  
  const { sessionUrl } = await response.json();
  window.location.href = sessionUrl; // Redirige a Stripe
};
```

#### **4.2. Stripe procesa pago**:
```typescript
// functions/src/billing/createCheckoutSession.ts
export const createCheckoutSession = functions.https.onRequest(async (req, res) => {
  const { plan, organizationId } = req.body;
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{
      price: PRICE_IDS[plan], // Definido en Stripe
      quantity: 1
    }],
    success_url: `${DOMAIN}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${DOMAIN}/billing`,
    metadata: { organizationId, plan }
  });
  
  res.json({ sessionUrl: session.url });
});
```

#### **4.3. Webhook actualiza suscripción**:
```typescript
// functions/src/billing/handleWebhook.ts
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.rawBody, sig, WEBHOOK_SECRET);
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await updateOrganizationBilling(session.metadata.organizationId, {
        plan: session.metadata.plan,
        status: 'active',
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription
      });
      break;
      
    case 'invoice.payment_failed':
      // Suspender cuenta
      await updateOrganizationBilling(orgId, { status: 'suspended' });
      break;
  }
  
  res.json({ received: true });
});
```

**Impacto**:
- 💰 **Monetización**: Ingresos recurrentes automáticos
- 🔄 **Automatización**: Cobro sin intervención manual
- 📊 **Visibilidad**: Dashboard de ingresos en Stripe

---

### **TAREA 5: Límites por Plan** ⏱️ 3 horas

**Archivo**: `hooks/usePlanLimits.ts`

**Código**:
```typescript
export const usePlanLimits = () => {
  const { organization } = useOrganization();
  
  const limits = {
    basic: { users: 1, whatsapp: 1, vehicles: 50 },
    pro: { users: 5, whatsapp: 2, vehicles: 500 },
    enterprise: { users: 999, whatsapp: 999, vehicles: 999999 }
  };
  
  const currentLimits = limits[organization.plan];
  
  const checkLimit = async (resource: 'users' | 'whatsapp' | 'vehicles') => {
    const current = await getCurrentCount(resource);
    
    if (current >= currentLimits[resource]) {
      return {
        allowed: false,
        message: `Has alcanzado el límite de ${currentLimits[resource]} ${resource}. Upgrade tu plan.`
      };
    }
    
    return { allowed: true };
  };
  
  return { checkLimit, limits: currentLimits };
};
```

**Uso**:
```typescript
// Antes de crear vehículo
const { checkLimit } = usePlanLimits();

const handleCreateVehicle = async () => {
  const check = await checkLimit('vehicles');
  
  if (!check.allowed) {
    alert(check.message);
    navigate('billing'); // Redirige a upgrade
    return;
  }
  
  // Crear vehículo...
};
```

**Impacto**:
- 💰 **Upselling**: Clientes upgradeán cuando crecen
- 🔒 **Enforcement**: Límites se respetan automáticamente
- 📊 **Métricas**: Sabes cuándo clientes necesitan upgrade

---

### **TAREA 6: Trial de 14 Días** ⏱️ 2 horas

**Lógica**:
```typescript
// En App.tsx o componente de layout
const { organization } = useOrganization();

const isInTrial = organization.billing.status === 'trial';
const trialEndsAt = new Date(organization.billing.trialEndsAt);
const daysLeft = Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

// Banner de trial
{isInTrial && (
  <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 text-center">
    <p className="text-yellow-800">
      ⏰ Quedan <strong>{daysLeft} días</strong> de prueba gratis. 
      <button onClick={() => navigate('billing')} className="underline ml-2">
        Upgrade ahora
      </button>
    </p>
  </div>
)}

// Suspender si trial expiró
useEffect(() => {
  if (isInTrial && daysLeft <= 0) {
    // Mostrar pantalla de "Trial Expirado"
    setShowTrialExpired(true);
  }
}, [isInTrial, daysLeft]);
```

**Impacto**:
- 🎯 **Conversión**: Urgencia para convertir a pago
- 💰 **Revenue**: Más clientes convierten antes de expirar
- 📊 **Métricas**: Tracking de conversión de trial

---

## ✅ CHECKLIST DE VALIDACIÓN

### **Pre-Deployment**:
- [ ] UserManagementView creado
- [ ] Cloud Function inviteUser desplegada
- [ ] Sistema de permisos implementado
- [ ] Stripe configurado (API keys, webhooks)
- [ ] Límites por plan implementados
- [ ] Trial de 14 días funcional

### **Post-Deployment**:
- [ ] Invitar usuario de prueba
- [ ] Verificar que recibe email
- [ ] Verificar permisos por rol
- [ ] Hacer checkout de prueba en Stripe
- [ ] Verificar webhook de pago
- [ ] Probar límites (intentar exceder)
- [ ] Verificar banner de trial

---

## 📊 MÉTRICAS DE ÉXITO

**KPIs del Sprint**:
- ✅ 100% de pagos procesados automáticamente
- ✅ 0 errores en webhooks de Stripe
- ✅ 25%+ de conversión de trial a pago
- ✅ 100% de límites enforced correctamente
- ✅ < 5% de churn mensual

---

## 🎯 RESULTADO FINAL

Al completar este sprint:
- ✅ Sistema de usuarios completo
- ✅ Billing automático con Stripe
- ✅ Límites por plan enforced
- ✅ Trial de 14 días
- ✅ MRR tracking automático

**Tiempo Total Estimado**: 26 horas de desarrollo
