import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const surveys = await prisma.survey.findMany({
      include: {
        questions: {
          include: { options: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(surveys);
  } catch {
    return NextResponse.json({ error: "Error al obtener encuestas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, questions } = body;

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json({ error: "Título y preguntas son requeridos" }, { status: 400 });
    }

    const survey = await prisma.survey.create({
      data: {
        title,
        description,
        questions: {
          create: questions.map(
            (q: { text: string; options: { text: string }[] }, idx: number) => ({
              text: q.text,
              order: idx,
              options: {
                create: q.options.map((o: { text: string }, oidx: number) => ({
                  text: o.text,
                  order: oidx,
                })),
              },
            })
          ),
        },
      },
      include: {
        questions: { include: { options: true } },
      },
    });

    return NextResponse.json(survey, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear encuesta" }, { status: 500 });
  }
}
