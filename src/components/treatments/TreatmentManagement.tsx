import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

const TreatmentManagement = () => {
    const { treatments, patients, appointments, addTreatment } = useSupabaseData();
    const { profile } = useSupabaseAuth();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        patient_id: '',
        appointment_id: '',
        description: '',
        cost: '',
    });
    const [loading, setLoading] = useState(false);

    const filteredAppointments = appointments.filter(a => a.patient_id === formData.patient_id);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.patient_id || !formData.appointment_id || !formData.description || !formData.cost) return;
        setLoading(true);
        const success = await addTreatment({
            patient_id: formData.patient_id,
            dentist_id: profile?.id || '',
            appointment_id: formData.appointment_id,
            description: formData.description,
            cost: parseFloat(formData.cost),
        });
        setLoading(false);
        if (success) {
            toast({ title: 'Treatment added', description: 'Treatment has been added successfully.' });
            setFormData({ patient_id: '', appointment_id: '', description: '', cost: '' });
        } else {
            toast({ title: 'Error', description: 'Failed to add treatment.', variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Add Treatment</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Patient</Label>
                            <Select value={formData.patient_id} onValueChange={v => setFormData(f => ({ ...f, patient_id: v, appointment_id: '' }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a patient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Appointment</Label>
                            <Select value={formData.appointment_id} onValueChange={v => setFormData(f => ({ ...f, appointment_id: v }))} disabled={!formData.patient_id}>
                                <SelectTrigger>
                                    <SelectValue placeholder={formData.patient_id ? "Select an appointment" : "Select a patient first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredAppointments.length === 0 && <div className="px-2 py-1 text-gray-500">No appointments found</div>}
                                    {filteredAppointments.map(a => (
                                        <SelectItem key={a.id} value={a.id}>{`${a.date} ${a.time} (Room ${a.room_number})`}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} required />
                        </div>
                        <div>
                            <Label>Cost</Label>
                            <Input type="number" min="0" step="0.01" value={formData.cost} onChange={e => setFormData(f => ({ ...f, cost: e.target.value }))} required />
                        </div>
                        <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Treatment'}</Button>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>All Treatments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {treatments.length === 0 && <div className="text-gray-500">No treatments found.</div>}
                        {treatments.map(t => (
                            <div key={t.id} className="border-b py-2">
                                <div><strong>Patient:</strong> {patients.find(p => p.id === t.patient_id)?.name || 'Unknown'}</div>
                                <div><strong>Description:</strong> {t.description}</div>
                                <div><strong>Cost:</strong> ${t.cost.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TreatmentManagement; 