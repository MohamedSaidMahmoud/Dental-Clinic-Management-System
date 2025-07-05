
-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  emergency_contact_relationship TEXT NOT NULL,
  medical_history TEXT,
  dental_history TEXT,
  referring_doctor TEXT,
  insurance TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('receptionist', 'dentist', 'manager')),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  dentist_id TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  room_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  is_emergency BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create treatments table
CREATE TABLE public.treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  dentist_id TEXT NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  tooth_reference TEXT,
  odontogram_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory table
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  expiry_date DATE,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  supplier TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patients
CREATE POLICY "Authenticated users can view all patients" ON public.patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update patients" ON public.patients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete patients" ON public.patients FOR DELETE TO authenticated USING (true);

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Create RLS policies for appointments
CREATE POLICY "Authenticated users can view all appointments" ON public.appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update appointments" ON public.appointments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete appointments" ON public.appointments FOR DELETE TO authenticated USING (true);

-- Create RLS policies for treatments
CREATE POLICY "Authenticated users can view all treatments" ON public.treatments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert treatments" ON public.treatments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update treatments" ON public.treatments FOR UPDATE TO authenticated USING (true);

-- Create RLS policies for inventory
CREATE POLICY "Authenticated users can view all inventory" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update inventory" ON public.inventory FOR UPDATE TO authenticated USING (true);

-- Create RLS policies for audit_logs
CREATE POLICY "Users can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'receptionist')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.treatments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
