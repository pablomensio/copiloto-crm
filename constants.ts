import { Lead, Vehicle, VehicleStatus, Task } from './types';

export const INITIAL_VEHICLES: Record<string, Vehicle> = {
  'v1': {
    id: 'v1',
    make: 'Toyota',
    model: 'RAV4 Hybrid',
    year: 2024,
    price: 45000,
    status: VehicleStatus.AVAILABLE,
    imageUrl: 'https://picsum.photos/800/600?random=1',
    mileage: 0,
    transmission: 'Automática',
    fuelType: 'Híbrido',
    description: 'El Toyota RAV4 Hybrid 2024 combina eficiencia y potencia. Con su sistema híbrido avanzado, ofrece un rendimiento excepcional de combustible sin sacrificar la capacidad de respuesta. Equipado con la última tecnología de seguridad Toyota Safety Sense y un interior espacioso y confortable.'
  },
  'v2': {
    id: 'v2',
    make: 'Ford',
    model: 'Mustang GT',
    year: 2023,
    price: 55000,
    status: VehicleStatus.SOLD,
    imageUrl: 'https://picsum.photos/800/600?random=2',
    mileage: 12500,
    transmission: 'Manual',
    fuelType: 'Gasolina',
    description: 'Pura potencia americana. Este Mustang GT 2023 cuenta con el legendario motor V8 Coyote de 5.0L. Acabado en Shadow Black con franjas de carreras. Incluye paquete de rendimiento GT con frenos Brembo y suspensión MagneRide.'
  },
  'v3': {
    id: 'v3',
    make: 'Honda',
    model: 'CR-V',
    year: 2024,
    price: 38000,
    status: VehicleStatus.AVAILABLE,
    imageUrl: 'https://picsum.photos/800/600?random=3',
    mileage: 50,
    transmission: 'Automática',
    fuelType: 'Gasolina',
    description: 'La Honda CR-V 2024 redefine el estándar de los SUV compactos. Diseño robusto y sofisticado, con un interior premium y la mejor capacidad de carga de su clase. Motor turboalimentado eficiente y confiable.'
  },
  'v4': {
    id: 'v4',
    make: 'BMW',
    model: '330i M Sport',
    year: 2022,
    price: 42000,
    status: VehicleStatus.AVAILABLE,
    imageUrl: 'https://picsum.photos/800/600?random=4',
    mileage: 28000,
    transmission: 'Automática',
    fuelType: 'Gasolina',
    description: 'Elegancia deportiva. BMW 330i con paquete M Sport completo. Dirección precisa, aceleración dinámica y un cockpit centrado en el conductor. Mantenimiento al día en concesionario oficial.'
  },
  'v5': {
    id: 'v5',
    make: 'Tesla',
    model: 'Model Y Long Range',
    year: 2023,
    price: 49000,
    status: VehicleStatus.RESERVED,
    imageUrl: 'https://picsum.photos/800/600?random=5',
    mileage: 8000,
    transmission: 'Automática',
    fuelType: 'Eléctrico',
    description: 'El futuro de la conducción. Model Y con tracción total y autonomía extendida. Techo de cristal panorámico, Autopilot básico incluido y acceso a la red de Supercargadores. Cero emisiones.'
  }
};

const now = new Date();
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString();
const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();

export const LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'Carlos Rodríguez',
    budget: 48000,
    interestLevel: 'High',
    interestedVehicleId: 'v1',
    avatarUrl: 'https://picsum.photos/100/100?random=10',
    history: [
      { id: 'i1', type: 'call', date: twoDaysAgo, notes: 'Interesado en financiamiento' },
      { id: 'i2', type: 'pdf_sent', date: twoDaysAgo, details: 'Ficha Técnica RAV4' },
      { id: 'i3', type: 'pdf_view', date: twoDaysAgo, details: 'Visto por 2 min' },
      { id: 'i4', type: 'pdf_view', date: oneHourAgo, details: 'Visto por 5 min' },
      { id: 'i5', type: 'pdf_view', date: oneHourAgo, details: 'Visto pagina de precios' },
      { id: 'i6', type: 'pdf_view', date: oneHourAgo, details: 'Compartido con esposa' }
    ]
  },
  {
    id: 'l2',
    name: 'Ana García',
    budget: 60000,
    interestLevel: 'Medium',
    interestedVehicleId: 'v2', 
    avatarUrl: 'https://picsum.photos/100/100?random=11',
    history: [
      { id: 'i7', type: 'whatsapp', date: twoDaysAgo, notes: 'Preguntó disponibilidad' },
    ]
  },
  {
    id: 'l3',
    name: 'Miguel López',
    budget: 35000,
    interestLevel: 'Low',
    interestedVehicleId: 'v3',
    avatarUrl: 'https://picsum.photos/100/100?random=12',
    history: [
      { id: 'i8', type: 'pdf_sent', date: twentyFiveHoursAgo, details: 'Cotización CR-V' }
    ]
  },
  {
    id: 'l4',
    name: 'Sofia Martinez',
    budget: 45000,
    interestLevel: 'Low',
    interestedVehicleId: 'v4',
    avatarUrl: 'https://picsum.photos/100/100?random=13',
    history: [
      { id: 'i9', type: 'call', date: sixDaysAgo, notes: 'Primer contacto' }
    ]
  }
];

const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Llamar a Carlos Rodríguez',
    description: 'Confirmar recepción de ficha técnica y agendar test drive.',
    date: now.toISOString(),
    isCompleted: false,
    priority: 'High',
    type: 'Call',
    relatedLeadId: 'l1'
  },
  {
    id: 't2',
    title: 'Reunión de equipo',
    description: 'Revisión mensual de objetivos de venta.',
    date: now.toISOString(),
    isCompleted: false,
    priority: 'Medium',
    type: 'Meeting'
  },
  {
    id: 't3',
    title: 'Enviar presupuesto a Ana',
    description: 'Actualizar cotización del Mustang con el nuevo precio.',
    date: tomorrow.toISOString(),
    isCompleted: false,
    priority: 'High',
    type: 'Email',
    relatedLeadId: 'l2'
  },
  {
    id: 't4',
    title: 'Renovar seguro médico',
    description: 'Tarea personal.',
    date: tomorrow.toISOString(),
    isCompleted: false,
    priority: 'Low',
    type: 'Personal'
  }
];