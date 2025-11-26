
export enum VehicleStatus {
  AVAILABLE = 'Disponible',
  RESERVED = 'Reservado',
  SOLD = 'Vendido'
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  status: VehicleStatus;
  imageUrl: string;
  // Extended details
  mileage: number;
  transmission: 'Automática' | 'Manual';
  fuelType: 'Híbrido' | 'Gasolina' | 'Eléctrico' | 'Diesel';
  description: string;
}

export interface BudgetCalculation {
  totalACubrir: number;
  totalEntregado: number;
  diferencia: number;
  items: {
    valorVehiculo: number;
    transferencia: number;
    costoOtorgamiento: number;
    autoUsado: number;
    pesos: number;
    sena: number;
    credito: number;
  }
}

export interface Interaction {
  id: string;
  type: 'call' | 'whatsapp' | 'email' | 'pdf_sent' | 'pdf_view' | 'note' | 'budget';
  date: string; // ISO string
  notes?: string;
  details?: string;
  budget?: BudgetCalculation; // Optional structured budget data
  status?: 'sent' | 'viewed' | 'replied';
}

export enum UrgencyLevel {
  Alta = 'Alta',
  Media = 'Media',
  Baja = 'Baja'
}

export interface CopilotResponse {
  analisis: string;
  accion_sugerida: string;
  urgencia: UrgencyLevel;
  borrador_mensaje: string;
}

export interface AnalysisCache {
  hash: string;
  response: CopilotResponse;
  timestamp: number;
}

export interface Lead {
  id: string;
  name: string;
  budget: number;
  interestLevel: 'High' | 'Medium' | 'Low';
  interestedVehicleId: string;
  history: Interaction[];
  avatarUrl: string;
  lastAnalysis?: AnalysisCache;
}

export type Priority = 'High' | 'Medium' | 'Low';
export type TaskType = 'Call' | 'Meeting' | 'Email' | 'FollowUp' | 'Personal' | 'Admin';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO Date String (YYYY-MM-DDTHH:mm:ss.sssZ)
  isCompleted: boolean;
  priority: Priority;
  type: TaskType;
  relatedLeadId?: string; // Optional link to a lead
}

export interface Menu {
  id: string;
  name: string;
  vehicleIds: string[];
  createdAt: string;
  viewCount: number;
  active: boolean;
  withPrice: boolean; // New field to control price visibility
}

export type AppView = 'dashboard' | 'inventory' | 'vehicle_detail' | 'budget_calculator' | 'markup' | 'calendar' | 'tasks' | 'menus' | 'public_menu' | 'menu_editor';

export interface SellerProfile {
  name: string;
  title: string;
  avatarUrl: string; // Can be a URL or a base64 data URI
}
