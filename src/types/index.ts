export interface User {
  id: string;
  name: string;
  email: string;
  role: 'receptionist' | 'dentist' | 'manager' | 'nurse';
  avatar?: string;
}

export interface Patient {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  phone: string;
  email?: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: string;
  dentalHistory: string;
  referringDoctor?: string;
  insurance?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  dentistId: string;
  date: string;
  time: string;
  roomNumber: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  isEmergency: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Treatment {
  id: string;
  appointmentId: string;
  patientId: string;
  dentistId: string;
  description: string;
  notes: string;
  cost: number;
  toothReference?: string;
  odontogramData?: string; // JSON string
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  lowStockThreshold: number;
  cost: number;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  appointmentId?: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'credit';
  paymentStatus: 'pending' | 'paid' | 'overdue';
  dateIssued: string;
  datePaid?: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  timestamp: string;
}
