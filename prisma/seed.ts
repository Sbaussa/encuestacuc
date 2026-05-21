import "dotenv/config";
import { prisma } from "../lib/prisma";

const consentText = JSON.stringify({
  info: {
    asignatura: "Gestión de Recursos Naturales",
    programa: "Ingeniería Ambiental - Universidad de la Costa",
    docente: "Dr. Euler Gallego Cartagena",
    grupo: "Maestre y cía",
    participantes:
      "Comunidad universitaria: estudiantes, docentes, personal administrativo y personal de apoyo",
  },
  sections: [
    {
      title: "1. Presentación del proyecto",
      content:
        "Usted ha sido invitado(a) a participar de manera voluntaria en una encuesta académica asociada al proyecto de aula orientado a diagnosticar condiciones térmicas y ambientales del campus de la Universidad de la Costa, con el fin de proponer estrategias de arborización estratégica y soluciones verdes complementarias para mejorar el confort térmico y mitigar el efecto isla de calor en zonas críticas del campus.",
    },
    {
      title: "2. Propósito de la encuesta",
      content:
        "La encuesta busca conocer la percepción de la comunidad universitaria sobre el calor, la disponibilidad de sombra, la cobertura vegetal, el uso de espacios exteriores y las posibles alternativas de mitigación térmica dentro del campus. Esta información será complementada con observaciones de campo, registros fotográficos, mediciones básicas de temperatura y fichas de caracterización espacial.",
    },
    {
      title: "3. Tipo de participación",
      content:
        "Su participación consiste en responder una encuesta breve, de carácter anónimo, que tomará aproximadamente entre 5 y 8 minutos. No se solicitarán nombres, números de identificación, direcciones, historias clínicas ni información sensible. Las preguntas estarán relacionadas con percepción de calor, uso de espacios del campus, presencia de sombra, vegetación y alternativas de mejora ambiental.",
    },
    {
      title: "4. Riesgos y beneficios",
      content:
        "La participación no representa riesgos físicos, académicos, laborales ni personales. Puede existir una incomodidad mínima asociada al tiempo requerido para responder. Como beneficio indirecto, sus respuestas aportarán información útil para identificar zonas críticas de calor y orientar propuestas de manejo ambiental más adecuadas para el campus universitario.",
    },
    {
      title: "5. Confidencialidad y manejo de la información",
      content:
        "La información recolectada será utilizada exclusivamente con fines académicos y de investigación formativa dentro de la asignatura Gestión de Recursos Naturales. Los resultados se analizarán de forma agrupada y no permitirán identificar individualmente a los participantes. Las respuestas serán manejadas por el grupo de estudiantes responsable del proyecto y orientadas por el docente de la asignatura.",
    },
    {
      title: "6. Voluntariedad y derecho a retirarse",
      content:
        "La participación es completamente voluntaria. Usted puede decidir no participar, no responder alguna pregunta o retirarse en cualquier momento sin que esto genere consecuencias académicas, laborales o personales.",
    },
    {
      title: "7. Declaración de consentimiento",
      content:
        "Después de leer la información anterior, declaro que entiendo el propósito de la encuesta, que mi participación es voluntaria y que mis respuestas serán utilizadas únicamente con fines académicos. Al marcar la opción de aceptación, autorizo mi participación en la encuesta.",
    },
  ],
});

