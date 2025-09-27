import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGame } from "@/contexts/GameContext";
import { BotDifficulty } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function GameSettings() {
  const { 
    gameMode, 
    botDifficulty, 
    setGameMode, 
    setBotDifficulty, 
    createNewGame,
    isLoading,
    gameStatus 
  } = useGame();

  const handleGameModeChange = (value: string) => {
    setGameMode(value as "multiplayer" | "bot");
  };

  const handleDifficultyChange = (value: string) => {
    setBotDifficulty(value as BotDifficulty);
  };

  const handleStartGame = () => {
    createNewGame(gameMode, botDifficulty);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6" data-testid="game-settings">
      <h3 className="text-lg font-semibold mb-4">Game Settings</h3>
      
      <div className="space-y-4">
        {/* Game Type */}
        <div className="flex items-center justify-between">
          <Label htmlFor="game-type" className="text-sm font-medium">
            Game Type
          </Label>
          <Select value={gameMode} onValueChange={handleGameModeChange}>
            <SelectTrigger className="w-32" id="game-type" data-testid="select-game-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bot">vs Bot</SelectItem>
              <SelectItem value="multiplayer">Multiplayer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bot Difficulty - only show when playing against bot */}
        {gameMode === "bot" && (
          <div className="flex items-center justify-between">
            <Label htmlFor="bot-difficulty" className="text-sm font-medium">
              Bot Difficulty
            </Label>
            <Select value={botDifficulty} onValueChange={handleDifficultyChange}>
              <SelectTrigger className="w-32" id="bot-difficulty" data-testid="select-bot-difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Start Game Button */}
        <Button 
          onClick={handleStartGame}
          disabled={isLoading}
          className="w-full"
          data-testid="button-start-game"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Game...
            </>
          ) : (
            `Start ${gameMode === "bot" ? `${botDifficulty} Bot` : "Multiplayer"} Game`
          )}
        </Button>
        
        {gameMode === "multiplayer" && gameStatus === "waiting" && (
          <p className="text-xs text-muted-foreground text-center">
            Searching for an opponent...
          </p>
        )}
      </div>
    </div>
  );
}
