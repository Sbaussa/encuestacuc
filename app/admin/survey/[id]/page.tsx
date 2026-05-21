"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Plus, Trash2, ChevronLeft, Save, Loader2, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";

interface OptionDraft {
  id: string;
  text: string;
}

interface QuestionDraft {
  id: string;
  text: string;
  options: OptionDraft[];
}

const uid = () => Math.random().toString(36).slice(2);

export default function EditSurveyPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchSurvey = useCallback(async () => {
    try {
      const res = await fetch(`/api/surveys/${params.id}`);
      const data = await res.json();
      setTitle(data.title);
      setDescription(data.description || "");
      setIsActive(data.isActive);
      setQuestions(
        data.questions.map((q: { id: string; text: string; options: { id: string; text: string }[] }) => ({
          id: q.id,
          text: q.text,
          options: q.options.map((o) => ({ id: o.id, text: o.text })),
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchSurvey();
    if (searchParams.get("delete") === "true") setShowDeleteModal(true);
  }, [fetchSurvey, searchParams]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: uid(), text: "", options: [{ id: uid(), text: "" }, { id: uid(), text: "" }] },
    ]);
  };

  const removeQuestion = (qid: string) =>
    setQuestions((prev) => prev.filter((q) => q.id !== qid));

  const updateQuestion = (qid: string, text: string) =>
    setQuestions((prev) => prev.map((q) => (q.id === qid ? { ...q, text } : q)));

  const addOption = (qid: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid ? { ...q, options: [...q.options, { id: uid(), text: "" }] } : q
      )
    );

  const removeOption = (qid: string, oid: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid ? { ...q, options: q.options.filter((o) => o.id !== oid) } : q
      )
    );

  const updateOption = (qid: string, oid: string, text: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid
          ? { ...q, options: q.options.map((o) => (o.id === oid ? { ...o, text } : o)) }
          : q
      )
    );

  const validate = () => {
    const errs: string[] = [];
    if (!title.trim()) errs.push("El título es requerido");
    questions.forEach((q, i) => {
      if (!q.text.trim()) errs.push(`Pregunta ${i + 1}: falta el texto`);
      if (q.options.length < 2) errs.push(`Pregunta ${i + 1}: necesita al menos 2 opciones`);
      q.options.forEach((o, j) => {
        if (!o.text.trim()) errs.push(`Pregunta ${i + 1}, opción ${j + 1}: falta el texto`);
      });
    });
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    setSaving(true);
    try {
      const res = await fetch(`/api/surveys/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          isActive,
          questions: questions.map((q) => ({
            text: q.text.trim(),
            options: q.options.map((o) => ({ text: o.text.trim() })),
          })),
        }),
      });
      if (!res.ok) throw new Error();
      router.push("/admin");
    } catch {
      setErrors(["Error al guardar. Inténtalo de nuevo."]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/surveys/${params.id}`, { method: "DELETE" });
      router.push("/admin");
    } catch {
      setErrors(["Error al eliminar."]);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push("/admin")} className="p-2 rounded-xl hover:bg-slate-200 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">Editar encuesta</h1>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {errors.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm font-medium text-red-600">Corrige los errores:</p>
            </div>
            <ul className="space-y-1">
              {errors.map((e, i) => <li key={i} className="text-sm text-red-500">· {e}</li>)}
            </ul>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5">
          <h2 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide">Información general</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1.5 block">Título <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-red-600 focus:bg-white transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1.5 block">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-red-600 focus:bg-white transition-colors text-sm resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">Estado</label>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all w-full ${
                  isActive ? "border-red-600 bg-red-600" : "border-slate-200 bg-slate-50"
                }`}
              >
                {isActive ? (
                  <ToggleRight className="w-5 h-5 text-red-600" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-slate-400" />
                )}
                <span className={`text-sm font-medium ${isActive ? "text-red-600" : "text-slate-500"}`}>
                  {isActive ? "Encuesta activa" : "Encuesta inactiva"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-4">
          {questions.map((question, qIdx) => (
            <div key={question.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-500 flex-1">Pregunta {qIdx + 1}</span>
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(question.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="p-5 space-y-4">
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, e.target.value)}
                  placeholder="Texto de la pregunta..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white transition-colors text-sm"
                />
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2.5">Opciones</p>
                  <div className="space-y-2">
                    {question.options.map((option, oIdx) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex-shrink-0" />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                          placeholder={`Opción ${oIdx + 1}`}
                          className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white transition-colors text-sm"
                        />
                        {question.options.length > 2 && (
                          <button onClick={() => removeOption(question.id, option.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => addOption(question.id)} className="mt-2.5 flex items-center gap-1.5 text-red-600 hover:text-red-600 text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> Agregar opción
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addQuestion}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-red-600 text-red-600 hover:border-red-600 hover:bg-red-50 transition-all font-medium text-sm"
        >
          <Plus className="w-5 h-5" /> Agregar pregunta
        </button>
      </main>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">¿Eliminar encuesta?</h3>
            <p className="text-slate-500 text-sm text-center mb-6">Esta acción es irreversible. Se eliminarán todas las preguntas y respuestas.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed save button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600 transition-all active:scale-98 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
