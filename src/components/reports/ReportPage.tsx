import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { ChartContainer } from "../ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { useSupabaseData } from '@/contexts/SupabaseDataContext';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, number> {
    return array.reduce((result, item) => {
        const key = keyFn(item);
        result[key] = (result[key] || 0) + 1;
        return result;
    }, {} as Record<string, number>);
}

function groupSumBy<T>(array: T[], keyFn: (item: T) => string, valueFn: (item: T) => number): Record<string, number> {
    return array.reduce((result, item) => {
        const key = keyFn(item);
        result[key] = (result[key] || 0) + valueFn(item);
        return result;
    }, {} as Record<string, number>);
}

function getMonth(dateStr: string | undefined): string {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Unknown';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const ReportPage: React.FC = () => {
    const { patients, appointments, inventory, invoices, treatments, profiles } = useSupabaseData();

    // Prepare data for charts and tables
    const appointmentData = appointments.map((a, idx) => ({
        id: idx + 1,
        patient: patients.find(p => p.id === a.patient_id)?.name || 'Unknown',
        doctor: a.dentist_id,
        date: a.date,
        status: a.status
    }));

    const billingData = invoices.map((inv, idx) => ({
        id: idx + 1,
        patient: patients.find(p => p.id === inv.patient_id)?.name || 'Unknown',
        amount: inv.total_amount,
        date: inv.date_issued,
        status: inv.payment_status
    }));

    const patientData = patients.map((p, idx) => ({
        id: idx + 1,
        name: p.name,
        registered: p.created_at?.split('T')[0] || ''
    }));

    const inventoryData = inventory.map((i, idx) => ({
        id: idx + 1,
        item: i.name,
        stock: i.quantity,
        expiry: i.expiry_date?.split('T')[0] || ''
    }));

    const treatmentData = treatments.map((t, idx) => ({
        id: idx + 1,
        name: t.description,
        count: 1 // You can aggregate by type if needed
    }));

    // --- Appointments ---
    // Stacked bar: appointments per status per date
    const statusByDate = {};
    appointments.forEach(a => {
        const date = a.date;
        if (!statusByDate[date]) statusByDate[date] = { date };
        statusByDate[date][a.status] = (statusByDate[date][a.status] || 0) + 1;
    });
    const appointmentsByStatusData = Object.values(statusByDate);

    // Bar: appointments per doctor
    const doctorMap = Object.fromEntries(profiles.map(p => [p.id, p.name]));
    const appointmentsByDoctor = groupBy(appointments, a => doctorMap[a.dentist_id] || a.dentist_id);
    const appointmentsByDoctorData = Object.entries(appointmentsByDoctor).map(([doctor, count]) => ({ doctor, count }));

    // --- Billing ---
    // Line: total revenue per month
    const revenueByMonth = groupSumBy(invoices, inv => getMonth(inv.date_issued), inv => inv.total_amount);
    const revenueByMonthData = Object.entries(revenueByMonth).map(([month, total]) => ({ month, total }));
    // Pie: paid vs unpaid
    const paidStatus = groupBy(invoices, inv => inv.payment_status);
    const paidStatusData = Object.entries(paidStatus).map(([status, value]) => ({ name: status, value }));
    const statusColorMap: Record<string, string> = { paid: '#00C49F', pending: '#FFBB28', overdue: '#FF8042' };
    const paidStatusConfig = Object.fromEntries(paidStatusData.map((d, idx) => [d.name, { label: d.name.charAt(0).toUpperCase() + d.name.slice(1), color: statusColorMap[d.name] || COLORS[idx % COLORS.length] }]));

    // Line: average invoice amount over time
    const avgByMonth: Record<string, { total: number; count: number }> = {};
    invoices.forEach(inv => {
        const month = getMonth(inv.date_issued);
        if (!avgByMonth[month]) avgByMonth[month] = { total: 0, count: 0 };
        avgByMonth[month].total += inv.total_amount;
        avgByMonth[month].count += 1;
    });
    const avgInvoiceByMonthData = Object.entries(avgByMonth).map(([month, obj]) => ({ month, avg: obj.count ? obj.total / obj.count : 0 }));

    // --- Patients ---
    // Line: new registrations per month
    const regByMonth = groupBy(patients, p => getMonth(p.created_at));
    const regByMonthData = Object.entries(regByMonth).map(([month, value]) => ({ month, value }));
    // Pie: gender distribution
    const genderDist = groupBy(patients, p => p.gender);
    const genderDistData = Object.entries(genderDist).map(([gender, value]) => ({ name: gender, value }));
    const genderColorMap: Record<string, string> = { male: '#0088FE', female: '#FFBB28', other: '#00C49F' };
    const genderConfig = Object.fromEntries(genderDistData.map((d, idx) => [d.name, { label: d.name.charAt(0).toUpperCase() + d.name.slice(1), color: genderColorMap[d.name] || COLORS[idx % COLORS.length] }]));
    // Bar: age groups
    const now = new Date();
    function getAge(dob) {
        const d = new Date(dob);
        let age = now.getFullYear() - d.getFullYear();
        const m = now.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
        return age;
    }
    const ageGroups = { '0-18': 0, '19-35': 0, '36-60': 0, '61+': 0 };
    patients.forEach(p => {
        const age = getAge(p.date_of_birth);
        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 35) ageGroups['19-35']++;
        else if (age <= 60) ageGroups['36-60']++;
        else ageGroups['61+']++;
    });
    const ageGroupsData = Object.entries(ageGroups).map(([group, value]) => ({ group, value }));

    // --- Inventory ---
    // Bar: items low in stock
    const lowStockData = inventory.filter(i => i.quantity <= i.low_stock_threshold).map(i => ({ item: i.name, stock: i.quantity }));
    // Bar: items nearing expiry (within 30 days)
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    const expiringData = inventory.filter(i => i.expiry_date && new Date(i.expiry_date) <= soon).map(i => {
        let days = 0;
        if (i.expiry_date) {
            const exp = new Date(i.expiry_date);
            days = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        }
        return { item: i.name, days };
    });

    // --- Treatments ---
    // Bar: most common treatments
    const treatmentsByType = groupBy(treatments, t => t.description);
    const treatmentsByTypeData = Object.entries(treatmentsByType).map(([type, count]) => ({ type, count }));
    // Bar: treatments per doctor
    const treatmentsByDoctor = groupBy(treatments, t => doctorMap[t.dentist_id] || t.dentist_id);
    const treatmentsByDoctorData = Object.entries(treatmentsByDoctor).map(([doctor, count]) => ({ doctor, count }));

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Reports</h1>
            <Tabs defaultValue="appointments">
                <TabsList className="mb-4 flex flex-wrap gap-2">
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                    <TabsTrigger value="patients">Patients</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="treatments">Treatments</TabsTrigger>
                </TabsList>
                {/* Appointments Tab */}
                <TabsContent value="appointments">
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ChartContainer config={{ scheduled: { label: 'Scheduled', color: '#8884d8' }, completed: { label: 'Completed', color: '#82ca9d' }, cancelled: { label: 'Cancelled', color: '#ffc658' } }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={appointmentsByStatusData}>
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="scheduled" stackId="a" fill="#8884d8" name="Scheduled" />
                                    <Bar dataKey="completed" stackId="a" fill="#82ca9d" name="Completed" />
                                    <Bar dataKey="cancelled" stackId="a" fill="#ffc658" name="Cancelled" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <ChartContainer config={{ doctor: { label: 'Doctor', color: '#0088FE' } }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={appointmentsByDoctorData}>
                                    <XAxis dataKey="doctor" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#0088FE" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                </TabsContent>
                {/* Billing Tab */}
                <TabsContent value="billing">
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ChartContainer config={{ total: { label: 'Total Revenue', color: '#82ca9d' } }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueByMonthData}>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="total" stroke="#82ca9d" />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <ChartContainer config={paidStatusConfig}>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={paidStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {paidStatusData.map((entry, idx) => (
                                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <ChartContainer config={{ avg: { label: 'Average Invoice', color: '#FF8042' } }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={avgInvoiceByMonthData}>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="avg" stroke="#FF8042" />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                </TabsContent>
                {/* Patients Tab */}
                <TabsContent value="patients">
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ChartContainer config={{ value: { label: 'Registrations', color: '#8884d8' } }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={regByMonthData}>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <ChartContainer config={genderConfig}>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={genderDistData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {genderDistData.map((entry, idx) => (
                                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <ChartContainer config={{ value: { label: 'Age Group', color: '#00C49F' } }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={ageGroupsData}>
                                    <XAxis dataKey="group" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#00C49F" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                </TabsContent>
                {/* Inventory Tab */}
                <TabsContent value="inventory">
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ChartContainer config={{ stock: { label: 'Stock', color: '#FF8042' } }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={lowStockData}>
                                    <XAxis dataKey="item" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="stock" fill="#FF8042" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <ChartContainer config={{ days: { label: 'Days to Expiry', color: '#FFBB28' } }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={expiringData}>
                                    <XAxis dataKey="item" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="days" fill="#FFBB28" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                </TabsContent>
                {/* Treatments Tab */}
                <TabsContent value="treatments">
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ChartContainer config={{ count: { label: 'Count', color: '#8884d8' } }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={treatmentsByTypeData}>
                                    <XAxis dataKey="type" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <ChartContainer config={{ count: { label: 'Count', color: '#00C49F' } }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={treatmentsByDoctorData}>
                                    <XAxis dataKey="doctor" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#00C49F" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ReportPage; 