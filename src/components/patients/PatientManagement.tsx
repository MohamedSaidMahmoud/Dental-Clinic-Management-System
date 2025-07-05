import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useToast } from '@/hooks/use-toast';
import type { Patient } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

const PatientManagement = () => {
  const { patients, addPatient, updatePatient, deletePatient } = useSupabaseData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [nurses, setNurses] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState<{
    name: string;
    gender: 'male' | 'female' | 'other';
    date_of_birth: string;
    phone: string;
    email: string;
    address: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relationship: string;
    medical_history: string;
    dental_history: string;
    referring_doctor: string;
    insurance: string;
    nurse_id: string;
  }>({
    name: '',
    gender: 'male',
    date_of_birth: '',
    phone: '',
    email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    medical_history: '',
    dental_history: '',
    referring_doctor: '',
    insurance: '',
    nurse_id: '',
  });

  useEffect(() => {
    const fetchNurses = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'nurse');
      if (!error && data) setNurses(data);
    };
    fetchNurses();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      gender: 'male',
      date_of_birth: '',
      phone: '',
      email: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
      medical_history: '',
      dental_history: '',
      referring_doctor: '',
      insurance: '',
      nurse_id: '',
    });
    setEditingPatient(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = editingPatient
      ? await updatePatient(editingPatient.id, formData)
      : await addPatient(formData);

    if (success) {
      toast({
        title: editingPatient ? "Patient updated" : "Patient added",
        description: `${formData.name} has been ${editingPatient ? 'updated' : 'added'} successfully.`
      });
      setIsDialogOpen(false);
      resetForm();
    } else {
      toast({
        title: "Error",
        description: "Failed to save patient. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name || '',
      gender: patient.gender as 'male' | 'female' | 'other',
      date_of_birth: patient.date_of_birth || '',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      emergency_contact_name: patient.emergency_contact_name || '',
      emergency_contact_phone: patient.emergency_contact_phone || '',
      emergency_contact_relationship: patient.emergency_contact_relationship || '',
      medical_history: patient.medical_history || '',
      dental_history: patient.dental_history || '',
      referring_doctor: patient.referring_doctor || '',
      insurance: patient.insurance || '',
      nurse_id: patient.nurse_id || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      const success = await deletePatient(id);
      if (success) {
        toast({
          title: "Patient deleted",
          description: `${name} has been removed from the system.`
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete patient. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patient Management</h2>
          <p className="text-muted-foreground">Manage patient records and medical information</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPatient ? 'Edit Patient' : 'Add New Patient'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: 'male' | 'female' | 'other') => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="insurance">Insurance</Label>
                  <Input
                    id="insurance"
                    value={formData.insurance}
                    onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nurse">Assigned Nurse</Label>
                  <Select
                    value={formData.nurse_id}
                    onValueChange={(value) => setFormData({ ...formData, nurse_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a nurse" />
                    </SelectTrigger>
                    <SelectContent>
                      {nurses.map((nurse) => (
                        <SelectItem key={nurse.id} value={nurse.id}>
                          {nurse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergency_name">Emergency Contact Name *</Label>
                  <Input
                    id="emergency_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="emergency_phone">Emergency Contact Phone *</Label>
                  <Input
                    id="emergency_phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="emergency_relationship">Relationship *</Label>
                  <Input
                    id="emergency_relationship"
                    value={formData.emergency_contact_relationship}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="medical_history">Medical History</Label>
                <Textarea
                  id="medical_history"
                  value={formData.medical_history}
                  onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="dental_history">Dental History</Label>
                <Textarea
                  id="dental_history"
                  value={formData.dental_history}
                  onChange={(e) => setFormData({ ...formData, dental_history: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="referring_doctor">Referring Doctor</Label>
                <Input
                  id="referring_doctor"
                  value={formData.referring_doctor}
                  onChange={(e) => setFormData({ ...formData, referring_doctor: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPatient ? 'Update Patient' : 'Add Patient'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search patients by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg">{patient.name}</h3>
                      <Badge variant="outline" className="capitalize">
                        {patient.gender}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <strong>DOB:</strong> {new Date(patient.date_of_birth).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Phone:</strong> {patient.phone}
                      </div>
                      {patient.email && (
                        <div>
                          <strong>Email:</strong> {patient.email}
                        </div>
                      )}
                      {patient.insurance && (
                        <div>
                          <strong>Insurance:</strong> {patient.insurance}
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>Emergency Contact:</strong> {patient.emergency_contact_name} ({patient.emergency_contact_relationship}) - {patient.emergency_contact_phone}
                    </div>

                    {patient.medical_history && (
                      <div className="text-sm">
                        <strong>Medical History:</strong> {patient.medical_history}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(patient)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(patient.id, patient.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {filteredPatients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No patients found matching your search.' : 'No patients registered yet.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientManagement;
