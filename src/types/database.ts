export interface Patient {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  date_of_birth: string;
  phone: string;
  email?: string;
  address?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  medical_history?: string;
  dental_history?: string;
  referring_doctor?: string;
  insurance?: string;
  nurse_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  dentist_id: string;
  date: string;
  time: string;
  room_number: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  is_emergency: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Treatment {
  id: string;
  appointment_id: string;
  patient_id: string;
  dentist_id: string;
  description: string;
  notes?: string;
  cost: number;
  tooth_reference?: string;
  odontogram_data?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiry_date?: string;
  low_stock_threshold: number;
  cost: number;
  supplier?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'receptionist' | 'dentist' | 'manager' | 'nurse';
  avatar?: string;
  created_at: string;
  updated_at: string;
}
