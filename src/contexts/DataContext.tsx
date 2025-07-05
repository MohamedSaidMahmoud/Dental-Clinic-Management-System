
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, Appointment, Treatment, InventoryItem, Invoice, AuditLog } from '@/types';
import { useAuth } from './AuthContext';

interface DataContextType {
  patients: Patient[];
  appointments: Appointment[];
  treatments: Treatment[];
  inventory: InventoryItem[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
  
  // CRUD operations
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  
  addTreatment: (treatment: Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTreatment: (id: string, treatment: Partial<Treatment>) => void;
  
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  
  logAction: (action: string, resource: string, resourceId: string, details: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = (key: string, setter: any) => {
      const stored = localStorage.getItem(key);
      if (stored) {
        setter(JSON.parse(stored));
      }
    };

    loadData('clinic_patients', setPatients);
    loadData('clinic_appointments', setAppointments);
    loadData('clinic_treatments', setTreatments);
    loadData('clinic_inventory', setInventory);
    loadData('clinic_invoices', setInvoices);
    loadData('clinic_audit_logs', setAuditLogs);
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('clinic_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('clinic_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('clinic_treatments', JSON.stringify(treatments));
  }, [treatments]);

  useEffect(() => {
    localStorage.setItem('clinic_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('clinic_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('clinic_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const getCurrentTimestamp = () => new Date().toISOString();

  const logAction = (action: string, resource: string, resourceId: string, details: string) => {
    if (!user) return;
    
    const log: AuditLog = {
      id: generateId(),
      userId: user.id,
      action,
      resource,
      resourceId,
      details,
      timestamp: getCurrentTimestamp()
    };
    
    setAuditLogs(prev => [log, ...prev]);
  };

  // Patient operations
  const addPatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    const patient: Patient = {
      ...patientData,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    setPatients(prev => [...prev, patient]);
    logAction('CREATE', 'Patient', patient.id, `Created patient: ${patient.name}`);
  };

  const updatePatient = (id: string, patientData: Partial<Patient>) => {
    setPatients(prev => prev.map(p => 
      p.id === id ? { ...p, ...patientData, updatedAt: getCurrentTimestamp() } : p
    ));
    logAction('UPDATE', 'Patient', id, `Updated patient data`);
  };

  const deletePatient = (id: string) => {
    const patient = patients.find(p => p.id === id);
    setPatients(prev => prev.filter(p => p.id !== id));
    logAction('DELETE', 'Patient', id, `Deleted patient: ${patient?.name}`);
  };

  // Appointment operations
  const addAppointment = (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    // Check for dentist double-booking
    const conflictingAppointment = appointments.find(apt => 
      apt.dentistId === appointmentData.dentistId &&
      apt.date === appointmentData.date &&
      apt.time === appointmentData.time &&
      apt.status === 'scheduled'
    );

    if (conflictingAppointment) {
      return false; // Prevent double-booking
    }

    const appointment: Appointment = {
      ...appointmentData,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    
    setAppointments(prev => [...prev, appointment]);
    logAction('CREATE', 'Appointment', appointment.id, `Scheduled appointment for patient ${appointmentData.patientId}`);
    return true;
  };

  const updateAppointment = (id: string, appointmentData: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => 
      a.id === id ? { ...a, ...appointmentData, updatedAt: getCurrentTimestamp() } : a
    ));
    logAction('UPDATE', 'Appointment', id, `Updated appointment`);
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    logAction('DELETE', 'Appointment', id, `Cancelled appointment`);
  };

  // Treatment operations
  const addTreatment = (treatmentData: Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const treatment: Treatment = {
      ...treatmentData,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    setTreatments(prev => [...prev, treatment]);
    logAction('CREATE', 'Treatment', treatment.id, `Added treatment for appointment ${treatmentData.appointmentId}`);
  };

  const updateTreatment = (id: string, treatmentData: Partial<Treatment>) => {
    setTreatments(prev => prev.map(t => 
      t.id === id ? { ...t, ...treatmentData, updatedAt: getCurrentTimestamp() } : t
    ));
    logAction('UPDATE', 'Treatment', id, `Updated treatment`);
  };

  // Inventory operations
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const item: InventoryItem = {
      ...itemData,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    setInventory(prev => [...prev, item]);
    logAction('CREATE', 'Inventory', item.id, `Added inventory item: ${item.name}`);
  };

  const updateInventoryItem = (id: string, itemData: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => 
      i.id === id ? { ...i, ...itemData, updatedAt: getCurrentTimestamp() } : i
    ));
    logAction('UPDATE', 'Inventory', id, `Updated inventory item`);
  };

  const deleteInventoryItem = (id: string) => {
    const item = inventory.find(i => i.id === id);
    setInventory(prev => prev.filter(i => i.id !== id));
    logAction('DELETE', 'Inventory', id, `Removed inventory item: ${item?.name}`);
  };

  // Invoice operations
  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const invoice: Invoice = {
      ...invoiceData,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    setInvoices(prev => [...prev, invoice]);
    logAction('CREATE', 'Invoice', invoice.id, `Generated invoice for patient ${invoiceData.patientId}`);
  };

  const updateInvoice = (id: string, invoiceData: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => 
      i.id === id ? { ...i, ...invoiceData, updatedAt: getCurrentTimestamp() } : i
    ));
    logAction('UPDATE', 'Invoice', id, `Updated invoice`);
  };

  const value = {
    patients,
    appointments,
    treatments,
    inventory,
    invoices,
    auditLogs,
    addPatient,
    updatePatient,
    deletePatient,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addTreatment,
    updateTreatment,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addInvoice,
    updateInvoice,
    logAction
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
