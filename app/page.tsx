import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import SurveyCard from "@/components/SurveyCard";
import { ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const surveys = await prisma.survey.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { responses: true, questions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Encuestas disponibles</h1>
          <p className="text-slate-500 text-sm mt-1">Participa y comparte tu opinión</p>
        </div>

        {surveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="font-semibold text-slate-600 text-lg">No hay encuestas activas</h2>
            <p className="text-slate-400 text-sm mt-1">Vuelve más tarde o pide al admin que cree una</p>
          </div>
        ) : (
          <div className="space-y-3">
            {surveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                id={survey.id}
                title={survey.title}
                description={survey.description}
                isActive={survey.isActive}
                responseCount={survey._count.responses}
                questionCount={survey._count.questions}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
