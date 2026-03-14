'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import FileUploader from '@/components/FileUploader';
import ContactForm from '@/components/ContactForm';
import ChatBox from '@/components/ChatBox';
import ClassViewer from '@/components/ClassViewer';

const CONCEPTUAL_GRADES = {
    A: 'Realizó las actividades de forma continua y sostenida. Concretó y profundizó la construcción de conocimiento.',
    E: 'Realizó las actividades propuestas. Concretó la construcción de conocimiento.',
    I: 'Realizó las actividades propuestas. Concretó parcialmente la construcción de conocimiento.',
    O: 'Realizó parcial o mínimamente las actividades. Concretó mínimamente la construcción de conocimiento.',
    U: 'No realizó o realizó mínimamente las actividades. No concretó la construcción del conocimiento.',
};

const CONCEPTUAL_COLORS = {
    A: 'bg-green-100 text-green-800 border-green-300',
    E: 'bg-blue-100 text-blue-800 border-blue-300',
    I: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    O: 'bg-orange-100 text-orange-800 border-orange-300',
    U: 'bg-red-100 text-red-800 border-red-300',
};

export default function StudentDashboard() {
    const [studentId, setStudentId] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [attendances, setAttendances] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [adminProfile, setAdminProfile] = useState(null);
    const [activeSection, setActiveSection] = useState('entregas'); // entregas, chat, contacto

    const fetchUserData = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            setStudentId(session.user.id);
            setUserEmail(session.user.email);

            const { data: profile } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', session.user.id)
                .single();
            if (profile) {
                setUserName(`${profile.first_name} ${profile.last_name}`);
            }

            // Obtener entregas
            const { data: subs, error } = await supabase
                .from('submissions')
                .select('*')
                .eq('student_id', session.user.id)
                .order('created_at', { ascending: false });

            if (!error && subs) {
                setSubmissions(subs);
            }

            // Obtener asistencias
            const { data: atts } = await supabase
                .from('attendances')
                .select('*')
                .eq('student_id', session.user.id)
                .order('date', { ascending: false });

            if (atts) {
                setAttendances(atts);
            }

            // Obtener calificaciones
            const { data: grs } = await supabase
                .from('grades')
                .select('*');

            if (grs) {
                setGrades(grs);
            }

            // Obtener perfil del admin (profesor) para el chat
            const { data: admin } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'admin')
                .limit(1)
                .single();

            if (admin) {
                setAdminProfile(admin);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando campus...</div>;

    const absenses = attendances.filter(a => a.status === 'absent');
    const getGradeForSubmission = (subId) => grades.find(g => g.submission_id === subId) || null;

    const sections = [
        { key: 'entregas', label: '📄 Entregas', icon: null },
        { key: 'clases', label: '📚 Clases', icon: null },
        { key: 'chat', label: '💬 Mensajes', icon: null },
        { key: 'contacto', label: '✉️ Contacto', icon: null },
    ];

    return (
        <div className="space-y-6">
            <header className="pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-[#0f4c81]">Área Personal</h2>
                <p className="mt-1 text-sm text-gray-600">Bienvenido a tu espacio en AulasWeb Grado - Entrenarte.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Columna Principal (2 tercios) */}
                <div className="md:col-span-2 space-y-6">
                    {/* Programa */}
                    <div className="bg-white p-6 rounded shadow-sm border border-gray-200 border-l-4 border-l-[#0f4c81]">
                        <h3 className="text-lg font-bold text-[#0f4c81] mb-2 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Programa de Entrenarte 2026
                        </h3>
                        <p className="text-sm text-gray-700 mb-4">
                            Descargá el programa oficial de la materia con los contenidos nucleares, expectativas de logro y bibliografía obligatoria.
                        </p>
                        <button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded transition-colors border border-gray-300">
                            Descargar PDF
                        </button>
                    </div>

                    {/* Section Tabs */}
                    <div className="border-b border-gray-200 bg-white px-2 rounded-t">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Sections">
                            {sections.map(sec => (
                                <button
                                    key={sec.key}
                                    onClick={() => setActiveSection(sec.key)}
                                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeSection === sec.key
                                        ? 'border-[#0f4c81] text-[#0f4c81]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {sec.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* ============ ENTREGAS ============ */}
                    {activeSection === 'entregas' && (
                        <div className="space-y-6">
                            {/* Upload */}
                            <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold text-[#0f4c81] mb-4 border-b pb-2">Entregar Trabajo Práctico</h3>
                                <FileUploader userId={studentId} onUploadSuccess={fetchUserData} />
                            </div>

                            {/* Submissions List with Grades */}
                            <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold text-[#0f4c81] mb-4 border-b pb-2">Mis Entregas y Calificaciones</h3>

                                {submissions.length === 0 ? (
                                    <div className="bg-blue-50 text-[#0f4c81] p-4 rounded text-sm text-center border border-blue-100">
                                        Todavía no subiste ningún archivo en este espacio.
                                    </div>
                                ) : (
                                    <ul className="space-y-3 max-h-[500px] overflow-y-auto">
                                        {submissions.map((sub) => {
                                            const grade = getGradeForSubmission(sub.id);
                                            return (
                                                <li key={sub.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {sub.description || 'Sin descripción'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Subido el: {new Date(sub.created_at).toLocaleDateString('es-AR', {
                                                                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2 shrink-0">
                                                            {sub.file_url && (
                                                                <a
                                                                    href={supabase.storage.from('trabajos').getPublicUrl(sub.file_url).data.publicUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm bg-[#0f4c81] text-white px-3 py-1.5 rounded hover:bg-[#0a355c] transition-colors whitespace-nowrap"
                                                                >
                                                                    📄 Archivo
                                                                </a>
                                                            )}
                                                            {sub.link_url && (
                                                                <a
                                                                    href={sub.link_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 transition-colors whitespace-nowrap"
                                                                >
                                                                    🔗 Link
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Grade Display */}
                                                    {grade ? (
                                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold border ${CONCEPTUAL_COLORS[grade.conceptual_grade]}`}>
                                                                    {grade.conceptual_grade}
                                                                </span>
                                                                <span className="text-lg font-bold text-[#0f4c81]">{grade.numeric_grade}/10</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 italic">{CONCEPTUAL_GRADES[grade.conceptual_grade]}</p>
                                                            {grade.comment && (
                                                                <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded border border-gray-200">
                                                                    💬 {grade.comment}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="mt-2">
                                                            <span className="text-xs text-gray-400 italic">⏳ Pendiente de calificación</span>
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ============ CLASES ============ */}
                    {activeSection === 'clases' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-[#0f4c81] mb-2 px-1">📚 Mis Clases</h3>
                            <ClassViewer />
                        </div>
                    )}

                    {/* ============ CHAT ============ */}
                    {activeSection === 'chat' && studentId && (
                        <div className="space-y-6">
                            {/* Chat with Professor */}
                            {adminProfile && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Chat con el Profesor</h3>
                                    <ChatBox
                                        key={`private-${adminProfile.id}`}
                                        currentUserId={studentId}
                                        otherUserId={adminProfile.id}
                                        currentUserName={userName}
                                        otherUserName={`${adminProfile.first_name} ${adminProfile.last_name}`}
                                        isGroupChat={false}
                                    />
                                </div>
                            )}

                            {/* Group Chat */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Chat Grupal</h3>
                                <ChatBox
                                    key="group"
                                    currentUserId={studentId}
                                    otherUserId={null}
                                    currentUserName={userName}
                                    otherUserName="Chat Grupal"
                                    isGroupChat={true}
                                />
                            </div>
                        </div>
                    )}

                    {/* ============ CONTACTO ============ */}
                    {activeSection === 'contacto' && (
                        <ContactForm userEmail={userEmail} userName={userName} />
                    )}
                </div>

                {/* Columna Secundaria (1 tercio) */}
                <div className="space-y-6">
                    {/* Asistencias */}
                    <div className="bg-white p-6 rounded shadow-sm border border-gray-200 border-t-4 border-t-red-600">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Mi Asistencia</h3>
                        <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded border border-gray-100">
                            <span className="text-sm text-gray-600 font-medium">Inasistencias:</span>
                            <span className="text-2xl font-bold text-red-600">{absenses.length}</span>
                        </div>
                        {absenses.length > 0 ? (
                            <ul className="text-sm text-gray-600 space-y-2">
                                {absenses.map(a => (
                                    <li key={a.id} className="flex items-center bg-red-50 text-red-800 px-3 py-2 rounded">
                                        <div className="w-2 h-2 rounded-full bg-red-500 mr-3"></div>
                                        Ausente - {new Date(a.date).toLocaleDateString('es-AR', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' })}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-green-700 bg-green-50 p-3 rounded font-medium text-center border border-green-200">
                                ¡Asistencia perfecta!
                            </p>
                        )}
                    </div>

                    {/* Resumen de Calificaciones */}
                    <div className="bg-white p-6 rounded shadow-sm border border-gray-200 border-t-4 border-t-[#0f4c81]">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Mis Calificaciones</h3>
                        {grades.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center bg-gray-50 p-3 rounded">Sin calificaciones aún</p>
                        ) : (
                            <div className="space-y-2">
                                {submissions.filter(s => getGradeForSubmission(s.id)).map(sub => {
                                    const grade = getGradeForSubmission(sub.id);
                                    return (
                                        <div key={sub.id} className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-100">
                                            <span className="text-xs text-gray-600 truncate flex-1 mr-2">{sub.description || 'Entrega'}</span>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${CONCEPTUAL_COLORS[grade.conceptual_grade]}`}>
                                                    {grade.conceptual_grade}
                                                </span>
                                                <span className="text-sm font-bold text-[#0f4c81]">{grade.numeric_grade}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Optativas */}
                    <div className="bg-white p-6 rounded shadow-sm border border-gray-200 border-t-4 border-t-yellow-500">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Espacios Optativos</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Información sobre los espacios optativos de profundización artística. Recordá que tenés que elegir al menos uno durante el ciclo lectivo.
                        </p>
                        <div className="space-y-2 text-sm text-[#0f4c81]">
                            <a href="#" className="flex items-center p-2 hover:bg-gray-50 rounded transition-colors group">
                                <span className="mr-2 text-blue-500 group-hover:text-[#0f4c81]">▸</span>
                                Oferta de Optativas 2026
                            </a>
                            <a href="#" className="flex items-center p-2 hover:bg-gray-50 rounded transition-colors group">
                                <span className="mr-2 text-blue-500 group-hover:text-[#0f4c81]">▸</span>
                                Cronograma de inscripción
                            </a>
                            <a href="#" className="flex items-center p-2 hover:bg-gray-50 rounded transition-colors group">
                                <span className="mr-2 text-blue-500 group-hover:text-[#0f4c81]">▸</span>
                                Dudas Frecuentes
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
