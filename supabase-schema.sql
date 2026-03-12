-- 1. Create Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Create Submissions table
CREATE TABLE submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Security for submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
-- Estudiantes pueden ver sus propias entregas, admin puede ver TODAS
CREATE POLICY "Students can view own submissions, admins all" ON submissions FOR SELECT 
  USING (auth.uid() = student_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
-- Estudiantes pueden insertar si es su propio id
CREATE POLICY "Students can insert own submissions" ON submissions FOR INSERT WITH CHECK (auth.uid() = student_id);

-- 3. Create Messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- null significa que es un mensaje para el grupo global
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Security for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- Cualquiera puede ver mensajes globales (receiver_id is null). 
-- Y los privados solo si sos el sender o receiver, o si sos admin
CREATE POLICY "View messages" ON messages FOR SELECT 
  USING (
    receiver_id IS NULL 
    OR auth.uid() = sender_id 
    OR auth.uid() = receiver_id 
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Todos pueden insertar mensajes globales o dirigidos a alguien
CREATE POLICY "Insert messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
