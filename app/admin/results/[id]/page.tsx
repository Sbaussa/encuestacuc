"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ResultsChart from "@/components/ResultsChart";
import { ChevronLeft, Users, RefreshCw, Loader2, BarChart2, Type } from "lucide-react";

interface QuestionResult {
  id: string;
  text: string;
  type: string;
  order: number;
  totalAnswers: number;
  textAnswers: string[];
  options: { id: string; text: string; count: number; percentage: number }[];
  mostVoted: { text: string; count: number; percentage: number };
}

interface ResultsData {
  survey: { id: string; title: string };
  totalResponses: number;
  results: QuestionResult[];
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchResults = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await fetch(`/api/results/${params.id}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(() => fetchResults(false), 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

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

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-slate-500">No se pudieron cargar los resultados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => router.push("/admin")} className="p-2 rounded-xl hover:bg-slate-200 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-800 truncate">{data.survey.title}</h1>
            <p className="text-slate-500 text-sm">Resultados y estadísticas</p>
          </div>
          <button
            onClick={() => fetchResults(true)}
            className={`p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all ${refreshing ? "animate-spin" : ""}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Summary card */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-5 mb-5 text-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/70 text-xs mb-1">Total respuestas</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{data.totalResponses}</span>
                <Users className="w-5 h-5 text-white/60 mb-1" />
              </div>
            </div>
            <div>
              <p className="text-white/70 text-xs mb-1">Preguntas</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{data.results.length}</span>
                <BarChart2 className="w-5 h-5 text-white/60 mb-1" />
              </div>
            </div>
          </div>
          <p className="text-white/50 text-xs mt-3">Se actualiza automáticamente cada 30 segundos</p>
        </div>

        {/* Results per question */}
        {data.totalResponses === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart2 className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-600 mb-1">Sin respuestas aún</h3>
            <p className="text-slate-400 text-sm">Los resultados aparecerán aquí cuando alguien responda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.results.map((result) => {
              const isText = result.type === "text" || result.type === "text_required";
              if (isText) {
                return (
                  <div key={result.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-50">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Type className="w-3.5 h-3.5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 leading-snug">{result.text}</p>
                          <p className="text-xs text-slate-400 mt-1">{result.totalAnswers} {result.totalAnswers === 1 ? "respuesta" : "respuestas"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      {result.textAnswers.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-2">Sin respuestas aún</p>
                      ) : (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {result.textAnswers.map((answer, idx) => (
                            <div key={idx} className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-700 border border-slate-100">
                              {answer}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return <ResultsChart key={result.id} result={result} />;
            })}
          </div>
        )}
      </main>
    </div>
  );
}
