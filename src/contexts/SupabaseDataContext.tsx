import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './SupabaseAuthContext';
import type { Patient, Appointment, Treatment, InventoryItem } from '@/types/database';
import type { Database } from '@/integrations/supabase/types';
import type { InvoiceItem } from '@/types';
import type { Profile } from '@/types/database';

type InvoiceRow = Database['public']['Tables']['invoices']['Row'];

interface DataContextType {
  patients: Patient[];
  appointments: Appointment[];
  treatments: Treatment[];
  inventory: InventoryItem[];
  invoices: InvoiceRow[];
  profiles: Profile[];
  loading: boolean;

  // Patient operations
  fetchPatients: () => Promise<void>;
  addPatient: (patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<boolean>;
  deletePatient: (id: string) => Promise<boolean>;

  // Appointment operations
  fetchAppointments: () => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;

  // Treatment operations
  fetchTreatments: () => Promise<void>;
  addTreatment: (treatment: Omit<Treatment, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;

  // Inventory operations
  fetchInventory: () => Promise<void>;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => Promise<boolean>;

  // Invoice operations
  fetchInvoices: () => Promise<void>;
  addInvoice: (invoice: Omit<InvoiceRow, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateInvoice: (id: string, invoice: Partial<InvoiceRow>) => Promise<boolean>;

  // Profile operations
  fetchProfiles: () => Promise<void>;

  // New operations
  fetchCasesByStaffId: (staffId: string, role: string) => Promise<{ patientName: string; date: string; treatment: string; notes: string }[]>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const SupabaseDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useSupabaseAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const logAction = async (action: string, resource: string, resourceId: string, details: string) => {
    if (!user) return;

    try {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action,
        resource,
        resource_id: resourceId,
        details
      });
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  };

  // Patient operations
  const fetchPatients = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('patients').select('*').order('name');
      if (!error && data) setPatients(data as Patient[]);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
    setLoading(false);
  };

  const addPatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return false;
    try {
      const { data, error } = await supabase.from('patients').insert(patientData).select().single();
      if (!error && data) {
        setPatients(prev => [...prev, data as Patient]);
        await logAction('CREATE', 'Patient', data.id, `Created patient: ${data.name}`);
        return true;
      }
    } catch (error) {
      console.error('Error adding patient:', error);
    }
    return false;
  };

  const updatePatient = async (id: string, patientData: Partial<Patient>) => {
    if (!user) return false;
    try {
      const { data, error } = await supabase.from('patients').update(patientData).eq('id', id).select().single();
      if (!error && data) {
        setPatients(prev => prev.map(p => p.id === id ? data as Patient : p));
        await logAction('UPDATE', 'Patient', id, 'Updated patient data');
        return true;
      }
    } catch (error) {
      console.error('Error updating patient:', error);
    }
    return false;
  };

