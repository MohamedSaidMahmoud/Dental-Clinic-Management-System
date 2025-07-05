import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Calendar,
  FileText,
  Package,
  CreditCard,
  BarChart2,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardLayout = ({ children, activeTab, onTabChange }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    ];

    switch (user?.role) {
      case 'receptionist':
        return [
          ...baseItems,
          { id: 'patients', label: 'Patients', icon: Users },
          { id: 'appointments', label: 'Appointments', icon: Calendar },
          { id: 'billing', label: 'Billing', icon: CreditCard },
          { id: 'inventory', label: 'Inventory', icon: Package },
        ];
      case 'dentist':
        return [
          ...baseItems,
          { id: 'patients', label: 'Patients', icon: Users },
          { id: 'appointments', label: 'My Appointments', icon: Calendar },
          { id: 'treatments', label: 'Treatments', icon: FileText },
        ];
      case 'manager':
        return [
          ...baseItems,
          { id: 'patients', label: 'Patients', icon: Users },
          { id: 'appointments', label: 'Appointments', icon: Calendar },
          { id: 'treatments', label: 'Treatments', icon: FileText },
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'billing', label: 'Billing', icon: CreditCard },
          { id: 'reports', label: 'Reports', icon: BarChart2 },
        ];
      case 'nurse':
        return [];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'
        }`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-3 ${!isSidebarOpen && 'justify-center'}`}>
              <div className="text-2xl">🦷</div>
              {isSidebarOpen && (
                <div>
                  <h1 className="font-bold text-lg">Dental Clinic</h1>
                  <p className="text-sm text-gray-500">Management System</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.length === 0 && user?.role === 'nurse' ? (
            <div className="text-gray-500 text-center">Nursing staff have no system access.</div>
          ) : (
            menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start ${!isSidebarOpen && 'px-2'}`}
                  onClick={() => onTabChange(item.id)}
                >
                  <IconComponent className="h-4 w-4" />
                  {isSidebarOpen && <span className="ml-2">{item.label}</span>}
                </Button>
              );
            })
          )}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className={`flex items-center space-x-3 p-2 rounded-lg bg-gray-50 ${!isSidebarOpen && 'justify-center'
            }`}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>
                {user?.name?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          {user?.role !== 'nurse' && (
            <Button
              variant="ghost"
              size="sm"
              className={`w-full mt-2 ${!isSidebarOpen && 'px-2'}`}
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              {isSidebarOpen && <span className="ml-2">Logout</span>}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 capitalize">
              {activeTab === 'dashboard' ? `${user?.role} Dashboard` : activeTab}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
