'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const CONCEPTUAL_GRADES = {
    A: 'Realizó las actividades propuestas de forma continua y sostenida. Concretó y profundizó la construcción de conocimiento.',
    E: 'Realizó las actividades propuestas. Concretó la construcción de conocimiento.',
    I: 'Realizó las actividades propuestas. Concretó parcialmente la construcción de conocimiento.',
    O: 'Realizó parcial o mínimamente las actividades propuestas. Concretó mínimamente la construcción de conocimiento.',
    U: 'No realizó o realizó mínimamente las actividades propuestas. No concretó la construcción del conocimiento.',
};

export default function GradeForm({ submission, onClose, onSaved, existingGrade }) {
    const [conceptualGrade, setConceptualGrade] = useState(existingGrade?.conceptual_grade || '');
    const [numericGrade, setNumericGrade] = useState(existingGrade?.numeric_grade || '');
    const [comment, setComment] = useState(existingGrade?.comment || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!conceptualGrade || !numericGrade) return;

        setSaving(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            const gradeData = {
                submission_id: submission.id,
                conceptual_grade: conceptualGrade,
                numeric_grade: parseInt(numericGrade),
                comment: comment || null,
                graded_by: session.user.id,
            };

            let result;
            if (existingGrade) {
                result = await supabase
                    .from('grades')
                    .update(gradeData)
                    .eq('id', existingGrade.id)
                    .select()
                    .single();
            } else {
                result = await supabase
                    .from('grades')
                    .insert([gradeData])
                    .select()
                    .single();
            }

            if (result.error) throw result.error;

            // Create notification for the student
            const studentName = submission.profiles
                ? `${submission.profiles.first_name} ${submission.profiles.last_name}`
                : 'Alumno';

            await supabase.from('notifications').insert([{
                user_id: submission.student_id,
                type: 'new_grade',
                title: existingGrade ? 'Calificación actualizada' : 'Nueva calificación',
                body: `Tu entrega "${submission.description || 'Sin descripción'}" fue calificada: ${conceptualGrade} (${numericGrade}/10)`,
                metadata: { submission_id: submission.id, grade_id: result.data.id }
            }]);

            if (onSaved) onSaved(result.data);
            if (onClose) onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const getGradeColor = (grade) => {
        switch (grade) {
            case 'A': return 'border-green-500 bg-green-50 text-green-800';
            case 'E': return 'border-blue-500 bg-blue-50 text-blue-800';
            case 'I': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
            case 'O': return 'border-orange-500 bg-orange-50 text-orange-800';
            case 'U': return 'border-red-500 bg-red-50 text-red-800';
            default: return 'border-gray-300 bg-white text-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-[#0f4c81] text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">{existingGrade ? 'Editar Calificación' : 'Calificar Entrega'}</h3>
                        <p className="text-blue-200 text-sm mt-0.5">
                            {submission.profiles?.last_name}, {submission.profiles?.first_name} — {submission.description || 'Sin descripción'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">{error}</div>
                    )}

                    {/* Conceptual Grade */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Evaluación Conceptual</label>
                        <div className="space-y-2">
                            {Object.entries(CONCEPTUAL_GRADES).map(([letter, desc]) => (
                                <label
                                    key={letter}
                                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${conceptualGrade === letter
                                        ? getGradeColor(letter) + ' shadow-sm'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="conceptual"
                                        value={letter}
                                        checked={conceptualGrade === letter}
                                        onChange={(e) => setConceptualGrade(e.target.value)}
                                        className="mt-1 shrink-0"
                                    />
                                    <div>
                                        <span className="font-bold text-lg">{letter}</span>
                                        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Numeric Grade */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nota Numérica (1-10)</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={numericGrade || 5}
                                onChange={(e) => setNumericGrade(e.target.value)}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0f4c81]"
                            />
                            <span className="text-2xl font-bold text-[#0f4c81] w-10 text-center">
                                {numericGrade || '-'}
                            </span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Comentario (opcional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Observaciones sobre el trabajo..."
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f4c81] focus:border-[#0f4c81] resize-none transition-all"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!conceptualGrade || !numericGrade || saving}
                            className="px-6 py-2 bg-[#0f4c81] text-white rounded-lg hover:bg-[#0a355c] disabled:opacity-50 text-sm font-medium transition-all shadow-sm"
                        >
                            {saving ? 'Guardando...' : existingGrade ? 'Actualizar' : 'Calificar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
