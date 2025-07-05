
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Edit } from 'lucide-react';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Appointment } from '@/types/database';

const AppointmentManagement = () => {
  const { appointments, patients, addAppointment, updateAppointment } = useSupabaseData();
  const { profile } = useSupabaseAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<{
    patient_id: string;
    dentist_id: string;
    date: string;
    time: string;
    room_number: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    is_emergency: boolean;
    notes: string;
  }>({
    patient_id: '',
    dentist_id: '',
    date: '',
    time: '',
    room_number: '',
    status: 'scheduled',
    is_emergency: false,
    notes: ''
  });

  const canManageAppointments = profile?.role === 'receptionist' || profile?.role === 'manager';

  const resetForm = () => {
    setFormData({
      patient_id: '',
      dentist_id: '',
      date: '',
      time: '',
      room_number: '',
      status: 'scheduled',
      is_emergency: false,
      notes: ''
    });
    setEditingAppointment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = editingAppointment 
      ? await updateAppointment(editingAppointment.id, formData)
      : await addAppointment(formData);
    
    if (success) {
      toast({
        title: editingAppointment ? "Appointment updated" : "Appointment scheduled",
        description: `Appointment has been ${editingAppointment ? 'updated' : 'scheduled'} successfully.`
      });
      setIsDialogOpen(false);
      resetForm();
    } else {
      toast({
        title: "Error",
        description: "Failed to save appointment. Please check for conflicts.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patient_id: appointment.patient_id || '',
      dentist_id: appointment.dentist_id || '',
      date: appointment.date || '',
      time: appointment.time || '',
      room_number: appointment.room_number || '',
      status: appointment.status as 'scheduled' | 'completed' | 'cancelled',
      is_emergency: appointment.is_emergency || false,
      notes: appointment.notes || ''
    });
    setIsDialogOpen(true);
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Appointment Management</h2>
          <p className="text-muted-foreground">Schedule and manage patient appointments</p>
        </div>
        
        {canManageAppointments && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="patient">Patient *</Label>
                  <Select value={formData.patient_id} onValueChange={(value) => setFormData({...formData, patient_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} - {patient.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="dentist">Dentist *</Label>
                  <Input
                    id="dentist"
                    value={formData.dentist_id}
                    onChange={(e) => setFormData({...formData, dentist_id: e.target.value})}
                    placeholder="Dentist ID"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="room">Room Number *</Label>
                  <Input
                    id="room"
                    value={formData.room_number}
                    onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: 'scheduled' | 'completed' | 'cancelled') => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="emergency"
                    checked={formData.is_emergency}
                    onChange={(e) => setFormData({...formData, is_emergency: e.target.checked})}
                  />
                  <Label htmlFor="emergency">Emergency Appointment</Label>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingAppointment ? 'Update Appointment' : 'Schedule Appointment'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{getPatientName(appointment.patient_id)}</h3>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      {appointment.is_emergency && (
                        <Badge variant="destructive">Emergency</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                      <div>
                        <strong>Room:</strong> {appointment.room_number}
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="text-sm text-gray-600">
                        <strong>Notes:</strong> {appointment.notes}
                      </div>
                    )}
                  </div>
                  
                  {canManageAppointments && (
                    <Button variant="outline" size="sm" onClick={() => handleEdit(appointment)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
            
            {appointments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No appointments scheduled yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentManagement;
