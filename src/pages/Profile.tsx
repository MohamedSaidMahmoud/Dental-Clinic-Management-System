import React, { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, ArrowLeft } from 'lucide-react';

interface ProfileProps {
    onBack?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
    const { profile, loading } = useSupabaseAuth();
    const { fetchCasesByStaffId } = useSupabaseData();
    const [cases, setCases] = useState<any[]>([]);
    const [casesLoading, setCasesLoading] = useState(false);

    useEffect(() => {
        if (profile && (profile.role === 'dentist' || profile.role === 'nurse')) {
            setCasesLoading(true);
            fetchCasesByStaffId(profile.id, profile.role).then((data) => {
                setCases(data);
                setCasesLoading(false);
            });
        }
    }, [profile, fetchCasesByStaffId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <CardHeader>
                        <CardTitle>Not Authorized</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You must be logged in to view your profile.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            window.location.href = '/';
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 space-y-8">
            <button
                className="flex items-center gap-2 text-blue-600 hover:underline mb-4"
                onClick={handleBack}
            >
                <ArrowLeft className="h-4 w-4" /> Back to Home
            </button>
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={profile.avatar || undefined} />
                        <AvatarFallback>
                            <User className="h-8 w-8" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{profile.name}</CardTitle>
                        <p className="text-gray-600 text-sm">{profile.email}</p>
                        <Badge className="capitalize mt-1">{profile.role}</Badge>
                    </div>
                </CardHeader>
            </Card>
            {(profile.role === 'dentist' || profile.role === 'nurse') && (
                <Card>
                    <CardHeader>
                        <CardTitle>Patient Cases</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {casesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
                            </div>
                        ) : cases.length === 0 ? (
                            <div className="text-gray-500 py-4">No cases found.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient Name</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Treatment</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cases.map((c, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{c.patientName}</TableCell>
                                            <TableCell>{new Date(c.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{c.treatment}</TableCell>
                                            <TableCell>{c.notes}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Profile; 