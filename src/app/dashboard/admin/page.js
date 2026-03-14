'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import GradeForm from '@/components/GradeForm';
import ChatBox from '@/components/ChatBox';
import FileUploader from '@/components/FileUploader';
import ClassManager from '@/components/ClassManager';
export const dynamic = 'force-dynamic';

const CONCEPTUAL_COLORS = {
    A: 'bg-green-100 text-green-800 border-green-300',
    E: 'bg-blue-100 text-blue-800 border-blue-300',
    I: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    O: 'bg-orange-100 text-orange-800 border-orange-300',
    U: 'bg-red-100 text-red-800 border-red-300',
};

export default function AdminDashboard() {
    const [stats, setStats] = useState({ submissions: 0, students: 0 });
    const [recentSubmissions, setRecentSubmissions] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendances, setAttendances] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('entregas');
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [selectedChatStudent, setSelectedChatStudent] = useState(null);
    const [adminProfile, setAdminProfile] = useState(null);
    const [pendingUsers, setPendingUsers] = useState([]);

    function generateThursdays() {
        let dates = [];
        let current = new Date('2026-03-26T00:00:00.000Z');
        const end = new Date('2026-07-17T00:00:00.000Z');

        while (current <= end) {
            dates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 7);
        }
        return dates;
    }

    const thursdays = generateThursdays();

    useEffect(() => {
        const fetchAdminData = async () => {
            setLoading(true);

            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                if (profile) setAdminProfile(profile);
            }

            const { data: stus, count: studentCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact' })
                .eq('role', 'student')
                .eq('approved', true)
                .order('last_name', { ascending: true });

            // Fetch pending (unapproved) users
            const { data: pending } = await supabase
                .from('profiles')
                .select('*')
                .eq('approved', false)
                .order('created_at', { ascending: false });

            const { data: subs, count: subCount } = await supabase
                .from('submissions')
                .select(`
                    id, description, file_url, link_url, created_at, student_id,
                    profiles (first_name, last_name, email)
                `, { count: 'exact' })
                .order('created_at', { ascending: false });

            const { data: atts } = await supabase
                .from('attendances')
                .select('*');

            const { data: grs } = await supabase
                .from('grades')
                .select('*');

            setStats({
                submissions: subCount || 0,
                students: studentCount || 0
            });

            if (stus) setStudents(stus);
            if (subs) setRecentSubmissions(subs);
            if (atts) setAttendances(atts);
            if (grs) setGrades(grs);
            if (pending) setPendingUsers(pending);

            setLoading(false);
        };

        fetchAdminData();
    }, []);

    const handleAttendanceToggle = async (studentId, date) => {
        const existing = attendances.find(a => a.student_id === studentId && a.date === date);

        if (existing) {
            if (existing.status === 'absent') {
                const { data } = await supabase.from('attendances').update({ status: 'present' }).eq('id', existing.id).select().single();
                if (data) setAttendances(attendances.map(a => a.id === existing.id ? data : a));
            } else if (existing.status === 'present') {
                await supabase.from('attendances').delete().eq('id', existing.id);
                setAttendances(attendances.filter(a => a.id !== existing.id));
            }
        } else {
            const { data } = await supabase
                .from('attendances')
                .insert([{ student_id: studentId, date: date, status: 'absent' }])
                .select()
                .single();

            if (data) setAttendances([...attendances, data]);
        }
    };

    const getAttendanceStatus = (studentId, date) => {
        const record = attendances.find(a => a.student_id === studentId && a.date === date);
        return record ? record.status : null;
    };

    const getGradeForSubmission = (submissionId) => {
        return grades.find(g => g.submission_id === submissionId) || null;
    };

    const handleGradeSaved = (newGrade) => {
        setGrades(prev => {
            const exists = prev.find(g => g.submission_id === newGrade.submission_id);
            if (exists) {
                return prev.map(g => g.submission_id === newGrade.submission_id ? newGrade : g);
            }
            return [...prev, newGrade];
        });
    };

    const handleApproveUser = async (userId) => {
        const { error } = await supabase
            .from('profiles')
            .update({ approved: true })
            .eq('id', userId);

        if (!error) {
            const approved = pendingUsers.find(u => u.id === userId);
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
            if (approved && approved.role === 'student') {
                setStudents(prev => [...prev, approved].sort((a, b) => a.last_name.localeCompare(b.last_name)));
                setStats(prev => ({ ...prev, students: prev.students + 1 }));
            }
        }
    };

    const handleRejectUser = async (userId) => {
        // Delete the profile and the auth user will remain but can't access
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (!error) {
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando panel de administración...</div>;

    const pendingCount = pendingUsers.length;

    const tabs = [
        { key: 'entregas', label: 'Entregas' },
        { key: 'clases', label: 'Clases' },
        { key: 'asistencias', label: 'Asistencias' },
        { key: 'mensajes', label: 'Mensajes' },
        { key: 'solicitudes', label: `Solicitudes${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
    ];

    return (
        <div className="space-y-6">
            <header className="pb-4 border-b border-gray-200 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-[#0f4c81]">Panel Docente</h2>
                    <p className="mt-1 text-sm text-gray-600">Gestión de alumnos, entregas, asistencias y mensajes.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded shadow-sm border border-gray-200 border-l-4 border-l-[#0f4c81]">
                    <h3 className="text-lg font-bold text-[#0f4c81] mb-2">Total de Entregas</h3>
                    <p className="text-4xl font-bold text-gray-800">{stats.submissions}</p>
                </div>

                <div className="bg-white p-6 rounded shadow-sm border border-gray-200 border-l-4 border-l-green-600">
                    <h3 className="text-lg font-bold text-green-700 mb-2">Alumnos Inscriptos</h3>
                    <p className="text-4xl font-bold text-gray-800">{stats.students}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-white px-2 mt-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                                ? 'border-[#0f4c81] text-[#0f4c81]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded shadow-sm border border-gray-200">
                {/* ===================== ENTREGAS ===================== */}
                {activeTab === 'entregas' && (
                    <div className="p-6 space-y-6">
                        {/* Admin upload section */}
                        {adminProfile && (
                            <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                                <h3 className="text-sm font-bold text-[#0f4c81] mb-3">📤 Subir material para la clase</h3>
                                <FileUploader userId={adminProfile.id} onUploadSuccess={() => window.location.reload()} />
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-[#f8f9fa] border-y border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[#0f4c81] uppercase tracking-wider">Estudiante</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[#0f4c81] uppercase tracking-wider">Descripción</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[#0f4c81] uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-[#0f4c81] uppercase tracking-wider">Nota</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-[#0f4c81] uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {recentSubmissions.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">No hay entregas registradas en el servidor.</td>
                                        </tr>
                                    ) : (
                                        recentSubmissions.map((sub) => {
                                            const grade = getGradeForSubmission(sub.id);
                                            return (
                                                <tr key={sub.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {sub.profiles?.last_name}, {sub.profiles?.first_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{sub.profiles?.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-700">{sub.description || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(sub.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {grade ? (
                                                            <div className="flex items-center justify-center gap-2">
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold border ${CONCEPTUAL_COLORS[grade.conceptual_grade]}`}>
                                                                    {grade.conceptual_grade}
                                                                </span>
                                                                <span className="text-sm font-bold text-gray-700">{grade.numeric_grade}/10</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">Sin calificar</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                                                        {sub.file_url && (
                                                            <a
                                                                href={supabase.storage.from('trabajos').getPublicUrl(sub.file_url).data.publicUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block bg-[#0f4c81] text-white px-3 py-1.5 rounded hover:bg-[#0a355c] transition-colors"
                                                            >
                                                                📄 Archivo
                                                            </a>
                                                        )}
                                                        {sub.link_url && (
                                                            <a
                                                                href={sub.link_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 transition-colors"
                                                            >
                                                                🔗 Link
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => setGradingSubmission(sub)}
                                                            className={`inline-block px-3 py-1.5 rounded transition-colors ${grade
                                                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300'
                                                                : 'bg-green-600 text-white hover:bg-green-700'
                                                                }`}
                                                        >
                                                            {grade ? 'Editar Nota' : 'Calificar'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ===================== CLASES ===================== */}
                {activeTab === 'clases' && (
                    <ClassManager />
                )}

                {/* ===================== ASISTENCIAS ===================== */}
                {activeTab === 'asistencias' && (
                    <div className="p-6">
                        <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-100 flex items-center flex-wrap gap-1">
                            <span className="mr-2">ℹ️</span>
                            Hacé clic en las celdas para alternar:
                            <span className="mx-2 w-4 h-4 rounded border border-gray-300 bg-white inline-block align-middle"></span> Sin Marcar &rarr;
                            <span className="mx-2 w-4 h-4 rounded border border-red-300 bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px] inline-flex align-middle">A</span> Ausente &rarr;
                            <span className="mx-2 w-4 h-4 rounded border border-green-300 bg-green-100 text-green-700 flex items-center justify-center font-bold text-[10px] inline-flex align-middle">P</span> Presente
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                                <thead className="bg-[#f8f9fa]">
                                    <tr>
                                        <th className="sticky left-0 z-10 bg-[#f8f9fa] px-4 py-3 text-left text-xs font-bold text-[#0f4c81] uppercase tracking-wider border-r border-gray-200">
                                            Estudiantes ({students.length})
                                        </th>
                                        {thursdays.map(date => {
                                            const d = new Date(date + 'T12:00:00Z');
                                            return (
                                                <th key={date} className="px-2 py-3 text-center border-r border-gray-200" style={{ minWidth: '60px' }}>
                                                    <div className="text-[10px] text-gray-500 uppercase">{d.toLocaleDateString('es-AR', { month: 'short' })}</div>
                                                    <div className="text-sm font-bold text-[#0f4c81]">{d.getDate()}</div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.map(student => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="sticky left-0 z-10 bg-white px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                                                {student.last_name}, {student.first_name}
                                            </td>
                                            {thursdays.map(date => {
                                                const status = getAttendanceStatus(student.id, date);
                                                let cellStyle = "cursor-pointer hover:bg-gray-100 transition-colors h-full w-full flex items-center justify-center py-3";
                                                let content = "";

                                                if (status === 'absent') {
                                                    cellStyle += " bg-red-50 text-red-600 font-bold hover:bg-red-100";
                                                    content = "A";
                                                } else if (status === 'present') {
                                                    cellStyle += " bg-green-50 text-green-700 font-bold hover:bg-green-100";
                                                    content = "P";
                                                }

                                                return (
                                                    <td key={date} className="px-0 py-0 border-r border-gray-200 text-center text-sm">
                                                        <div
                                                            className={cellStyle}
                                                            onClick={() => handleAttendanceToggle(student.id, date)}
                                                        >
                                                            {content}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr>
                                            <td colSpan={thursdays.length + 1} className="px-6 py-8 text-center text-sm text-gray-500">
                                                No hay estudiantes registrados todavía.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ===================== MENSAJES ===================== */}
                {activeTab === 'mensajes' && adminProfile && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Sidebar: Student List + Group Chat */}
                            <div className="lg:col-span-1 space-y-4">
                                {/* Group Chat Button */}
                                <button
                                    onClick={() => setSelectedChatStudent(null)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${selectedChatStudent === null
                                        ? 'border-[#0f4c81] bg-blue-50 shadow-sm'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <span className="text-2xl">👥</span>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">Chat Grupal</p>
                                        <p className="text-xs text-gray-500">Mensaje para todos</p>
                                    </div>
                                </button>

                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Chats Privados</h4>
                                    <div className="space-y-1 max-h-64 overflow-y-auto">
                                        {students.map(student => (
                                            <button
                                                key={student.id}
                                                onClick={() => setSelectedChatStudent(student)}
                                                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 ${selectedChatStudent?.id === student.id
                                                    ? 'bg-[#0f4c81] text-white shadow-sm'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${selectedChatStudent?.id === student.id
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                    {student.first_name?.[0]}{student.last_name?.[0]}
                                                </div>
                                                <span className="text-sm truncate">{student.last_name}, {student.first_name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="lg:col-span-2">
                                {selectedChatStudent === null ? (
                                    <ChatBox
                                        key="group"
                                        currentUserId={adminProfile.id}
                                        otherUserId={null}
                                        currentUserName={`${adminProfile.first_name} ${adminProfile.last_name}`}
                                        otherUserName="Chat Grupal"
                                        isGroupChat={true}
                                    />
                                ) : (
                                    <ChatBox
                                        key={selectedChatStudent.id}
                                        currentUserId={adminProfile.id}
                                        otherUserId={selectedChatStudent.id}
                                        currentUserName={`${adminProfile.first_name} ${adminProfile.last_name}`}
                                        otherUserName={`${selectedChatStudent.first_name} ${selectedChatStudent.last_name}`}
                                        isGroupChat={false}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ===================== SOLICITUDES ===================== */}
                {activeTab === 'solicitudes' && (
                    <div className="p-6">
                        {pendingUsers.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-3">✅</div>
                                <p className="text-gray-500 text-sm">No hay solicitudes pendientes de aprobación.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-100 mb-4">
                                    ⚠️ Hay <strong>{pendingUsers.length}</strong> usuario(s) esperando aprobación para acceder a la plataforma.
                                </p>
                                {pendingUsers.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-sm">
                                                {user.first_name?.[0]}{user.last_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">
                                                    {user.last_name}, {user.first_name}
                                                </p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleApproveUser(user.id)}
                                                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                                            >
                                                ✓ Aprobar
                                            </button>
                                            <button
                                                onClick={() => handleRejectUser(user.id)}
                                                className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded hover:bg-red-200 transition-colors border border-red-200"
                                            >
                                                ✕ Rechazar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Grade Form Modal */}
            {gradingSubmission && (
                <GradeForm
                    submission={gradingSubmission}
                    existingGrade={getGradeForSubmission(gradingSubmission.id)}
                    onClose={() => setGradingSubmission(null)}
                    onSaved={handleGradeSaved}
                />
            )}
        </div>
    );
}
