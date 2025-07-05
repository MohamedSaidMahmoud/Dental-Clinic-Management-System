import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Calendar,
  Stethoscope,
  Package,
  FileText,
  BarChart3,
  LogOut,
  User
} from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import PatientManagement from '@/components/patients/PatientManagement';
import AppointmentManagement from '@/components/appointments/AppointmentManagement';
import InventoryManagement from '@/components/inventory/InventoryManagement';
import TreatmentManagement from '@/components/treatments/TreatmentManagement';
import BillingManagement from '@/components/billing/BillingManagement';
import ReportPage from '../reports/ReportPage';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import ManageStaffManagement from '@/components/staff/ManageStaffManagement';
import { useNavigate } from 'react-router-dom';
import Profile from '@/pages/Profile';

const MainLayout = () => {
  const { profile, signOut } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'patients', label: 'Patients', icon: Users },
      { id: 'appointments', label: 'Appointments', icon: Calendar },
    ];

    if (profile?.role === 'dentist') {
      baseItems.push({ id: 'treatments', label: 'Treatments', icon: Stethoscope });
    }

    if (profile?.role === 'receptionist' || profile?.role === 'manager') {
      baseItems.push(
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'billing', label: 'Billing', icon: FileText }
      );
    }

    if (profile?.role === 'manager') {
      baseItems.push({ id: 'reports', label: 'Reports', icon: BarChart3 });
      baseItems.push({ id: 'manage-staff', label: 'Manage Staff', icon: Users });
    }

    if (profile?.role === 'nurse') {
      return [];
    }

    return baseItems;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'patients':
        return <PatientManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'treatments':
        return <TreatmentManagement />;
      case 'billing':
        return <BillingManagement />;
      case 'reports':
        return <ReportPage />;
      case 'manage-staff':
        return <ManageStaffManagement />;
      case 'profile':
        return <Profile onBack={() => setActiveTab('dashboard')} />;
      default:
        return <DashboardContent />;
    }
  };

  // Move header JSX into a variable
  const headerContent = (
    <header className="w-full bg-white shadow-sm border-b flex items-center justify-between px-6 h-20">
      <div className="flex items-center space-x-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">🦷 Dental Clinic</h1>
          <p className="text-xs text-gray-600 leading-none">Management System</p>
        </div>
        <nav className="flex items-center space-x-2 ml-8">
          {getMenuItems().map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors text-sm font-medium ${activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile?.avatar} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-end min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:underline" onClick={() => setActiveTab('profile')}>
            {profile?.name}
          </p>
          <Badge variant="outline" className="text-xs capitalize">
            {profile?.role}
          </Badge>
          <button className="text-xs text-blue-600 hover:underline mt-1" onClick={() => setActiveTab('profile')}>My Profile</button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="ml-2"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Conditionally render header */}
      {activeTab !== 'profile' && headerContent}
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const DashboardContent = () => {
  const { profile } = useSupabaseAuth();
  const { patients, appointments, inventory, invoices, treatments } = useSupabaseData();

  // Today's date in YYYY-MM-DD
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Today's Appointments
  const todaysAppointments = appointments.filter(a => a.date === todayStr);

  // Total Patients
  const totalPatients = patients.length;

  // Low Stock Items
  const lowStockCount = inventory.filter(i => i.quantity <= i.low_stock_threshold).length;

  // Revenue Today
  const revenueToday = invoices
    .filter(inv => inv.date_issued === todayStr)
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  // Recent Appointments (latest 3)
  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime())
    .slice(0, 3)
    .map(a => {
      const patient = patients.find(p => p.id === a.patient_id);
      const treatment = treatments.find(t => t.appointment_id === a.id);
      return {
        name: patient?.name || 'Unknown',
        time: a.time,
        treatment: treatment?.description || '',
      };
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.name}!</h2>
        <p className="text-muted-foreground">
          Here's what's happening at the clinic today.
        </p>
      </div>

      {/* Nurse: single column layout with count card and full-width table */}
      {profile?.role === 'nurse' ? (
        <>
          <div className="max-w-xl w-full mx-auto">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todaysAppointments.length}</div>
                <p className="text-xs text-muted-foreground">{todaysAppointments.length > 0 ? `Showing today's appointments` : 'No appointments today'}</p>
              </CardContent>
            </Card>
          </div>
          {todaysAppointments.length > 0 && (
            <div className="mt-6 max-w-3xl w-full mx-auto">
              <div className="mb-2 font-semibold text-lg">Today's Appointments List</div>
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b text-left">Patient Name</th>
                      <th className="px-4 py-2 border-b text-left">Time</th>
                      <th className="px-4 py-2 border-b text-left">Room</th>
                      <th className="px-4 py-2 border-b text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysAppointments.map((apt, idx) => {
                      const patient = patients.find(p => p.id === apt.patient_id);
                      return (
                        <tr
                          key={apt.id}
                          className={
                            `transition-colors ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50`
                          }
                        >
                          <td className="px-4 py-2 border-b">{patient ? patient.name : apt.patient_id}</td>
                          <td className="px-4 py-2 border-b">{apt.time}</td>
                          <td className="px-4 py-2 border-b">{apt.room_number}</td>
                          <td className="px-4 py-2 border-b capitalize">{apt.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todaysAppointments.length}</div>
                <p className="text-xs text-muted-foreground">{todaysAppointments.length > 0 ? `Showing today's appointments` : 'No appointments today'}</p>
              </CardContent>
            </Card>
            {/* Only show the following cards if not nurse */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPatients}</div>
                <p className="text-xs text-muted-foreground">{totalPatients > 0 ? `+${totalPatients} patients` : 'No patients yet'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lowStockCount}</div>
                <p className="text-xs text-muted-foreground">{lowStockCount > 0 ? 'Need restocking' : 'All stocked'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${revenueToday.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{revenueToday > 0 ? '+ Revenue today' : 'No revenue today'}</p>
              </CardContent>
            </Card>
          </div>
          {/* Only show Recent Appointments if not nurse */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAppointments.length === 0 ? (
                    <div className="text-muted-foreground text-sm">No recent appointments.</div>
                  ) : (
                    recentAppointments.map((a, idx) => (
                      <div key={idx} className="flex items-center space-x-4">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{a.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{a.name}</p>
                          <p className="text-xs text-muted-foreground">{a.time} {a.treatment && `- ${a.treatment}`}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default MainLayout;
