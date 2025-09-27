import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { gameService } from "@/services/gameService";
import { Game } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Circle as XCircle, Minus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameStats from "@/components/GameStats";

export default function HistoryPage() {
  const { user } = useAuth();
  const [opponentFilter, setOpponentFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  const { data: games = [], isLoading } = useQuery({
    queryKey: ["userGames", user?.uid],
    queryFn: () => user ? gameService.getUserGames(user.uid) : [],
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const filteredGames = games.filter((game) => {
    // Opponent type filter
    if (opponentFilter === "bot" && !game.difficulty) return false;
    if (opponentFilter === "human" && game.difficulty) return false;

    // Result filter
    if (resultFilter !== "all") {
      const userColor = game.players.white === user?.uid ? "white" : "black";
      const userWon = game.winner === userColor;
      const isDraw = game.winner === "draw";
      
      if (resultFilter === "win" && !userWon) return false;
      if (resultFilter === "loss" && (userWon || isDraw)) return false;
      if (resultFilter === "draw" && !isDraw) return false;
    }

    // Difficulty filter
    if (difficultyFilter !== "all" && game.difficulty !== difficultyFilter) return false;

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const gameDate = game.createdAt;
      const daysDiff = Math.floor((now.getTime() - gameDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (timeFilter === "week" && daysDiff > 7) return false;
      if (timeFilter === "month" && daysDiff > 30) return false;
      if (timeFilter === "year" && daysDiff > 365) return false;
    }

    return true;
  });

  const getGameResult = (game: Game) => {
    if (!user) return "Unknown";
    
    const userColor = game.players.white === user.uid ? "white" : "black";
    
    if (game.winner === "draw") return "Draw";
    if (game.winner === userColor) return "Victory";
    return "Defeat";
  };

  const getResultIcon = (game: Game) => {
    const result = getGameResult(game);
    
    if (result === "Victory") {
      return <Trophy className="w-5 h-5 text-primary" />;
    }
    if (result === "Defeat") {
      return <XCircle className="w-5 h-5 text-destructive" />;
    }
    return <Minus className="w-5 h-5 text-accent" />;
  };

  const getResultBgColor = (game: Game) => {
    const result = getGameResult(game);
    
    if (result === "Victory") return "bg-primary/10";
    if (result === "Defeat") return "bg-destructive/10";
    return "bg-accent/10";
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Unknown";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getUserColor = (game: Game) => {
    if (!user) return "Unknown";
    return game.players.white === user.uid ? "White" : "Black";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6" data-testid="history-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Game History</h1>
        <p className="text-muted-foreground mt-2">
          Track your chess games and analyze your performance
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Statistics Cards */}
        <div className="lg:col-span-4">
          <GameStats />
        </div>

        {/* Filters */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="opponent-filter" className="text-sm font-medium text-muted-foreground">
                    Opponent Type
                  </Label>
                  <Select value={opponentFilter} onValueChange={setOpponentFilter}>
                    <SelectTrigger className="w-full mt-1" id="opponent-filter" data-testid="select-opponent-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Games</SelectItem>
                      <SelectItem value="bot">vs Bot</SelectItem>
                      <SelectItem value="human">vs Human</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="result-filter" className="text-sm font-medium text-muted-foreground">
                    Result
                  </Label>
                  <Select value={resultFilter} onValueChange={setResultFilter}>
                    <SelectTrigger className="w-full mt-1" id="result-filter" data-testid="select-result-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Results</SelectItem>
                      <SelectItem value="win">Wins Only</SelectItem>
                      <SelectItem value="loss">Losses Only</SelectItem>
                      <SelectItem value="draw">Draws Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty-filter" className="text-sm font-medium text-muted-foreground">
                    Bot Difficulty
                  </Label>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-full mt-1" id="difficulty-filter" data-testid="select-difficulty-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="time-filter" className="text-sm font-medium text-muted-foreground">
                    Time Period
                  </Label>
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-full mt-1" id="time-filter" data-testid="select-time-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Clear Filters */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setOpponentFilter("all");
                    setResultFilter("all");
                    setDifficultyFilter("all");
                    setTimeFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game History List */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold">Game History</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {filteredGames.length} of {games.length} games
                </p>
              </div>
              
              <div className="divide-y divide-border">
                {filteredGames.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {games.length === 0 ? (
                      <div>
                        <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold mb-2">No Games Yet</h3>
                        <p>Start playing to see your game history here!</p>
                      </div>
                    ) : (
                      <div>
                        <p>No games match your current filters.</p>
                        <Button 
                          variant="link" 
                          size="sm"
                          onClick={() => {
                            setOpponentFilter("all");
                            setResultFilter("all");
                            setDifficultyFilter("all");
                            setTimeFilter("all");
                          }}
                        >
                          Clear filters to see all games
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  filteredGames.map((game) => (
                    <div 
                      key={game.id} 
                      className="p-6 hover:bg-muted/50 transition-colors"
                      data-testid={`game-row-${game.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Game Result Icon */}
                          <div className={`w-10 h-10 ${getResultBgColor(game)} rounded-full flex items-center justify-center`}>
                            {getResultIcon(game)}
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium" data-testid={`text-result-${game.id}`}>
                                {getGameResult(game)}
                              </span>
                              <span className="text-muted-foreground">vs</span>
                              <span className="text-sm" data-testid={`text-opponent-${game.id}`}>
                                {game.difficulty ? `Chess Bot (${game.difficulty})` : "Human Player"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                • Played as {getUserColor(game)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                              <span data-testid={`text-moves-${game.id}`}>
                                {game.moves.length} moves
                              </span>
                              <span data-testid={`text-duration-${game.id}`}>
                                {formatDuration(game.duration)}
                              </span>
                              <span data-testid={`text-date-${game.id}`}>
                                {formatDistanceToNow(game.createdAt, { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            data-testid={`button-view-${game.id}`}
                            disabled
                            title="Game analysis coming soon"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {games.length > 0 && (
                <div className="p-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {filteredGames.length === games.length 
                        ? `Showing all ${games.length} games`
                        : `Showing ${filteredGames.length} of ${games.length} games`
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updates automatically
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
