import { useEffect } from "react";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader as Loader2 } from "lucide-react";
import ChessBoard from "@/components/Chess/ChessBoard";
import PlayerCard from "@/components/PlayerCard";
import MoveHistory from "@/components/MoveHistory";
import GameSettings from "@/components/GameSettings";

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
    isLoading,
    createNewGame,
    resignGame,
    offerDraw,
    game,
  } = useGame();

  const formatGameTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getGameStatusText = () => {
    if (gameStatus === "waiting") {
      return gameMode === "multiplayer" ? "Waiting for opponent..." : "Setting up game...";
    }
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

  const getOpponentName = () => {
    if (gameMode === "bot") return "Chess Bot";
    if (gameStatus === "waiting") return "Waiting...";
    return "Opponent";
  };
  
  const opponentColor = playerColor === "white" ? "black" : "white";

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-6" data-testid="game-page">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Setting up your game...</p>
          </div>
        </div>
      </main>
    );
  }

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
                  className={gameStatus === "active" && isPlayerTurn ? "animate-pulse" : ""}
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

            {/* Chess Board - only show if game exists */}
            {gameData ? (
              <ChessBoard />
            ) : (
              <div className="aspect-square max-w-lg mx-auto bg-muted rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary-foreground font-bold text-3xl">♕</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Ready to Play?</h3>
                  <p className="text-muted-foreground mb-4">Start a new game to begin playing chess</p>
                  <Button
                    onClick={() => createNewGame(gameMode, botDifficulty)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Game...
                      </>
                    ) : (
                      "Start New Game"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Game Actions */}
            {gameData && (
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={resignGame}
                    disabled={gameStatus !== "active" || isLoading}
                    data-testid="button-resign"
                  >
                    Resign
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={offerDraw}
                    disabled={gameStatus !== "active" || isLoading}
                    data-testid="button-draw"
                  >
                    Offer Draw
                  </Button>
                </div>
                
                <Button
                  onClick={() => createNewGame(gameMode, botDifficulty)}
                  size="sm"
                  disabled={isLoading}
                  data-testid="button-new-game"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "New Game"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Game Info & Settings Sidebar */}
        <div className="space-y-6">
          {/* Players Info */}
          {gameData && (
            <div className="bg-card rounded-xl border border-border p-6" data-testid="players-info">
              <h3 className="text-lg font-semibold mb-4">Players</h3>
              
              {/* Opponent */}
              <div className="mb-4">
                <PlayerCard
                  name={getOpponentName()}
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
          )}

          {/* Game Settings */}
          <GameSettings />

          {/* Move History */}
          {gameData && <MoveHistory />}
        </div>
      </div>
    </main>
  );
}
