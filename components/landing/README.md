# 🚀 Landing Page - Copiloto CRM

## 📋 Descripción

Landing page de alto impacto diseñada para convertir visitantes en clientes del Plan PRO ($199 USD/mes).

## 🎯 Objetivo

Lograr una tasa de conversión del **15%+** de visitantes a trial y **25%+** de trial a pago.

## 📐 Estructura de Secciones

### 1. **Hero Section** (`HeroSection.tsx`)
- **Objetivo**: Captar atención en 3 segundos
- **Elementos**:
  - Headline impactante: "DEJE DE PERDER EL 65% DE SUS LEADS"
  - Visual 3D de IA (CSS puro con animaciones)
  - 2 CTAs: "Prueba Gratis" y "Ver Demo"
  - Trust badges (400+ clientes, 50K leads, 99.9% uptime)

### 2. **Problem/Solution** (`ProblemSection.tsx`)
- **Objetivo**: Crear urgencia mostrando el costo de no actuar
- **Elementos**:
  - Estadísticas de impacto (65% perdidos, 4h vs 3seg)
  - Comparación visual: SIN vs CON Copiloto
  - Métricas de transformación

### 3. **Features/Benefits** (`FeaturesSection.tsx`)
- **Objetivo**: Mostrar valor ROI por rol
- **Elementos**:
  - Beneficios para Dueño (+200% ROI)
  - Beneficios para Vendedor (+4 horas/día)
  - Beneficios para Cliente (Experiencia Amazon)
  - 6 funciones clave que generan dinero

### 4. **How It Works** (`HowItWorksSection.tsx`)
- **Objetivo**: Demostrar simplicidad del proceso
- **Elementos**:
  - 3 pasos detallados (IA Cosecha, CRM Muestra, Cierre Épico)
  - Flujo completo con ejemplos reales
  - Comparación: Proceso tradicional vs Copiloto
  - Placeholder para video demo (90 seg)

### 5. **Testimonials** (`TestimonialsSection.tsx`)
- **Objetivo**: Generar confianza con casos reales
- **Elementos**:
  - 3 casos de éxito detallados con métricas
  - 5 testimonios cortos (5 estrellas)
  - Trust badges numéricos

### 6. **Pricing** (`PricingSection.tsx`)
- **Objetivo**: Cerrar la venta destacando el Plan PRO
- **Elementos**:
  - 3 planes (Starter $99, PRO $199, Business $399)
  - Plan PRO destacado con ribbon "MÁS POPULAR"
  - Calculadora de ROI interactiva
  - 4 garantías (14 días gratis, satisfacción 30 días, etc.)

### 7. **Final CTA** (`FinalCTASection.tsx`)
- **Objetivo**: Última oportunidad de conversión
- **Elementos**:
  - Oferta de lanzamiento (30 días gratis, onboarding premium)
  - Urgencia (quedan 12 cupos)
  - FAQ rápido (6 preguntas)
  - CTA repetido

### 8. **Footer**
- **Objetivo**: Navegación y confianza
- **Elementos**:
  - 4 columnas (Producto, Soporte, Legal, Sobre Nosotros)
  - Links a redes sociales
  - Copyright y ubicación

---

## 🎨 Diseño y Estilo

### **Paleta de Colores**
```css
--bg-black: #080808        /* Fondo principal */
--accent-cyan: #00FFFF     /* Color de acento primario */
--accent-blue: #007BFF     /* Color de acento secundario */
--text-white: #FFFFFF      /* Texto principal */
--text-gray: #A0AEC0       /* Texto secundario */
--card-bg: #0F0F0F         /* Fondo de tarjetas */
--card-border: #1A1A1A     /* Bordes */
```

### **Tipografía**
- **Font**: Inter (Google Fonts)
- **Headings**: 900 (Extra Bold)
- **Body**: 400 (Regular)
- **CTAs**: 700 (Bold)

### **Animaciones**
- Parallax en hero (GSAP)
- Fade-in en feature cards (stagger)
- Hover effects en pricing cards
- Esfera 3D de IA (CSS animations)

---

## 🛠️ Tecnologías

- **React** + **TypeScript**
- **GSAP** (animaciones de scroll)
- **CSS Modules** (estilos)
- **Vite** (build)

---

## 📱 Responsive

- **Desktop**: 1920px+ (diseño completo)
- **Laptop**: 1024px - 1919px (ajustes de grid)
- **Tablet**: 768px - 1023px (2 columnas)
- **Mobile**: < 768px (1 columna, stack vertical)

---

## 🚀 Cómo Usar

### **Desarrollo**
```bash
npm run dev
```
La landing estará disponible en: `http://localhost:5173/landing`

### **Build**
```bash
npm run build
```

### **Preview**
```bash
npm run preview
```

---

## 📊 Métricas de Éxito

### **Objetivos de Conversión**
- Landing → Trial: **15%+**
- Trial → Pago: **25%+**
- Plan más vendido: **PRO (80%)**
- Tiempo en página: **3+ minutos**
- Bounce rate: **< 40%**

### **Tracking**
- Google Analytics 4
- Hotjar (heatmaps)
- A/B testing de CTAs

---

## 📝 Contenido

Todo el contenido está documentado en:
- **`CONTENIDO_LANDING_PAGE.md`**: Copy completo, scripts, especificaciones

---

## 🎬 Assets Pendientes

### **Videos**
- [ ] Video hero (30 seg): Flujo completo
- [ ] Video explicativo (90 seg): 3 pasos detallados
- [ ] 3 testimoniales (30 seg c/u)
- [ ] Video CTA final (45 seg)

### **Imágenes**
- [ ] Screenshots del dashboard real
- [ ] Mockups de WhatsApp con conversaciones
- [ ] Fotos de clientes (con permiso)
- [ ] Logos de certificaciones (GDPR, LGPD, SOC 2)

### **Animaciones**
- [x] Esfera 3D de IA (CSS)
- [ ] Gráficos de ROI animados (Lottie)
- [ ] Flujo de datos (SVG animado)

---

## 🔧 Próximos Pasos

1. **Integrar con Backend**
   - Formulario de registro funcional
   - Tracking de conversiones
   - A/B testing

2. **Optimización SEO**
   - Meta tags
   - Open Graph
   - Schema.org markup

3. **Performance**
   - Lazy loading de imágenes
   - Code splitting
   - Lighthouse > 90

4. **Testing**
   - A/B testing de headlines
   - Heatmaps de clicks
   - Session recordings

---

## 📞 Contacto

Para cambios en el contenido o diseño, consultar:
- **Documento maestro**: `CONTENIDO_LANDING_PAGE.md`
- **Diseño**: `landing.css`

---

**Última actualización**: 14 de Diciembre, 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Completo (pendiente assets multimedia)
