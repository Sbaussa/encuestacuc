"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { CheckCircle, ChevronLeft, Send, Loader2, XCircle, FileText, TreePine } from "lucide-react";

interface Option {
  id: string;
  text: string;
  order: number;
}

interface Question {
  id: string;
  text: string;
  type: string;
  order: number;
  options: Option[];
}

interface ConsentSection {
  title: string;
  content: string;
}

interface ConsentInfo {
  asignatura: string;
  programa: string;
  docente: string;
  grupo: string;
  participantes: string;
}

interface ConsentData {
  info: ConsentInfo;
  sections: ConsentSection[];
}

interface Survey {
  id: string;
  title: string;
  description?: string;
  consentText?: string;
  isActive: boolean;
  questions: Question[];
}

type ConsentState = "pending" | "accepted" | "declined";

export default function SurveyPage() {
  const params = useParams();
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [consentState, setConsentState] = useState<ConsentState>("pending");

  useEffect(() => {
    fetch(`/api/surveys/${params.id}`)
      .then((r) => {
        if (!r.ok) { setLoading(false); return; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setSurvey(data);
        if (!data.consentText) setConsentState("accepted");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const requiredQuestions = survey?.questions?.filter((q) => q.type !== "text") ?? []; // incluye text_required y multiple_choice
  const allAnswered = requiredQuestions.every((q) => answers[q.id]);
  const progress = survey?.questions?.length
    ? Math.round((Object.keys(answers).length / survey.questions.length) * 100)
    : 0;

  const handleSubmit = async () => {
    if (!allAnswered || !survey) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyId: survey.id,
          answers: Object.entries(answers).map(([questionId, value]) => {
            const q = survey.questions.find((q) => q.id === questionId);
            return q?.type === "text" || q?.type === "text_required"
              ? { questionId, textAnswer: value }
              : { questionId, optionId: value };
          }),
        }),
      });

      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Hubo un error al enviar. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-slate-500">Encuesta no encontrada</p>
        </div>
      </div>
    );
  }

  // Consent declined
  if (consentState === "declined") {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Participación no registrada</h2>
            <p className="text-slate-500 text-sm mb-8">
              Has decidido no participar en la encuesta. Gracias por tu tiempo.
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Consent form
  if (consentState === "pending" && survey.consentText) {
    let consentData: ConsentData | null = null;
    try {
      consentData = JSON.parse(survey.consentText);
    } catch {
      setConsentState("accepted");
    }

    if (consentData) {
      return (
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <main className="max-w-2xl mx-auto px-4 py-6 pb-36">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-600 rounded-2xl p-6 mb-6 text-white">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Volver
              </button>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Consentimiento informado</p>
                  <h1 className="text-lg font-bold leading-tight">{survey.title}</h1>
                </div>
              </div>
            </div>

            {/* Project info table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4">
              <div className="px-5 py-3 bg-red-50 border-b border-red-100">
                <h2 className="text-sm font-semibold text-red-800 uppercase tracking-wide">Información del proyecto</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {[
                  ["Asignatura", consentData.info.asignatura],
                  ["Programa", consentData.info.programa],
                  ["Docente", consentData.info.docente],
                  ["Grupo", consentData.info.grupo],
                  ["Participantes del estudio", consentData.info.participantes],
                ].map(([label, value]) => (
                  <div key={label} className="px-5 py-3 flex gap-3">
                    <span className="text-xs font-semibold text-slate-500 w-36 flex-shrink-0 pt-0.5">{label}</span>
                    <span className="text-sm text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-3">
              {consentData.sections.map((section) => (
                <div key={section.title} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                  <h3 className="font-semibold text-red-700 text-sm mb-2">{section.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </main>

          {/* Fixed consent buttons */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100">
            <div className="max-w-2xl mx-auto">
              <p className="text-center text-sm font-medium text-slate-600 mb-3">
                ¿Acepta participar voluntariamente en esta encuesta?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConsentState("declined")}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  No acepto
                </button>
                <button
                  onClick={() => setConsentState("accepted")}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-600 text-white font-semibold text-sm shadow-lg shadow-red-200 hover:shadow-red-300 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  Sí acepto
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Submitted
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Gracias por participar!</h2>
            <p className="text-slate-500 mb-8">Tu respuesta ha sido registrada correctamente.</p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Ver más encuestas
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Survey questions
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Survey header */}
        <div className="bg-gradient-to-r from-red-700 to-red-600 rounded-2xl p-6 mb-6 text-white">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="flex items-center gap-2 mb-1">
            <TreePine className="w-4 h-4 text-white/70" />
            <span className="text-white/70 text-xs font-medium uppercase tracking-wide">Isla de calor — CUC</span>
          </div>
          <h1 className="text-xl font-bold leading-tight">{survey.title}</h1>
          {survey.description && (
            <p className="text-white/80 text-xs mt-2 leading-relaxed">{survey.description}</p>
          )}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
              <span>{Object.keys(answers).length} de {survey.questions.length} preguntas</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {survey.questions.map((question, idx) => (
            <div key={question.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-50">
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 transition-colors ${
                    answers[question.id]
                      ? "bg-red-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="pt-0.5">
                    <p className="font-medium text-slate-800 leading-snug">
                      {question.text}
                      {question.type === "text_required" && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {question.type === "text" || question.type === "text_required" ? (
                  <input
                    type="text"
                    value={answers[question.id] ?? ""}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    placeholder={question.type === "text_required" ? "Campo obligatorio..." : "Escribe tu respuesta aquí..."}
                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-colors text-sm ${
                      question.type === "text_required" && !answers[question.id]
                        ? "border-red-200 focus:border-red-400"
                        : "border-slate-200 focus:border-red-400"
                    }`}
                  />
                ) : (
                  <div className="space-y-2">
                    {question.options.map((option) => {
                      const selected = answers[question.id] === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleAnswer(question.id, option.id)}
                          className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 active:scale-98 ${
                            selected
                              ? "border-red-500 bg-red-50 text-red-700"
                              : "border-slate-100 bg-slate-50 text-slate-700 hover:border-red-200 hover:bg-red-50/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-colors ${
                              selected ? "border-red-500 bg-red-500" : "border-slate-300"
                            }`}>
                              {selected && (
                                <div className="w-full h-full rounded-full flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-medium">{option.text}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}
      </main>

      {/* Fixed submit button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-base transition-all ${
              allAnswered && !submitting
                ? "bg-gradient-to-r from-red-600 to-red-600 text-white shadow-lg shadow-red-200 hover:shadow-red-300 active:scale-98"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {submitting ? "Enviando..." : "Enviar respuestas"}
          </button>
        </div>
      </div>
    </div>
  );
}
