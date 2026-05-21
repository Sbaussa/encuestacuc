"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Option {
  id: string;
  text: string;
  count: number;
  percentage: number;
}

interface QuestionResult {
  id: string;
  text: string;
  order: number;
  totalAnswers: number;
  options: Option[];
  mostVoted: { text: string; count: number; percentage: number };
}

const COLORS = [
  "#dc2626", "#b91c1c", "#ef4444", "#f59e0b", "#10b981",
  "#3b82f6", "#ef4444", "#14b8a6", "#f97316", "#84cc16",
];

function ProgressBar({ option, index }: { option: Option; index: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-slate-700 flex-1 min-w-0 truncate">{option.text}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-semibold text-slate-800">{option.count}</span>
          <span className="text-xs text-slate-400 w-10 text-right">{option.percentage}%</span>
        </div>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${option.percentage}%`,
            backgroundColor: COLORS[index % COLORS.length],
          }}
        />
      </div>
    </div>
  );
}

export default function ResultsChart({ result }: { result: QuestionResult }) {
  const chartData = result.options.map((opt) => ({
    name: opt.text.length > 20 ? opt.text.slice(0, 20) + "…" : opt.text,
    fullName: opt.text,
    votos: opt.count,
    porcentaje: opt.percentage,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-50">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-sm font-bold flex-shrink-0 mt-0.5">
            {result.order + 1}
          </div>
          <div>
            <p className="font-semibold text-slate-800 leading-snug">{result.text}</p>
            <p className="text-xs text-slate-400 mt-1">{result.totalAnswers} {result.totalAnswers === 1 ? "respuesta" : "respuestas"}</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {result.totalAnswers === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4">Sin respuestas aún</p>
        ) : (
          <>
            {/* Bar Chart */}
            <div className="h-44 mb-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
                            <p className="font-medium text-slate-700 mb-1">{d.fullName}</p>
                            <p className="text-red-600 font-bold">{d.votos} votos ({d.porcentaje}%)</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="votos" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Progress bars */}
            <div className="space-y-3">
              {result.options.map((option, idx) => (
                <ProgressBar key={option.id} option={option} index={idx} />
              ))}
            </div>

            {/* Most voted */}
            {result.mostVoted.count > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs text-red-500 font-medium mb-0.5">Respuesta más votada</p>
                <p className="text-sm font-semibold text-red-700">{result.mostVoted.text}</p>
                <p className="text-xs text-red-400 mt-0.5">{result.mostVoted.count} votos · {result.mostVoted.percentage}%</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
