'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ClassManager() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [expandedClass, setExpandedClass] = useState(null);
    const [materials, setMaterials] = useState({});

    // Material form
    const [materialMode, setMaterialMode] = useState('file');
    const [materialFile, setMaterialFile] = useState(null);
    const [materialLink, setMaterialLink] = useState('');
    const [materialDesc, setMaterialDesc] = useState('');
    const [uploadingMaterial, setUploadingMaterial] = useState(false);

    // Edit material
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [editMaterialDesc, setEditMaterialDesc] = useState('');
    const [editMaterialLink, setEditMaterialLink] = useState('');

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

    const handleSaveClass = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        if (editingClass) {
            const { data } = await supabase
                .from('classes')
                .update({ title: title.trim(), description: description.trim(), updated_at: new Date().toISOString() })
                .eq('id', editingClass.id)
                .select()
                .single();

            if (data) setClasses(classes.map(c => c.id === data.id ? data : c));
        } else {
            const { data } = await supabase
                .from('classes')
                .insert([{ title: title.trim(), description: description.trim() }])
                .select()
                .single();

            if (data) setClasses([data, ...classes]);
        }

        resetForm();
    };

    const handleDeleteClass = async (classId) => {
        if (!confirm('¿Estás seguro de eliminar esta clase y todos sus materiales?')) return;

        await supabase.from('classes').delete().eq('id', classId);
        setClasses(classes.filter(c => c.id !== classId));
        if (expandedClass === classId) setExpandedClass(null);
    };

    const handleEditClass = (cls) => {
        setEditingClass(cls);
        setTitle(cls.title);
        setDescription(cls.description || '');
        setShowForm(true);
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setEditingClass(null);
        setShowForm(false);
    };

    const toggleExpand = (classId) => {
        if (expandedClass === classId) {
            setExpandedClass(null);
        } else {
            setExpandedClass(classId);
            if (!materials[classId]) fetchMaterials(classId);
        }
    };

    const handleAddMaterial = async (e, classId) => {
        e.preventDefault();
        setUploadingMaterial(true);

        try {
            let fileUrl = null;
            let fileName = null;

            if (materialMode === 'file' && materialFile) {
                const ext = materialFile.name.split('.').pop();
                const path = `clases/${classId}/${Date.now()}.${ext}`;

                const { error } = await supabase.storage.from('trabajos').upload(path, materialFile);
                if (error) throw error;

                fileUrl = path;
                fileName = materialFile.name;
            }

            const { data } = await supabase
                .from('class_materials')
                .insert([{
                    class_id: classId,
                    file_url: fileUrl,
                    link_url: materialMode === 'link' ? materialLink.trim() : null,
                    file_name: fileName,
                    description: materialDesc.trim() || null,
                }])
                .select()
                .single();

            if (data) {
                setMaterials(prev => ({
                    ...prev,
                    [classId]: [...(prev[classId] || []), data]
                }));
            }

            setMaterialFile(null);
            setMaterialLink('');
            setMaterialDesc('');
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setUploadingMaterial(false);
        }
    };

    const handleDeleteMaterial = async (classId, materialId) => {
        await supabase.from('class_materials').delete().eq('id', materialId);
        setMaterials(prev => ({
            ...prev,
            [classId]: (prev[classId] || []).filter(m => m.id !== materialId)
        }));
    };

    const handleStartEditMaterial = (mat) => {
        setEditingMaterial(mat.id);
        setEditMaterialDesc(mat.description || '');
        setEditMaterialLink(mat.link_url || '');
    };

    const handleSaveEditMaterial = async (classId, mat) => {
        const updates = {
            description: editMaterialDesc.trim() || null,
        };
        if (mat.link_url !== null || editMaterialLink.trim()) {
            updates.link_url = editMaterialLink.trim() || null;
        }

        const { data } = await supabase
            .from('class_materials')
            .update(updates)
            .eq('id', mat.id)
            .select()
            .single();

        if (data) {
            setMaterials(prev => ({
                ...prev,
                [classId]: (prev[classId] || []).map(m => m.id === data.id ? data : m)
            }));
        }
        setEditingMaterial(null);
    };

    if (loading) return <div className="p-6 text-center text-gray-500">Cargando clases...</div>;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#0f4c81]">
                    Mis Clases ({classes.length})
                </h3>
                <button
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                    className="bg-[#0f4c81] text-white px-4 py-2 rounded-lg hover:bg-[#0a355c] transition-colors text-sm font-medium"
                >
                    {showForm ? '✕ Cancelar' : '+ Nueva Clase'}
                </button>
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <form onSubmit={handleSaveClass} className="bg-blue-50 p-5 rounded-lg border border-blue-200 space-y-3">
                    <h4 className="font-bold text-sm text-[#0f4c81]">
                        {editingClass ? '✏️ Editar Clase' : '📚 Nueva Clase'}
                    </h4>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título de la clase (ej: Clase 1 - Introducción al dibujo)"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f4c81] focus:border-[#0f4c81]"
                        required
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descripción, conceptos, contenido de la clase... (podés editarlo después)"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f4c81] focus:border-[#0f4c81]"
                        rows="4"
                    />
                    <button
                        type="submit"
                        className="bg-[#0f4c81] text-white px-6 py-2 rounded-lg hover:bg-[#0a355c] text-sm font-medium"
                    >
                        {editingClass ? 'Guardar Cambios' : 'Crear Clase'}
                    </button>
                </form>
            )}

            {/* Classes List */}
            {classes.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-4xl mb-3">📚</div>
                    <p className="text-gray-500 text-sm">No hay clases creadas todavía.</p>
                    <p className="text-gray-400 text-xs mt-1">Hacé click en &quot;+ Nueva Clase&quot; para crear la primera.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {classes.map((cls) => (
                        <div key={cls.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                                            {materials[cls.id] && ` • ${materials[cls.id].length} material(es)`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => handleEditClass(cls)}
                                        className="text-xs px-3 py-1.5 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-200 transition-colors"
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClass(cls.id)}
                                        className="text-xs px-3 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 transition-colors"
                                    >
                                        🗑️
                                    </button>
                                    <span className="text-gray-400 text-sm ml-1">
                                        {expandedClass === cls.id ? '▲' : '▼'}
                                    </span>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedClass === cls.id && (
                                <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                                    {/* Description */}
                                    {cls.description && (
                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{cls.description}</p>
                                        </div>
                                    )}

                                    {/* Materials */}
                                    <div>
                                        <h5 className="text-sm font-bold text-gray-700 mb-2">📎 Materiales</h5>
                                        {(!materials[cls.id] || materials[cls.id].length === 0) ? (
                                            <p className="text-xs text-gray-400 mb-3">No hay materiales en esta clase.</p>
                                        ) : (
                                            <ul className="space-y-2 mb-3">
                                                {materials[cls.id].map((mat) => (
                                                    <li key={mat.id} className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
                                                        {editingMaterial === mat.id ? (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="text"
                                                                    value={editMaterialDesc}
                                                                    onChange={(e) => setEditMaterialDesc(e.target.value)}
                                                                    placeholder="Descripción"
                                                                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                                                                />
                                                                {mat.link_url !== null && (
                                                                    <input
                                                                        type="url"
                                                                        value={editMaterialLink}
                                                                        onChange={(e) => setEditMaterialLink(e.target.value)}
                                                                        placeholder="URL"
                                                                        className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                                                                    />
                                                                )}
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => handleSaveEditMaterial(cls.id, mat)} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Guardar</button>
                                                                    <button onClick={() => setEditingMaterial(null)} className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300">Cancelar</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="font-medium text-gray-800 truncate">
                                                                        {mat.description || mat.file_name || 'Sin descripción'}
                                                                    </p>
                                                                    {mat.file_name && <p className="text-xs text-gray-400">📄 {mat.file_name}</p>}
                                                                </div>
                                                                <div className="flex items-center gap-1 shrink-0">
                                                                    {mat.file_url && (
                                                                        <a
                                                                            href={supabase.storage.from('trabajos').getPublicUrl(mat.file_url).data.publicUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-xs bg-[#0f4c81] text-white px-2.5 py-1 rounded hover:bg-[#0a355c]"
                                                                        >📄</a>
                                                                    )}
                                                                    {mat.link_url && (
                                                                        <a href={mat.link_url} target="_blank" rel="noopener noreferrer"
                                                                            className="text-xs bg-purple-600 text-white px-2.5 py-1 rounded hover:bg-purple-700"
                                                                        >🔗</a>
                                                                    )}
                                                                    <button onClick={() => handleStartEditMaterial(mat)} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200">✏️</button>
                                                                    <button onClick={() => handleDeleteMaterial(cls.id, mat.id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">🗑️</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {/* Add Material Form */}
                                        <form onSubmit={(e) => handleAddMaterial(e, cls.id)} className="bg-white p-3 rounded-lg border border-dashed border-gray-300 space-y-2">
                                            <div className="flex rounded border border-gray-200 overflow-hidden">
                                                <button type="button" onClick={() => setMaterialMode('file')}
                                                    className={`flex-1 py-1.5 text-xs font-medium ${materialMode === 'file' ? 'bg-[#0f4c81] text-white' : 'bg-white text-gray-600'}`}>
                                                    📎 Archivo
                                                </button>
                                                <button type="button" onClick={() => setMaterialMode('link')}
                                                    className={`flex-1 py-1.5 text-xs font-medium border-l border-gray-200 ${materialMode === 'link' ? 'bg-[#0f4c81] text-white' : 'bg-white text-gray-600'}`}>
                                                    🔗 Link
                                                </button>
                                            </div>

                                            {materialMode === 'file' ? (
                                                <input type="file" onChange={(e) => setMaterialFile(e.target.files?.[0] || null)} accept="*/*"
                                                    className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#0f4c81]"
                                                />
                                            ) : (
                                                <input type="url" value={materialLink} onChange={(e) => setMaterialLink(e.target.value)}
                                                    placeholder="https://..." className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                                                />
                                            )}

                                            <input type="text" value={materialDesc} onChange={(e) => setMaterialDesc(e.target.value)}
                                                placeholder="Descripción del material" className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                                            />

                                            <button type="submit"
                                                disabled={uploadingMaterial || (materialMode === 'file' && !materialFile) || (materialMode === 'link' && !materialLink.trim())}
                                                className="w-full bg-green-600 text-white py-1.5 rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {uploadingMaterial ? 'Subiendo...' : '+ Agregar Material'}
                                            </button>
                                        </form>
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
