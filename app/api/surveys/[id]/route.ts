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
          include: { options: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
        _count: { select: { responses: true } },
      },
    });
    if (!survey) return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });
    return NextResponse.json(survey);
  } catch {
    return NextResponse.json({ error: "Error al obtener encuesta" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, isActive, questions } = body;

    await prisma.question.deleteMany({ where: { surveyId: id } });

    const survey = await prisma.survey.update({
      where: { id },
      data: {
        title,
        description,
        isActive,
        questions: questions
          ? {
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
            }
          : undefined,
      },
      include: {
        questions: { include: { options: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json(survey);
  } catch {
    return NextResponse.json({ error: "Error al actualizar encuesta" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.survey.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar encuesta" }, { status: 500 });
  }
}
