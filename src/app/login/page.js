'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isRegistering) {
                // Registro
                const { data, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (authError) throw authError;

                if (data.user) {
                    // Asignar rol de admin si es tu correo
                    const role = email === 'renngiann@gmail.com' ? 'admin' : 'student';

                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: data.user.id,
                                first_name: firstName,
                                last_name: lastName,
                                email: email,
                                role: role,
                                approved: false,
                            },
                        ]);

                    if (profileError) throw profileError;

                    alert('¡Registro enviado! El profesor debe aprobar tu cuenta antes de que puedas ingresar.');
                    setIsRegistering(false);
                }
            } else {
                // Login
                const { data, error: loginError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (loginError) throw loginError;

                // Buscar el perfil para saber el rol y si está aprobado
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role, approved')
                    .eq('id', data.user.id)
                    .single();

                if (profileError) throw profileError;

                // Verificar aprobación (admins siempre pasan)
                if (profile.role !== 'admin' && !profile.approved) {
                    await supabase.auth.signOut();
                    setError('Tu cuenta está pendiente de aprobación por el profesor. Intentá de nuevo más tarde.');
                    return;
                }

                if (profile.role === 'admin') {
                    router.push('/dashboard/admin');
                } else {
                    router.push('/dashboard/student');
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex flex-col items-center">
                    <img src="/logo.png" alt="Entrenarte Logo" className="h-20 w-auto mb-4" />
                    <h2 className="text-center text-3xl font-bold text-[#0f4c81] tracking-tight">
                        {isRegistering ? 'Crear cuenta' : 'Ingresar'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500 font-medium tracking-wide uppercase">
                        Campus Virtual • BBA UNLP
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleAuth}>
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm space-y-3">
                        {isRegistering && (
                            <>
                                <div>
                                    <label className="sr-only">Nombre</label>
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#0f4c81] focus:border-[#0f4c81] transition-all sm:text-sm"
                                        placeholder="Nombre"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="sr-only">Apellido</label>
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#0f4c81] focus:border-[#0f4c81] transition-all sm:text-sm"
                                        placeholder="Apellido"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                        <div>
                            <label className="sr-only">Email</label>
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#0f4c81] focus:border-[#0f4c81] transition-all sm:text-sm"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <label className="sr-only">Contraseña</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="appearance-none rounded-lg relative block w-full px-4 py-3 pr-12 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#0f4c81] focus:border-[#0f4c81] transition-all sm:text-sm"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#0f4c81] hover:bg-[#0a355c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f4c81] transition-all disabled:opacity-50 shadow-sm"
                        >
                            {loading ? 'Cargando...' : isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
                        </button>
                    </div>

                    <div className="text-sm text-center">
                        <button
                            type="button"
                            className="font-medium text-[#0f4c81] hover:text-[#0a355c] hover:underline transition-all"
                            onClick={() => setIsRegistering(!isRegistering)}
                        >
                            {isRegistering
                                ? '¿Ya tenés cuenta? Iniciá sesión'
                                : '¿No tenés cuenta? Registrate acá'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
