"use client";

import Link from "next/link";
import { ClipboardList, Users, ChevronRight, Circle } from "lucide-react";

interface SurveyCardProps {
  id: string;
  title: string;
  description?: string | null;
  isActive: boolean;
  responseCount: number;
  questionCount: number;
}

export default function SurveyCard({
  id,
  title,
  description,
  isActive,
  responseCount,
  questionCount,
}: SurveyCardProps) {
  return (
    <Link href={`/survey/${id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Circle
                className={`w-2.5 h-2.5 flex-shrink-0 ${isActive ? "fill-emerald-500 text-emerald-500" : "fill-slate-300 text-slate-300"}`}
              />
              <span className={`text-xs font-medium ${isActive ? "text-emerald-600" : "text-slate-400"}`}>
                {isActive ? "Activa" : "Inactiva"}
              </span>
            </div>
            <h3 className="font-semibold text-slate-800 text-base leading-tight truncate">{title}</h3>
            {description && (
              <p className="text-slate-500 text-sm mt-1 line-clamp-2">{description}</p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors flex-shrink-0 mt-0.5" />
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <ClipboardList className="w-4 h-4" />
            <span>{questionCount} {questionCount === 1 ? "pregunta" : "preguntas"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Users className="w-4 h-4" />
            <span>{responseCount} {responseCount === 1 ? "respuesta" : "respuestas"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
