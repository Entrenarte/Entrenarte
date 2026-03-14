'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (data) {
                setProfile(data);
            }
            setLoading(false);
        };

        checkUser();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            <nav className="bg-[#0f4c81] text-white shadow-md border-b border-[#0a355c]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <img src="/logo.png" alt="Entrenarte Logo" className="h-10 w-auto" />
                        </div>
                        <div className="flex items-center space-x-4">
                            {profile && <NotificationBell userId={profile.id} />}
                            <span className="text-sm font-medium text-blue-100 hidden sm:inline">
                                {profile?.first_name} <span className="text-blue-200/80 font-normal">({profile?.role === 'admin' ? 'Profesor' : 'Alumno'})</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-blue-200 hover:text-white font-medium transition-colors bg-[#0a355c] px-3 py-1.5 rounded"
                            >
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
