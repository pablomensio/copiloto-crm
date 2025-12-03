
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
  imageUrls?: string[]; // Array of all vehicle images
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

// Trade-In Appraisal
export interface TradeInAppraisal {
  id: string;
  leadId: string;
  vehicleData: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    transmission: 'Automática' | 'Manual';
    fuelType: 'Híbrido' | 'Gasolina' | 'Eléctrico' | 'Diesel';
    condition: 'Excelente' | 'Muy Bueno' | 'Bueno' | 'Regular' | 'Malo';
    observations: string;
    photos?: string[]; // URLs from Firebase Storage
  };
  marketAnalysis: {
    avg_price: number;
    min_price: number;
    max_price: number;
    suggested_trade_in: number;
    sample_links: string[];
    analyzedAt: string; // ISO date
  };
  offeredValue: number; // Final offered value (adjustable)
  vendorNotes?: string;
  pdfUrl?: string; // URL of generated PDF
  createdAt: string;
  createdBy: string; // userId
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
}

export interface Interaction {
  id: string;
  type: 'call' | 'whatsapp' | 'email' | 'pdf_sent' | 'pdf_view' | 'note' | 'budget' | 'appraisal';
  date: string; // ISO string
  notes?: string;
  details?: string;
  budget?: BudgetCalculation; // Optional structured budget data
  appraisal?: TradeInAppraisal; // Optional appraisal data
  status?: 'sent' | 'viewed' | 'replied';
  // Tracking fields
  viewCount?: number;
  lastViewedAt?: string;
  sharedVia?: 'whatsapp' | 'email' | 'copy' | 'link';
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
  // Extended fields for Chatbot/Public View
  phone?: string;
  source?: string;
  status?: string;
  menuId?: string;
  createdAt?: string;
  email?: string;
  nextFollowUp?: string; // ISO Date String
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

// Multi-Vehicle Budget Comparison
export interface MultiBudget {
  id: string;
  leadId: string;
  leadName: string;
  vehicles: Array<{
    vehicleId: string;
    budget: BudgetCalculation;
  }>; // Max 3
  createdAt: string;
  viewCount: number;
  lastViewedAt?: string;
  sharedVia: 'whatsapp' | 'email' | 'link';
}

export type AppView = 'dashboard' | 'inventory' | 'vehicle_detail' | 'budget_calculator' | 'markup' | 'calendar' | 'tasks' | 'menus' | 'public_menu' | 'menu_editor' | 'public_vehicle' | 'public_budget' | 'multi_budget';

export interface SellerProfile {
  name: string;
  title: string;
  avatarUrl: string; // Can be a URL or a base64 data URI
  companyName?: string;
  phoneNumber?: string;
  businessHours?: string;
}

