import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: { orderBy: { order: "asc" } },
            answers: { include: { option: true } },
          },
          orderBy: { order: "asc" },
        },
        _count: { select: { responses: true } },
      },
    });

    if (!survey) return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });

    const totalResponses = survey._count.responses;

    const results = survey.questions.map((question) => {
      const isText = question.type === "text" || question.type === "text_required";

      if (isText) {
        const textAnswers = question.answers
          .map((a) => a.textAnswer)
          .filter((t): t is string => !!t && t.trim() !== "");
        return {
          id: question.id,
          text: question.text,
          type: question.type,
          order: question.order,
          totalAnswers: textAnswers.length,
          textAnswers,
          options: [],
          mostVoted: { text: "", count: 0, percentage: 0 },
        };
      }

      const optionCounts: Record<string, { text: string; count: number; percentage: number }> = {};

      question.options.forEach((opt) => {
        optionCounts[opt.id] = { text: opt.text, count: 0, percentage: 0 };
      });

      question.answers.forEach((answer) => {
        if (answer.optionId && optionCounts[answer.optionId]) {
          optionCounts[answer.optionId].count++;
        }
      });

      const totalAnswers = question.answers.length;
      Object.values(optionCounts).forEach((opt) => {
        opt.percentage = totalAnswers > 0 ? Math.round((opt.count / totalAnswers) * 100) : 0;
      });

      const mostVoted = Object.values(optionCounts).reduce(
        (max, curr) => (curr.count > max.count ? curr : max),
        { text: "", count: 0, percentage: 0 }
      );

      return {
        id: question.id,
        text: question.text,
        type: question.type,
        order: question.order,
        totalAnswers,
        textAnswers: [] as string[],
        options: Object.entries(optionCounts).map(([optId, data]) => ({
          id: optId,
          ...data,
        })),
        mostVoted,
      };
    });

    return NextResponse.json({ survey: { id: survey.id, title: survey.title }, totalResponses, results });
  } catch {
    return NextResponse.json({ error: "Error al obtener resultados" }, { status: 500 });
  }
}
