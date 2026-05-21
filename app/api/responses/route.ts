import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { surveyId, answers } = body;

    if (!surveyId || !answers || answers.length === 0) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const response = await prisma.response.create({
      data: {
        surveyId,
        answers: {
          create: answers.map((a: { questionId: string; optionId?: string; textAnswer?: string }) => ({
            questionId: a.questionId,
            optionId: a.optionId ?? null,
            textAnswer: a.textAnswer ?? null,
          })),
        },
      },
      include: { answers: true },
    });

    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al guardar respuesta" }, { status: 500 });
  }
}
