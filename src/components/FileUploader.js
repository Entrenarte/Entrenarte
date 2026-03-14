'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function FileUploader({ userId, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'link'

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (uploadMode === 'file' && !file) return;
        if (uploadMode === 'link' && !linkUrl.trim()) return;

        setUploading(true);
        setError(null);
        setSuccess(false);

        try {
            let filePath = null;
            let fileType = null;

            // Upload file if mode is file
            if (uploadMode === 'file' && file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${userId}_${Date.now()}.${fileExt}`;
                filePath = `${userId}/${fileName}`;

                const { error: storageError } = await supabase.storage
                    .from('trabajos')
                    .upload(filePath, file);

                if (storageError) throw storageError;

                fileType = file.type || 'unknown';
            }

            // Insert in submissions table
            const { error: insertError } = await supabase
                .from('submissions')
                .insert([{
                    student_id: userId,
                    file_url: filePath,
                    file_type: fileType,
                    link_url: uploadMode === 'link' ? linkUrl.trim() : null,
                    description: description || null,
                }]);

            if (insertError) throw insertError;

            // Reset form
            setFile(null);
            setLinkUrl('');
            setDescription('');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            if (onUploadSuccess) onUploadSuccess();

        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleUpload} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">{error}</div>}
            {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200">✅ ¡Subido correctamente!</div>}

            {/* Mode selector */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${uploadMode === 'file'
                        ? 'bg-[#0f4c81] text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    📎 Archivo
                </button>
                <button
                    type="button"
                    onClick={() => setUploadMode('link')}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors border-l border-gray-200 ${uploadMode === 'link'
                        ? 'bg-[#0f4c81] text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    🔗 Link
                </button>
            </div>

            {/* File input */}
            {uploadMode === 'file' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seleccionar archivo (PDF, Word, imagen, video, audio, etc.)
                    </label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-[#0f4c81]
                            hover:file:bg-blue-100"
                        accept="*/*"
                    />
                    {file && (
                        <p className="mt-1 text-xs text-gray-500">
                            📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                    )}
                </div>
            )}

            {/* Link input */}
            {uploadMode === 'link' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL del enlace (YouTube, Google Drive, sitio web, etc.)
                    </label>
                    <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f4c81] focus:border-[#0f4c81]"
                    />
                </div>
            )}

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej: Trabajo Práctico N°1 - Unidad 2"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f4c81] focus:border-[#0f4c81]"
                    rows="2"
                />
            </div>

            <button
                type="submit"
                disabled={(uploadMode === 'file' && !file) || (uploadMode === 'link' && !linkUrl.trim()) || uploading}
                className="w-full bg-[#0f4c81] text-white py-2.5 px-4 rounded-lg hover:bg-[#0a355c] disabled:opacity-50 transition-colors font-medium text-sm"
            >
                {uploading ? 'Subiendo...' : uploadMode === 'file' ? '📤 Subir Archivo' : '🔗 Compartir Link'}
            </button>
        </form>
    );
}
