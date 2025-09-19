import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { gameService } from "@/services/gameService";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Trophy, XCircle, TrendingUp } from "lucide-react";

export default function GameStats() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["userStats", user?.uid],
    queryFn: () => user ? gameService.getUserStats(user.uid) : null,
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: "Total Games",
      value: stats.totalGames,
      icon: BarChart3,
      color: "text-primary",
      bgColor: "bg-primary/10",
      testId: "stat-total-games"
    },
    {
      title: "Wins",
      value: stats.wins,
      icon: Trophy,
      color: "text-primary",
      bgColor: "bg-primary/10",
      testId: "stat-wins"
    },
    {
      title: "Losses",
      value: stats.losses,
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      testId: "stat-losses"
    },
    {
      title: "Win Rate",
      value: `${stats.winRate}%`,
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
      testId: "stat-win-rate"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" data-testid="game-stats">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p 
                  className="text-2xl font-bold" 
                  data-testid={stat.testId}
                >
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
