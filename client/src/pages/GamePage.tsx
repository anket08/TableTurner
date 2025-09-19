import { useEffect } from "react";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ChessBoard from "@/components/Chess/ChessBoard";
import PlayerCard from "@/components/PlayerCard";
import MoveHistory from "@/components/MoveHistory";
import GameSettings from "@/components/GameSettings";
import { formatTime } from "date-fns";

export default function GamePage() {
  const { user } = useAuth();
  const {
    gameData,
    gameStatus,
    playerColor,
    gameMode,
    botDifficulty,
    isPlayerTurn,
    gameTimer,
    createNewGame,
    resignGame,
    offerDraw,
    game,
  } = useGame();

  useEffect(() => {
    // Auto-create a new game if none exists
    if (!gameData && user) {
      createNewGame("bot", "medium");
    }
  }, [gameData, user, createNewGame]);

  const formatGameTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getGameStatusText = () => {
    if (gameStatus === "waiting") return "Setting up game...";
    if (gameStatus === "completed") {
      if (!gameData?.winner) return "Game completed";
      if (gameData.winner === "draw") return "Game drawn";
      const winner = gameData.winner === playerColor ? "You won!" : "You lost";
      return winner;
    }
    if (game.isCheck()) return "Check!";
    if (isPlayerTurn) return "Your turn";
    return "Opponent's turn";
  };

  const getGameStatusVariant = () => {
    if (gameStatus === "completed") {
      if (gameData?.winner === "draw") return "secondary";
      return gameData?.winner === playerColor ? "default" : "destructive";
    }
    if (game.isCheck()) return "destructive";
    return isPlayerTurn ? "default" : "secondary";
  };

  const opponentName = gameMode === "bot" ? "Chess Bot" : "Opponent";
  const opponentColor = playerColor === "white" ? "black" : "white";

  return (
    <main className="container mx-auto px-4 py-6" data-testid="game-page">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Board Section */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border p-6">
            {/* Game Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Badge 
                  variant={getGameStatusVariant() as any}
                  className="animate-pulse"
                  data-testid="badge-game-status"
                >
                  {getGameStatusText()}
                </Badge>
                <div className="text-sm text-muted-foreground" data-testid="text-game-mode">
                  {gameMode === "bot" ? `vs Bot (${botDifficulty})` : "Multiplayer"}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Time</div>
                  <div className="font-mono text-lg font-semibold" data-testid="text-game-timer">
                    {formatGameTimer(gameTimer)}
                  </div>
                </div>
              </div>
            </div>

            {/* Chess Board */}
            <ChessBoard />

            {/* Game Actions */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={resignGame}
                  disabled={gameStatus !== "active"}
                  data-testid="button-resign"
                >
                  Resign
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={offerDraw}
                  disabled={gameStatus !== "active"}
                  data-testid="button-draw"
                >
                  Offer Draw
                </Button>
              </div>
              
              <Button
                onClick={() => createNewGame(gameMode, botDifficulty)}
                size="sm"
                data-testid="button-new-game"
              >
                New Game
              </Button>
            </div>
          </div>
        </div>

        {/* Game Info & Settings Sidebar */}
        <div className="space-y-6">
          {/* Players Info */}
          <div className="bg-card rounded-xl border border-border p-6" data-testid="players-info">
            <h3 className="text-lg font-semibold mb-4">Players</h3>
            
            {/* Opponent */}
            <div className="mb-4">
              <PlayerCard
                name={opponentName}
                isBot={gameMode === "bot"}
                color={opponentColor}
                difficulty={gameMode === "bot" ? botDifficulty : undefined}
                isCurrentPlayer={gameStatus === "active" && !isPlayerTurn}
              />
            </div>

            {/* Current User */}
            <PlayerCard
              name={user?.displayName || "You"}
              avatar={user?.photoURL || undefined}
              color={playerColor}
              isCurrentPlayer={gameStatus === "active" && isPlayerTurn}
            />
          </div>

          {/* Game Settings */}
          <GameSettings />

          {/* Move History */}
          <MoveHistory />
        </div>
      </div>
    </main>
  );
}