async function main() {
  const existingSurvey = await prisma.survey.findFirst({
    where: { title: "Percepción de calor e isla de calor en el campus de la Universidad de la Costa" }
  });

  if (existingSurvey) {
    console.log("✓ La encuesta ya existe en la base de datos. Saltando la creación...");
    return;
  }

  const survey = await prisma.survey.create({
    data: {
      title:
        "Percepción de calor e isla de calor en el campus de la Universidad de la Costa",
      description:
        "Proyecto de aula: Propuesta de manejo ambiental para la mitigación del efecto isla de calor mediante arborización estratégica en el campus de la Universidad de la Costa — Asignatura Gestión de Recursos Naturales",
      consentText,
      isActive: true,
      questions: {
        create: [
          {
            text: "Nombre completo",
            type: "text_required",
            order: 0,
          },
          {
            text: "Correo institucional CUC",
            type: "text_required",
            order: 1,
          },
          {
            text: "Número de teléfono (opcional)",
            type: "text",
            order: 2,
          },
          {
            text: "¿Cuál es su rol en la Universidad de la Costa?",
            order: 3,
            options: {
              create: [
                { text: "Estudiante", order: 0 },
                { text: "Docente", order: 1 },
                { text: "Personal administrativo", order: 2 },
                { text: "Personal de apoyo", order: 3 },
              ],
            },
          },
          {
            text: "¿Con qué frecuencia utiliza los espacios exteriores del campus?",
            order: 4,
            options: {
              create: [
                { text: "Todos los días", order: 0 },
                { text: "Varias veces a la semana", order: 1 },
                { text: "Ocasionalmente", order: 2 },
                { text: "Casi nunca", order: 3 },
              ],
            },
          },
          {
            text: "¿Cómo percibe la temperatura en los espacios exteriores del campus?",
            order: 5,
            options: {
              create: [
                {
                  text: "Muy calurosa e incómoda para permanecer afuera",
                  order: 0,
                },
                { text: "Calurosa pero tolerable", order: 1 },
                { text: "Moderada y aceptable", order: 2 },
                { text: "Fresca y agradable", order: 3 },
              ],
            },
          },
          {
            text: "¿El calor ha influido en su decisión de usar los espacios exteriores del campus?",
            order: 6,
            options: {
              create: [
                {
                  text: "Sí, evito los espacios exteriores por el calor",
                  order: 0,
                },
                {
                  text: "A veces, dependiendo de la hora del día",
                  order: 1,
                },
                { text: "Pocas veces, me adapto al calor", order: 2 },
                {
                  text: "No, el calor no influye en mi uso de los espacios",
                  order: 3,
                },
              ],
            },
          },
          {
            text: "¿Considera que el campus cuenta con suficiente sombra en sus zonas exteriores?",
            order: 7,
            options: {
              create: [
                { text: "Sí, la sombra es suficiente", order: 0 },
                {
                  text: "Regular, hay sombra en algunas zonas pero no en todas",
                  order: 1,
                },
                { text: "No, la sombra es insuficiente", order: 2 },
                { text: "No lo he notado", order: 3 },
              ],
            },
          },
          {
            text: "¿Cómo califica la cobertura vegetal (árboles y plantas) del campus?",
            order: 8,
            options: {
              create: [
                { text: "Muy buena, abundante vegetación", order: 0 },
                { text: "Buena, vegetación suficiente", order: 1 },
                { text: "Regular, poca vegetación", order: 2 },
                { text: "Mala, muy poca o ninguna vegetación", order: 3 },
              ],
            },
          },
          {
            text: "¿En qué zona del campus percibe mayor calor?",
            order: 9,
            options: {
              create: [
                {
                  text: "Parqueaderos y zonas pavimentadas",
                  order: 0,
                },
                { text: "Canchas y zonas deportivas", order: 1 },
                { text: "Corredores entre edificios", order: 2 },
                { text: "Todas las zonas por igual", order: 3 },
              ],
            },
          },
          {
            text: "¿Ha experimentado algún malestar físico (mareo, fatiga, dolor de cabeza) por el calor dentro del campus?",
            order: 10,
            options: {
              create: [
                { text: "Sí, frecuentemente", order: 0 },
                { text: "Sí, algunas veces", order: 1 },
                { text: "Raramente", order: 2 },
                { text: "No, nunca", order: 3 },
              ],
            },
          },
          {
            text: "¿Cuál de las siguientes medidas considera más efectiva para reducir el calor en el campus?",
            order: 11,
            options: {
              create: [
                {
                  text: "Siembra de árboles y arbustos (arborización)",
                  order: 0,
                },
                {
                  text: "Instalación de cubiertas o techos verdes",
                  order: 1,
                },
                {
                  text: "Creación de jardines y zonas verdes",
                  order: 2,
                },
                {
                  text: "Implementación de fuentes o espejos de agua",
                  order: 3,
                },
              ],
            },
          },
          {
            text: "¿Estaría dispuesto(a) a participar en iniciativas de mejora ambiental del campus?",
            order: 12,
            options: {
              create: [
                {
                  text: "Sí, me gustaría participar activamente",
                  order: 0,
                },
                {
                  text: "Sí, pero de forma pasiva (informarme, votar)",
                  order: 1,
                },
                {
                  text: "Tal vez, dependiendo de la iniciativa",
                  order: 2,
                },
                { text: "No tengo tiempo o interés", order: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✓ Encuesta creada: ${survey.title} (id: ${survey.id})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
