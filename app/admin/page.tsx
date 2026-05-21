import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Plus, BarChart2, Edit, Trash2, Users, ClipboardList, ToggleLeft, ToggleRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const surveys = await prisma.survey.findMany({
    include: {
      _count: { select: { responses: true, questions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Panel Admin</h1>
            <p className="text-slate-500 text-sm mt-0.5">{surveys.length} {surveys.length === 1 ? "encuesta" : "encuestas"}</p>
          </div>
          <Link
            href="/admin/create"
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-md shadow-red-600 hover:shadow-red-600 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nueva encuesta
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="w-4 h-4 text-red-600" />
              <span className="text-xs text-slate-500">Total encuestas</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{surveys.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-red-700" />
              <span className="text-xs text-slate-500">Total respuestas</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {surveys.reduce((acc, s) => acc + s._count.responses, 0)}
            </p>
          </div>
        </div>

        {/* Survey list */}
        {surveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="font-semibold text-slate-600 text-lg">Sin encuestas aún</h2>
            <p className="text-slate-400 text-sm mt-1 mb-5">Crea tu primera encuesta</p>
            <Link
              href="/admin/create"
              className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear encuesta
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {surveys.map((survey) => (
              <div key={survey.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {survey.isActive ? (
                        <ToggleRight className="w-4 h-4 text-red-600 flex-shrink-0" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <span className={`text-xs font-medium ${survey.isActive ? "text-red-600" : "text-slate-400"}`}>
                        {survey.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-800 leading-tight">{survey.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <ClipboardList className="w-3.5 h-3.5" />
                    {survey._count.questions} preguntas
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {survey._count.responses} respuestas
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/results/${survey.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    <BarChart2 className="w-4 h-4" />
                    Resultados
                  </Link>
                  <Link
                    href={`/admin/survey/${survey.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </Link>
                  <Link
                    href={`/admin/survey/${survey.id}?delete=true`}
                    className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
