import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BillingManagement = () => {
    const { invoices, patients, appointments, treatments, updateInvoice, addInvoice, fetchInvoices } = useSupabaseData();
    const { toast } = useToast();
    const [payingId, setPayingId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash');

    // State for create invoice modal
    const [open, setOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<string>('');
    const [selectedAppointment, setSelectedAppointment] = useState<string>('');
    const [selectedItems, setSelectedItems] = useState<{ id: string, description: string, quantity: number, unitPrice: number, totalPrice: number }[]>([]);
    const [amount, setAmount] = useState('');
    const [creating, setCreating] = useState(false);

    // Filter appointments for selected patient
    const patientAppointments = appointments.filter(a => a.patient_id === selectedPatient);
    // Treatments for selected appointment
    const appointmentTreatments = treatments.filter(t => t.appointment_id === selectedAppointment);
    // Handle item selection (toggle, quantity)
    const handleToggleItem = (treatment: any) => {
        setSelectedItems(prev => {
            const exists = prev.find(i => i.id === treatment.id);
            if (exists) {
                return prev.filter(i => i.id !== treatment.id);
            } else {
                return [...prev, { id: treatment.id, description: treatment.description, quantity: 1, unitPrice: treatment.cost, totalPrice: treatment.cost }];
            }
        });
    };
    const handleQuantityChange = (id: string, quantity: number) => {
        setSelectedItems(prev => prev.map(i => i.id === id ? { ...i, quantity, totalPrice: i.unitPrice * quantity } : i));
    };
    // Calculate total amount
    const calculatedAmount = selectedItems.reduce((sum, i) => sum + i.totalPrice, 0);

    const handleMarkPaid = async (invoiceId: string) => {
        const success = await updateInvoice(invoiceId, {
            payment_status: 'paid',
            payment_method: paymentMethod,
            date_paid: new Date().toISOString(),
        });
        if (success) {
            toast({ title: 'Invoice paid', description: 'Invoice marked as paid.' });
            setPayingId(null);
        } else {
            toast({ title: 'Error', description: 'Failed to update invoice.', variant: 'destructive' });
        }
    };

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatient || !selectedAppointment || selectedItems.length === 0) {
            toast({ title: 'Missing fields', description: 'Please select a patient, appointment, and at least one item.', variant: 'destructive' });
            return;
        }
        setCreating(true);
        const now = new Date().toISOString();
        const invoice = {
            patient_id: selectedPatient,
            appointment_id: selectedAppointment,
            total_amount: calculatedAmount,
            payment_method: paymentMethod,
            payment_status: 'pending',
            date_issued: now,
            items: JSON.stringify(selectedItems),
            date_paid: null,
            created_at: now,
            updated_at: now,
        };
        const success = await addInvoice(invoice);
        setCreating(false);
        if (success) {
            toast({ title: 'Invoice created', description: 'A new invoice has been added.' });
            setOpen(false);
            setSelectedPatient('');
            setSelectedAppointment('');
            setSelectedItems([]);
            setAmount('');
            fetchInvoices();
        } else {
            toast({ title: 'Error', description: 'Failed to create invoice.', variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Billing</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setOpen(true)}>Create Invoice</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Invoice</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateInvoice} className="space-y-4">
                            <div>
                                <Label htmlFor="patient">Patient</Label>
                                <Select value={selectedPatient} onValueChange={value => { setSelectedPatient(value); setSelectedAppointment(''); setSelectedItems([]); }}>
                                    <SelectTrigger id="patient">
                                        <SelectValue placeholder="Select patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="appointment">Appointment</Label>
                                <Select value={selectedAppointment} onValueChange={value => { setSelectedAppointment(value); setSelectedItems([]); }} disabled={!selectedPatient}>
                                    <SelectTrigger id="appointment">
                                        <SelectValue placeholder="Select appointment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patientAppointments.map(a => (
                                            <SelectItem key={a.id} value={a.id}>{a.date} {a.time}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Items (Treatments)</Label>
                                <div className="space-y-2">
                                    {appointmentTreatments.length === 0 && <div className="text-gray-500">No treatments for this appointment.</div>}
                                    {appointmentTreatments.map(t => (
                                        <div key={t.id} className="flex items-center gap-2">
                                            <input type="checkbox" checked={!!selectedItems.find(i => i.id === t.id)} onChange={() => handleToggleItem(t)} />
                                            <span>{t.description} (${t.cost})</span>
                                            {selectedItems.find(i => i.id === t.id) && (
                                                <input type="number" min={1} value={selectedItems.find(i => i.id === t.id)?.quantity || 1} onChange={e => handleQuantityChange(t.id, parseInt(e.target.value) || 1)} className="w-16 border rounded px-2 py-1" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="amount">Amount</Label>
                                <Input id="amount" type="number" min="0" step="0.01" value={calculatedAmount} readOnly />
                            </div>
                            <div>
                                <Label htmlFor="method">Payment Method</Label>
                                <Select value={paymentMethod} onValueChange={v => setPaymentMethod(v as 'cash' | 'credit')}>
                                    <SelectTrigger id="method">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="credit">Credit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" disabled={creating}>
                                {creating ? 'Creating...' : 'Create Invoice'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {invoices.length === 0 && <div className="text-gray-500">No invoices found.</div>}
                        {invoices.map(inv => {
                            const patient = patients.find(p => p.id === inv.patient_id);
                            return (
                                <div key={inv.id} className="border-b py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <div>
                                        <div><strong>Patient:</strong> {patient ? patient.name : 'Unknown'}</div>
                                        <div><strong>Amount:</strong> ${inv.total_amount?.toFixed(2)}</div>
                                        <div><strong>Status:</strong> {inv.payment_status}</div>
                                        <div><strong>Method:</strong> {inv.payment_method}</div>
                                    </div>
                                    {inv.payment_status === 'pending' && (
                                        <div className="flex flex-col md:flex-row gap-2 items-center">
                                            <Select value={paymentMethod} onValueChange={v => setPaymentMethod(v as 'cash' | 'credit')}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash">Cash</SelectItem>
                                                    <SelectItem value="credit">Credit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button onClick={() => handleMarkPaid(inv.id)} disabled={payingId === inv.id}>
                                                Mark as Paid
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BillingManagement; 