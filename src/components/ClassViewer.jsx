'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ClassViewer() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedClass, setExpandedClass] = useState(null);
    const [materials, setMaterials] = useState({});

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        const { data } = await supabase
            .from('classes')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setClasses(data);
        setLoading(false);
    };

    const fetchMaterials = async (classId) => {
        const { data } = await supabase
            .from('class_materials')
            .select('*')
            .eq('class_id', classId)
            .order('created_at', { ascending: true });

        if (data) setMaterials(prev => ({ ...prev, [classId]: data }));
    };

    const toggleExpand = (classId) => {
        if (expandedClass === classId) {
            setExpandedClass(null);
        } else {
            setExpandedClass(classId);
            if (!materials[classId]) fetchMaterials(classId);
        }
    };

    if (loading) return <div className="p-6 text-center text-gray-500">Cargando clases...</div>;

    return (
        <div className="space-y-4">
            {classes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <div className="text-4xl mb-3">📚</div>
                    <p className="text-gray-500 text-sm">Aún no hay clases publicadas.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {classes.map((cls) => (
                        <div key={cls.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            {/* Class Header */}
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleExpand(cls.id)}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-lg bg-[#0f4c81] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                        📖
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-gray-900 text-sm truncate">{cls.title}</h4>
                                        <p className="text-xs text-gray-500">
                                            {new Date(cls.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-gray-400 text-sm ml-1">
                                        {expandedClass === cls.id ? '▲' : '▼'}
                                    </span>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedClass === cls.id && (
                                <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4 shadow-inner">
                                    {/* Description */}
                                    {cls.description && (
                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{cls.description}</p>
                                        </div>
                                    )}

                                    {/* Materials */}
                                    <div>
                                        <h5 className="text-sm font-bold text-gray-700 mb-2">📎 Materiales de la Clase</h5>
                                        {(!materials[cls.id] || materials[cls.id].length === 0) ? (
                                            <p className="text-xs text-gray-400">Esta clase aún no tiene materiales adjuntos.</p>
                                        ) : (
                                            <ul className="space-y-2">
                                                {materials[cls.id].map((mat) => (
                                                    <li key={mat.id} className="bg-white p-3 rounded-lg border border-gray-200 text-sm flex items-center justify-between gap-2 hover:shadow-sm transition-shadow">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-gray-800">
                                                                {mat.description || mat.file_name || 'Material sin título'}
                                                            </p>
                                                            {mat.file_name && <p className="text-xs text-gray-400 truncate">📄 {mat.file_name}</p>}
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {mat.file_url && (
                                                                <a
                                                                    href={supabase.storage.from('trabajos').getPublicUrl(mat.file_url).data.publicUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs bg-[#0f4c81] text-white px-3 py-1.5 rounded-lg hover:bg-[#0a355c] transition-colors font-medium flex items-center gap-1"
                                                                >
                                                                    <span>Ver</span> 📄
                                                                </a>
                                                            )}
                                                            {mat.link_url && (
                                                                <a 
                                                                    href={mat.link_url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-1"
                                                                >
                                                                    <span>Abrir</span> 🔗
                                                                </a>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
