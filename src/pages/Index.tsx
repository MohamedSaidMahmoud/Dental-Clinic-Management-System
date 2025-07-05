
import React from 'react';
import { SupabaseAuthProvider, useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { SupabaseDataProvider } from '@/contexts/SupabaseDataContext';
import AuthPage from '@/components/auth/AuthPage';
import MainLayout from '@/components/layout/MainLayout';

const AppContent = () => {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <SupabaseDataProvider>
      <MainLayout />
    </SupabaseDataProvider>
  );
};

const Index = () => {
  return (
    <SupabaseAuthProvider>
      <AppContent />
    </SupabaseAuthProvider>
  );
};

export default Index;