  const deletePatient = async (id: string) => {
    if (!user) return false;
    try {
      const patient = patients.find(p => p.id === id);
      const { error } = await supabase.from('patients').delete().eq('id', id);
      if (!error) {
        setPatients(prev => prev.filter(p => p.id !== id));
        await logAction('DELETE', 'Patient', id, `Deleted patient: ${patient?.name}`);
        return true;
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
    return false;
  };

  // Appointment operations
  const fetchAppointments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('appointments').select('*').order('date', { ascending: false });
      if (!error && data) setAppointments(data as Appointment[]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
    setLoading(false);
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return false;
    try {
      const { data, error } = await supabase.from('appointments').insert(appointmentData).select().single();
      if (!error && data) {
        setAppointments(prev => [...prev, data as Appointment]);
        await logAction('CREATE', 'Appointment', data.id, `Scheduled appointment for patient ${appointmentData.patient_id}`);
        return true;
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
    return false;
  };

  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    if (!user) return false;
    try {
      const { data, error } = await supabase.from('appointments').update(appointmentData).eq('id', id).select().single();
      if (!error && data) {
        setAppointments(prev => prev.map(a => a.id === id ? data as Appointment : a));
        await logAction('UPDATE', 'Appointment', id, 'Updated appointment');
        return true;
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
    return false;
  };

  const deleteAppointment = async (id: string) => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (!error) {
        setAppointments(prev => prev.filter(a => a.id !== id));
        await logAction('DELETE', 'Appointment', id, 'Cancelled appointment');
        return true;
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
    return false;
  };

  // Treatment operations
  const fetchTreatments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('treatments').select('*').order('created_at', { ascending: false });
      if (!error && data) setTreatments(data as Treatment[]);
    } catch (error) {
      console.error('Error fetching treatments:', error);
    }
    setLoading(false);
  };

  const addTreatment = async (treatmentData: Omit<Treatment, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return false;
    try {
      const { data, error } = await supabase.from('treatments').insert(treatmentData).select().single();
      if (!error && data) {
        setTreatments(prev => [...prev, data as Treatment]);
        await logAction('CREATE', 'Treatment', data.id, `Added treatment for appointment ${treatmentData.appointment_id}`);
        // Create invoice for this treatment
        const invoiceItem: InvoiceItem = {
          id: data.id,
          description: data.description,
          quantity: 1,
          unitPrice: data.cost,
          totalPrice: data.cost,
        };
        const invoice: Omit<InvoiceRow, 'id' | 'createdAt' | 'updatedAt'> = {
          patient_id: data.patient_id,
          appointment_id: data.appointment_id,
          total_amount: data.cost,
          payment_method: 'cash',
          payment_status: 'pending',
          date_issued: new Date().toISOString(),
          items: JSON.stringify([invoiceItem]),
          created_at: null,
          updated_at: null,
          date_paid: null,
        };
        await addInvoice(invoice);
        return true;
      }
    } catch (error) {
      console.error('Error adding treatment:', error);
    }
    return false;
  };

  // Inventory operations
  const fetchInventory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('inventory').select('*').order('name');
      if (!error && data) setInventory(data as InventoryItem[]);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
    setLoading(false);
  };

  const updateInventoryItem = async (id: string, itemData: Partial<InventoryItem>) => {
    if (!user) return false;
    try {
      const { data, error } = await supabase.from('inventory').update(itemData).eq('id', id).select().single();
      if (!error && data) {
        setInventory(prev => prev.map(i => i.id === id ? data as InventoryItem : i));
        await logAction('UPDATE', 'Inventory', id, 'Updated inventory item');
        return true;
      }
    } catch (error) {
      console.error('Error updating inventory item:', error);
    }
    return false;
  };

  // Invoice operations
  const fetchInvoices = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('invoices').select('*').order('date_issued', { ascending: false });
      if (!error && data) setInvoices(data as InvoiceRow[]);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
    setLoading(false);
  };

  const addInvoice = async (invoiceData: Omit<InvoiceRow, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return false;
    try {
      const { data, error } = await supabase.from('invoices').insert(invoiceData).select().single();
      if (!error && data) {
        setInvoices(prev => [data as InvoiceRow, ...prev]);
        await logAction('CREATE', 'Invoice', data.id, `Generated invoice for patient ${invoiceData.patient_id}`);
        return true;
      }
    } catch (error) {
      console.error('Error adding invoice:', error);
    }
    return false;
  };

  const updateInvoice = async (id: string, invoiceData: Partial<InvoiceRow>) => {
    if (!user) return false;
    try {
      const { data, error } = await supabase.from('invoices').update(invoiceData).eq('id', id).select().single();
      if (!error && data) {
        setInvoices(prev => prev.map(i => i.id === id ? data as InvoiceRow : i));
        await logAction('UPDATE', 'Invoice', id, `Updated invoice`);
        return true;
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
    return false;
  };

  // Profile operations
  const fetchProfiles = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) setProfiles(data as Profile[]);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  /**
   * Fetch all cases (appointments and treatments) for a given staff (dentist/nurse) ID
   * Returns: [{ patientName, date, treatment, notes }]
   */
  const fetchCasesByStaffId = async (staffId: string, role: string) => {
    if (!user) return [];
    if (role === 'dentist') {
      // Dentist: fetch treatments where dentist_id = staffId
      const { data: treatments, error } = await supabase
        .from('treatments')
        .select('id, appointment_id, patient_id, description, notes, created_at')
        .eq('dentist_id', staffId)
        .order('created_at', { ascending: false });
      if (error || !treatments) return [];
      // Get patient names
      const patientIds = [...new Set(treatments.map(t => t.patient_id))];
      const { data: patients } = await supabase
        .from('patients')
        .select('id, name')
        .in('id', patientIds);
      const patientMap = Object.fromEntries((patients || []).map(p => [p.id, p.name]));
      return treatments.map(t => ({
        patientName: patientMap[t.patient_id] || t.patient_id,
        date: t.created_at,
        treatment: t.description,
        notes: t.notes || '',
      }));
    } else if (role === 'nurse') {
      // Nurse: fetch patients where nurse_id = staffId, then get their appointments/treatments
      const { data: patients, error } = await supabase
        .from('patients')
        .select('id, name')
        .eq('nurse_id', staffId);
      if (error || !patients) return [];
      const patientIds = patients.map(p => p.id);
      // Get all treatments for these patients
      const { data: treatments } = await supabase
        .from('treatments')
        .select('id, appointment_id, patient_id, description, notes, created_at')
        .in('patient_id', patientIds);
      return (treatments || []).map(t => ({
        patientName: (patients.find(p => p.id === t.patient_id) || {}).name || t.patient_id,
        date: t.created_at,
        treatment: t.description,
        notes: t.notes || '',
      }));
    }
    return [];
  };

  // Auto-fetch data when user logs in
  useEffect(() => {
    if (user && profile) {
      fetchPatients();
      fetchAppointments();
      fetchTreatments();
      fetchInventory();
      fetchInvoices();
      fetchProfiles();
    }
  }, [user, profile]);

  const value = {
    patients,
    appointments,
    treatments,
    inventory,
    invoices,
    profiles,
    loading,
    fetchPatients,
    addPatient,
    updatePatient,
    deletePatient,
    fetchAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    fetchTreatments,
    addTreatment,
    fetchInventory,
    updateInventoryItem,
    fetchInvoices,
    addInvoice,
    updateInvoice,
    fetchProfiles,
    fetchCasesByStaffId,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useSupabaseData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useSupabaseData must be used within a SupabaseDataProvider');
  }
  return context;
};
