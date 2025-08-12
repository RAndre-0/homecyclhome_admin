"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { apiService } from "@/services/api-service"

// Table de correspondance des mois anglais -> français
const monthTranslation: { [key: string]: string } = {
  January: "Janvier",
  February: "Février",
  March: "Mars",
  April: "Avril",
  May: "Mai",
  June: "Juin",
  July: "Juillet",
  August: "Août",
  September: "Septembre",
  October: "Octobre",
  November: "Novembre",
  December: "Décembre",
}

const chartConfig: ChartConfig = {
  maintenance: {
    label: "Maintenance",
    color: "hsl(var(--chart-1))",
  },
  reparation: {
    label: "Réparation",
    color: "hsl(var(--chart-2))",
  },
}

type ApiInterventionStats = {
  month: string;
  maintenance?: number | null;
  reparation?: number | null;
};

type InterventionStats = {
  month: string;
  maintenance: number;
  reparation: number;
};


export function InterventionsChart() {
  const [chartData, setChartData] = useState<InterventionStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trend, setTrend] = useState<{ percentage: number, isUp: boolean } | null>(null)

  useEffect(() => {
    const abortController = new AbortController();

    const fetchStats = async () => {
      try {
        setLoading(true);
        const raw = await apiService("interventions/stats", "GET", { signal: abortController.signal });

        // Sécurise le type de la réponse
        const list: ApiInterventionStats[] = Array.isArray(raw) ? raw : [];

        // Transformation des données
        const transformedData: InterventionStats[] = list.map(({ month, maintenance, reparation }) => ({
          month: monthTranslation[month] ?? month,
          maintenance: Number(maintenance ?? 0),
          reparation: Number(reparation ?? 0),
        }));

        // Récupération du mois actuel
        const currentMonthFr = new Date().toLocaleString("fr-FR", { month: "long" });
        const norm = (s: string) => s.normalize("NFKD").toLowerCase();

        // Trouve l'index du mois actuel
        const currentMonthIndex = transformedData.findIndex((it) => norm(it.month) === norm(currentMonthFr));

        // Fait pivoter le tableau pour que le mois actuel soit le dernier
        const rotatedData =
          currentMonthIndex >= 0
            ? [...transformedData.slice(currentMonthIndex + 1), ...transformedData.slice(0, currentMonthIndex + 1)]
            : transformedData;

        setChartData(rotatedData);

        // Tendances (évite division par zéro)
        if (rotatedData.length > 1) {
          const last = rotatedData[rotatedData.length - 2];
          const curr = rotatedData[rotatedData.length - 1];
          const lastTotal = last.maintenance + last.reparation;
          const currTotal = curr.maintenance + curr.reparation;

          if (lastTotal > 0) {
            const pct = ((currTotal - lastTotal) / lastTotal) * 100;
            setTrend({ percentage: Math.abs(pct), isUp: pct > 0 });
          } else {
            // si mois précédent = 0, on indique +100% si >0, sinon 0%
            setTrend({ percentage: lastTotal === currTotal ? 0 : 100, isUp: currTotal > 0 });
          }
        }

        setLoading(false);
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error("Erreur lors de la récupération des stats:", err);
          setError("Impossible de récupérer les données.");
          setLoading(false);
        }
      }
    };

    fetchStats();
    return () => abortController.abort();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chargement des statistiques...</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Chargement en cours...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erreur</CardTitle>
        </CardHeader>
        <CardContent>
          <div>{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interventions - Statistiques par Mois</CardTitle>
        <CardDescription>Nombre d&apos;interventions par type sur les 12 derniers mois</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="maintenance"
              type="monotone"
              stroke={chartConfig.maintenance.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="reparation"
              type="monotone"
              stroke={chartConfig.reparation.color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            {trend && (
              <div className="flex items-center gap-2 font-medium leading-none">
                {trend.isUp ? (
                  <>
                    {trend.percentage.toFixed(2)}% de plus que le mois dernier <TrendingUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    {trend.percentage.toFixed(2)}% de moins que le mois dernier <TrendingDown className="h-4 w-4" />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}