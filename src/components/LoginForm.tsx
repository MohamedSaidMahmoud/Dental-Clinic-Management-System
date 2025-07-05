
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Login successful",
        description: "Welcome to the Dental Clinic Management System"
      });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const demoAccounts = [
    { role: 'Receptionist', email: 'receptionist@clinic.com', password: 'demo123' },
    { role: 'Dentist', email: 'dentist@clinic.com', password: 'demo123' },
    { role: 'Manager', email: 'manager@clinic.com', password: 'demo123' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              🦷 Dental Clinic
            </CardTitle>
            <CardDescription>
              Management System Login
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Demo Accounts</CardTitle>
            <CardDescription>
              Use these credentials to explore different roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoAccounts.map((account) => (
              <div key={account.role} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm">{account.role}</div>
                <div className="text-xs text-gray-600">
                  Email: {account.email}
                </div>
                <div className="text-xs text-gray-600">
                  Password: {account.password}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
