import { useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, BarChart2, Award } from "lucide-react";

interface Session {
  id: string;
  started_at: string;
  ended_at: string | null;
  summary: string | null;
  score: number | null;
}

interface Props {
  sessions: Session[];
  weakLetters: string[];
  strongLetters: string[];
}

const SCORE_COLOR = (s: number) =>
  s >= 80 ? "#10b981" : s >= 60 ? "#3b82f6" : s >= 40 ? "#f59e0b" : "#ef4444";

export default function TuteurAnalytics({ sessions, weakLetters, strongLetters }: Props) {
  const completed = useMemo(
    () => sessions.filter((s) => s.ended_at && s.score !== null),
    [sessions]
  );

  const scoreSeries = useMemo(
    () =>
      [...completed]
        .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
        .slice(-15)
        .map((s, i) => ({
          session: `S${i + 1}`,
          score: Math.round(Number(s.score)),
          date: new Date(s.started_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        })),
    [completed]
  );

  const distribution = useMemo(() => {
    const brackets = [
      { label: "0–39", min: 0, max: 40, color: "#ef4444" },
      { label: "40–59", min: 40, max: 60, color: "#f59e0b" },
      { label: "60–79", min: 60, max: 80, color: "#3b82f6" },
      { label: "80–100", min: 80, max: 101, color: "#10b981" },
    ];
    return brackets.map((b) => ({
      ...b,
      count: completed.filter((s) => {
        const sc = Number(s.score);
        return sc >= b.min && sc < b.max;
      }).length,
    }));
  }, [completed]);

  const weeklyData = useMemo(() => {
    const weeks: Record<string, number> = {};
    completed.forEach((s) => {
      const d = new Date(s.started_at);
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      const key = monday.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
      weeks[key] = (weeks[key] || 0) + 1;
    });
    return Object.entries(weeks)
      .slice(-8)
      .map(([week, count]) => ({ week, count }));
  }, [completed]);

  const alphabetStats = useMemo(() => {
    const strong = strongLetters.length;
    const weak = weakLetters.length;
    const unevaluated = 28 - strong - weak;
    return [
      { label: "Maîtrisées", value: strong, color: "#10b981", pct: Math.round((strong / 28) * 100) },
      { label: "À renforcer", value: weak, color: "#ef4444", pct: Math.round((weak / 28) * 100) },
      { label: "Non évaluées", value: Math.max(0, unevaluated), color: "#e5e7eb", pct: Math.round((Math.max(0, unevaluated) / 28) * 100) },
    ];
  }, [weakLetters, strongLetters]);

  const avgScore = completed.length
    ? Math.round(completed.reduce((s, c) => s + Number(c.score), 0) / completed.length)
    : 0;

  const trend = useMemo(() => {
    if (scoreSeries.length < 4) return null;
    const half = Math.floor(scoreSeries.length / 2);
    const first = scoreSeries.slice(0, half).reduce((s, c) => s + c.score, 0) / half;
    const last = scoreSeries.slice(-half).reduce((s, c) => s + c.score, 0) / half;
    return last - first;
  }, [scoreSeries]);

  if (completed.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <BarChart2 className="h-10 w-10 text-muted-foreground/30" />
        <p className="font-medium text-foreground/60">Pas encore de données</p>
        <p className="text-sm text-muted-foreground">Terminez votre première session pour voir vos analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: SCORE_COLOR(avgScore) }}>{avgScore}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Score moyen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{completed.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            {trend !== null ? (
              <>
                <p className={`text-2xl font-bold ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {trend >= 0 ? "+" : ""}{Math.round(trend)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Tendance</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-muted-foreground">—</p>
                <p className="text-xs text-muted-foreground mt-0.5">Tendance</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Score trend */}
      {scoreSeries.length >= 2 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Évolution du score
            </p>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={scoreSeries} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: number) => [`${val}/100`, "Score"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle
                        key={payload.session}
                        cx={cx} cy={cy} r={4}
                        fill={SCORE_COLOR(payload.score)}
                        stroke="#fff"
                        strokeWidth={1.5}
                      />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Distribution + rythme */}
      <div className="grid sm:grid-cols-2 gap-4">

        {/* Distribution des scores */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-500" /> Répartition
            </p>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={distribution} margin={{ top: 0, right: 4, bottom: 0, left: -28 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  formatter={(val: number) => [`${val} session${val > 1 ? "s" : ""}`, ""]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distribution.map((d) => (
                    <Cell key={d.label} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rythme hebdomadaire */}
        {weeklyData.length >= 2 && (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-blue-500" /> Sessions / semaine
              </p>
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={weeklyData} margin={{ top: 0, right: 4, bottom: 0, left: -28 }}>
                  <XAxis dataKey="week" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(val: number) => [`${val} session${val > 1 ? "s" : ""}`, ""]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Alphabet breakdown */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-green-600" /> Alphabet — répartition (28 lettres)
          </p>
          <div className="space-y-2.5">
            {alphabetStats.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-semibold" style={{ color: s.color === "#e5e7eb" ? "#9ca3af" : s.color }}>
                    {s.value} / 28
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${s.pct}%`, backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste sessions */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Dernières sessions</p>
        <div className="space-y-2">
          {[...completed]
            .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
            .slice(0, 8)
            .map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">
                  {new Date(s.started_at).toLocaleDateString("fr-FR", { dateStyle: "medium" })}
                </p>
                {s.score !== null && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      color: SCORE_COLOR(Number(s.score)),
                      backgroundColor: SCORE_COLOR(Number(s.score)) + "20",
                    }}
                  >
                    {Math.round(Number(s.score))}/100
                  </span>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
