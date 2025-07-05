import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';

const ROLES = [
    { value: 'dentist', label: 'Dentist' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'nurse', label: 'Nurse' },
];

const ManageStaffManagement = () => {
    const { profile, signUp } = useSupabaseAuth();
    const { profiles, fetchProfiles, loading } = useSupabaseData();
    const [form, setForm] = useState({
        name: '',
        email: '',
        role: 'receptionist',
        password: '',
    });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    React.useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    if (profile?.role !== 'manager') {
        return (
            <Alert variant="destructive">
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>Only managers can access this page.</AlertDescription>
            </Alert>
        );
    }

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setFormError('');
        setFormSuccess('');
    };

    const handleRole = (value: string) => {
        setForm({ ...form, role: value });
        setFormError('');
        setFormSuccess('');
    };

    const validate = () => {
        if (!form.name.trim()) return 'Name is required.';
        if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Valid email is required.';
        if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters.';
        if (!form.role) return 'Role is required.';
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        const error = validate();
        if (error) {
            setFormError(error);
            return;
        }
        setSubmitting(true);
        const { error: signUpError } = await signUp(form.email, form.password, form.name, form.role);
        setSubmitting(false);
        if (signUpError) {
            setFormError(signUpError.message || 'Failed to create staff.');
        } else {
            setFormSuccess('Staff account created successfully!');
            setForm({ name: '', email: '', role: 'receptionist', password: '' });
            fetchProfiles();
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Staff</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" value={form.name} onChange={handleInput} required />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={form.email} onChange={handleInput} required />
                        </div>
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select value={form.role} onValueChange={handleRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLES.map(r => (
                                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" value={form.password} onChange={handleInput} required minLength={6} />
                        </div>
                        <div className="col-span-2 flex flex-col gap-2">
                            {formError && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{formError}</AlertDescription></Alert>}
                            {formSuccess && <Alert variant="default"><AlertTitle>Success</AlertTitle><AlertDescription>{formSuccess}</AlertDescription></Alert>}
                            <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Add Staff'}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Staff List</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading staff...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {profiles.map(staff => (
                                    <TableRow key={staff.id}>
                                        <TableCell>{staff.name}</TableCell>
                                        <TableCell>{staff.email}</TableCell>
                                        <TableCell className="capitalize">{staff.role}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ManageStaffManagement; 