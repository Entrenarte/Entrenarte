'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function FileUploader({ studentId, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            // 1. Subir el archivo al Storage 'trabajos'
            const fileExt = file.name.split('.').pop();
            const fileName = `${studentId}_${Date.now()}.${fileExt}`;
            const filePath = `${studentId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('trabajos')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Obtener la URL pública (aunque esté protegida por RLS en la base, nos sirve para descargar)
            const { data: { publicUrl } } = supabase.storage
                .from('trabajos')
                .getPublicUrl(filePath);

            // 2. Insertar registro en la tabla 'submissions'
            const { error: insertError } = await supabase
                .from('submissions')
                .insert([
                    {
                        student_id: studentId,
                        file_url: filePath, // Guardamos la ruta interna para poder descargarlo mejor después
                        file_type: file.type || 'unknown',
                        description: description,
                    }
                ]);

            if (insertError) {
                throw insertError;
            }

            setFile(null);
            setDescription('');
            if (onUploadSuccess) onUploadSuccess();

        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleUpload} className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div>
                <label className="block text-sm font-medium text-gray-700">Seleccionar Archivo (PDF, Word, Imagen, Video)</label>
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-green-50 file:text-green-700
            hover:file:bg-green-100"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej: Trabajo Práctico N°1 - Unidad 2"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                    rows="2"
                />
            </div>

            <button
                type="submit"
                disabled={!file || uploading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
                {uploading ? 'Subiendo...' : 'Subir Trabajo'}
            </button>
        </form>
    );
}
