import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Calendar,
  FileText,
  Package,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Clock,
  Bell,
  Settings,
  LogOut,
  Info,
  Plus,
  ClipboardList,
  BarChart2,
  User,
  Sun,
  Moon
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Calendar as MiniCalendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartLegend } from '@/components/ui/chart';
import { useIsMobile } from '@/hooks/use-mobile';
import { LineChart, XAxis, YAxis, Line, Tooltip as RechartsTooltip, Legend as RechartsLegend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';

const navLinks = [
  { label: 'Dashboard', icon: BarChart2 },
  { label: 'Patients', icon: Users },
  { label: 'Appointments', icon: Calendar },
  { label: 'Treatments', icon: FileText },
];

const EnhancedDashboard = () => {
  const { patients, appointments, inventory, invoices, treatments } = useSupabaseData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments;
  // const scheduledAppointments = todayAppointments.filter(apt => apt.status === 'scheduled');
  // const completedAppointments = todayAppointments.filter(apt => apt.status === 'completed');

  const lowStockItems = inventory.filter(item => item.quantity <= item.low_stock_threshold);
  const expiringItems = inventory.filter(item => {
    if (!item.expiry_date) return false;
    const expiryDate = new Date(item.expiry_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow;
  });

  const pendingInvoices = invoices.filter(invoice => invoice.payment_status === 'pending');
  const totalRevenue = invoices
    .filter(invoice => invoice.payment_status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total_amount, 0);

  // Only use real data arrays for cards and stats
  const dashboardCards = [
    {
      title: 'Total Patients',
      value: patients.length.toString(),
      description: 'Registered patients',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: "Today's Appointments",
      value: appointments.length.toString(),
      description: `${appointments.length} total appointments`,
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      description: 'Paid invoices',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Total Treatments',
      value: treatments.length.toString(),
      description: 'All treatments recorded',
      icon: FileText,
      color: 'text-purple-600'
    }
  ];

  // Recent activity
  const recentPatients = [...patients].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 5);
  const recentInvoices = [...invoices].sort((a, b) => (b.date_issued || '').localeCompare(a.date_issued || '')).slice(0, 5);

  // Example revenue progress (simulate vs. target)
  const revenueTarget = 1000; // Example target
  const revenueToday = invoices.filter(inv => inv.payment_status === 'paid' && inv.date_issued === (new Date().toISOString().split('T')[0])).reduce((sum, inv) => sum + inv.total_amount, 0);
  const revenueProgress = Math.min(100, Math.round((revenueToday / revenueTarget) * 100));

  // Revenue data for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const revenueByDay = last7Days.map(date => ({
    date,
    revenue: invoices.filter(inv => inv.payment_status === 'paid' && inv.date_issued === date).reduce((sum, inv) => sum + inv.total_amount, 0)
  }));

  // Recent appointments (latest 5)
  const recentAppointments = [...appointments]
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 5)
    .map(apt => ({
      ...apt,
      patientName: patients.find(p => p.id === apt.patient_id)?.name || 'Unknown',
      date: apt.date,
      time: apt.time
    }));

  // For recent treatments, just show description and appointment_id.
  const recentTreatments = [...treatments]
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 5)
    .map(treat => ({
      description: treat.description,
      appointment_id: treat.appointment_id
    }));

  // Generic quick actions for all users
  const quickActions = [
    { label: 'Add New Patient', icon: Users },
    { label: 'Schedule Appointment', icon: Calendar },
    { label: 'Check Inventory', icon: Package },
  ];

  return (
    <div className={`min-h-screen flex bg-gray-50 ${darkMode ? 'dark bg-gray-900 text-white' : ''}`}>
      {/* Sidebar */}
      <aside className={`fixed md:static z-30 top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦷</span>
            <div>
              <h1 className="font-bold text-lg">Dental Clinic</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Management System</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <span className="sr-only">Close sidebar</span>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </Button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map(link => {
            const Icon = link.icon;
            return (
              <Button key={link.label} variant="ghost" className="w-full flex items-center gap-3 justify-start rounded-xl py-2 px-3 text-base hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Button>
            );
          })}
        </nav>
        <div className="mt-auto p-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <User className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-700 p-1" />
            <div>
              <div className="font-semibold text-sm">{patients[0]?.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">Manager</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </aside>
      {/* Sidebar overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 py-3 md:py-6 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
              </Button>
            )}
            <h2 className="text-2xl md:text-3xl font-bold">Welcome back, {patients[0]?.name}!</h2>
            <span className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs capitalize font-semibold">Manager</span>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-6 w-6" />
                  {lowStockItems.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-red-500" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setDarkMode(dm => !dm)}>
                  {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{darkMode ? 'Light Mode' : 'Dark Mode'}</TooltipContent>
            </Tooltip>
          </div>
        </header>
        {/* Dashboard Content */}
        <main className="flex-1 p-4 md:p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardCards.map((card, index) => {
              const IconComponent = card.icon;
              const isKeyMetric = [0, 1].includes(index); // First two cards are key metrics
              return (
                <Card key={index} className="rounded-2xl shadow border hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {card.title}
                    </CardTitle>
                    <IconComponent className={`h-5 w-5 ${card.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={isKeyMetric ? "text-4xl font-extrabold" : "text-2xl font-bold"}>
                      {card.value}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {/* Revenue Chart for managers */}
          {true && (
            <div>
              <h2 className="text-xl font-bold mb-4">Revenue (Last 7 Days)</h2>
              <Card className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <ChartContainer
                  config={{ revenue: { label: 'Revenue', color: '#4f46e5' } }}
                  className="w-full h-64"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <RechartsLegend content={<ChartLegend />} />
                      <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Card>
            </div>
          )}
          {/* Recent Appointments & Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recent Appointments */}
            <Card className="rounded-2xl shadow border hover:shadow-lg transition-shadow md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Recent Appointments</CardTitle>
                <a href="#" className="text-blue-600 text-xs font-medium hover:underline">View All</a>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {appointments.slice(0, 5).map(app => {
                    const patientName = patients.find(p => p.id === app.patient_id)?.name || 'Unknown';
                    return (
                      <div key={app.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-2">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 text-lg">
                            {patientName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium">{patientName}</div>
                            <div className="text-xs text-gray-500">{app.time}</div>
                          </div>
                        </div>
                        {/* Optionally show appointment status or nothing */}
                        <span className="text-xs px-2 py-1 rounded font-semibold bg-gray-100 text-gray-700">{app.status}</span>
                      </div>
                    );
                  })}
                  {appointments.length === 0 && <div className="text-gray-400">No recent appointments.</div>}
                </div>
              </CardContent>
            </Card>
            {/* Quick Actions */}
            <Card className="rounded-2xl shadow border hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {quickActions.map(action => {
                  const Icon = action.icon;
                  return (
                    <Button key={action.label} className="w-full flex items-center gap-2 py-2 rounded-xl text-base font-medium hover:scale-[1.02] transition-transform" variant="outline">
                      <Icon className="h-5 w-5" />
                      {action.label}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>
          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Recent Patients</h2>
              <div className="bg-white rounded-lg shadow p-4 divide-y">
                {recentPatients.map(p => (
                  <div key={p.id} className="py-2 flex flex-col">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-xs text-gray-500">Joined: {p.created_at?.split('T')[0]}</span>
                  </div>
                ))}
                {recentPatients.length === 0 && <div className="text-gray-400">No recent patients.</div>}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Recent Invoices</h2>
              <div className="bg-white rounded-lg shadow p-4 divide-y">
                {recentInvoices.map(inv => {
                  const treatment = treatments.find(t => t.appointment_id === inv.appointment_id);
                  return (
                    <div key={inv.id} className="py-2 flex flex-col">
                      <span className="font-medium">${inv.total_amount?.toFixed(2)} - {inv.payment_status}</span>
                      <span className="text-xs text-gray-500">Issued: {inv.date_issued?.split('T')[0]}</span>
                      {treatment && (
                        <div className="text-xs text-gray-500">
                          Treatment: {treatment.description}
                        </div>
                      )}
                    </div>
                  );
                })}
                {recentInvoices.length === 0 && <div className="text-gray-400">No recent invoices.</div>}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
