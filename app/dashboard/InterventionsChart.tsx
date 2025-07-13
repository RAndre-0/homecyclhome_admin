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

// Ordre des mois pour le tri
const orderedMonths = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

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

export function InterventionsChart() {
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trend, setTrend] = useState<{ percentage: number, isUp: boolean } | null>(null)

  useEffect(() => {
    const abortController = new AbortController();
  
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiService("interventions/stats", "GET", { signal: abortController.signal });
  
        // Transformation des données
        const transformedData = data.map((item: any) => ({
          month: monthTranslation[item.month] || item.month, // Traduction en français
          maintenance: item.maintenance || 0,
          reparation: item.reparation || 0,
        }));
  
        // Récupération du mois actuel pour trier correctement
        const currentMonth = new Date().toLocaleString("fr-FR", { month: "long" }); // Ex: "février"
  
        // Trouve l'index du mois actuel
        const currentMonthIndex = transformedData.findIndex((item: { month: string }) => item.month === currentMonth);
  
        // Fait pivoter le tableau pour que le mois actuel soit le dernier
        const rotatedData = [
          ...transformedData.slice(currentMonthIndex + 1),
          ...transformedData.slice(0, currentMonthIndex + 1)
        ];
  
        setChartData(rotatedData);

        if (rotatedData.length > 1) {
          const lastMonthData = rotatedData[rotatedData.length - 2];
          const currentMonthData = rotatedData[rotatedData.length - 1];
          const lastMonthTotal = lastMonthData.maintenance + lastMonthData.reparation;
          const currentMonthTotal = currentMonthData.maintenance + currentMonthData.reparation;
          const percentageChange = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
          setTrend({
            percentage: Math.abs(percentageChange),
            isUp: percentageChange > 0
          });
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
        <CardDescription>Nombre d'interventions par type sur les 12 derniers mois</CardDescription>
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