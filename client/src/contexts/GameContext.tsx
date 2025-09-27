import { createContext, useContext, useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Game, PlayerColor, BotDifficulty, GameStatus } from "@shared/schema";
import { useAuth } from "./AuthContext";
import { gameService } from "@/services/gameService";
import { botService } from "@/services/botService";
import { useToast } from "@/hooks/use-toast";

interface GameContextType {
  game: Chess;
  gameData: Game | null;
  gameStatus: GameStatus;
  playerColor: PlayerColor;
  gameMode: "multiplayer" | "bot";
  botDifficulty: BotDifficulty;
  isPlayerTurn: boolean;
  gameTimer: number;
  isLoading: boolean;
  createNewGame: (mode: "multiplayer" | "bot", difficulty?: BotDifficulty) => Promise<void>;
  makeMove: (from: string, to: string, promotion?: string) => Promise<boolean>;
  resignGame: () => Promise<void>;
  offerDraw: () => Promise<void>;
  setBotDifficulty: (difficulty: BotDifficulty) => void;
  setGameMode: (mode: "multiplayer" | "bot") => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

interface GameProviderProps {
  children: React.ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [game, setGame] = useState(() => new Chess());
  const [gameData, setGameData] = useState<Game | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const [playerColor, setPlayerColor] = useState<PlayerColor>("white");
  const [gameMode, setGameMode] = useState<"multiplayer" | "bot">("bot");
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>("medium");
  const [gameTimer, setGameTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);

  const isPlayerTurn = gameData && gameStatus === "active" ? 
    (gameData.currentTurn === playerColor)
    : true;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (gameStatus === "active" && gameStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - gameStartTime.getTime()) / 1000);
        setGameTimer(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStatus, gameStartTime]);

  useEffect(() => {
    if (!user || !gameData) return;

    let unsubscribe: (() => void) | null = null;

    unsubscribe = gameService.subscribeToGame(gameData.id, (updatedGame) => {
      setGameData(updatedGame);
      
      // Update chess instance
      const newChess = new Chess();
      try {
        newChess.load(updatedGame.fen);
        setGame(newChess);
      } catch (error) {
        console.error("Failed to load FEN:", error);
      }
      
      setGameStatus(updatedGame.status);
      
      // Set game start time when game becomes active
      if (updatedGame.status === "active" && !gameStartTime) {
        setGameStartTime(new Date());
      }
      
      // Show game end notifications
      if (updatedGame.status === "completed" && gameStatus !== "completed") {
        if (updatedGame.winner === "draw") {
          toast({
            title: "Game Drawn",
            description: "The game ended in a draw.",
          });
        } else {
          const userColor = updatedGame.players.white === user.uid ? "white" : "black";
          const won = updatedGame.winner === userColor;
          toast({
            title: won ? "Victory!" : "Defeat",
            description: won ? "Congratulations, you won!" : "Better luck next time!",
            variant: won ? "default" : "destructive",
          });
        }
      }

      // Handle bot moves
      if (
        gameMode === "bot" &&
        updatedGame.status === "active" &&
        updatedGame.currentTurn !== playerColor
      ) {
        setTimeout(async () => {
          const currentChess = new Chess(updatedGame.fen);
          if (currentChess.isGameOver()) return;
          
          const botMove = botService.getBotMove(currentChess, botDifficulty);
          if (botMove) {
            try {
              await gameService.makeMove(updatedGame.id, botMove, "bot");
            } catch (error) {
              console.error("Bot move failed:", error);
            }
          }
        }, Math.random() * 1000 + 500); // Random delay between 0.5-1.5 seconds
      }
    });

    return unsubscribe;
  }, [user, gameData?.id, gameMode, playerColor, botDifficulty, gameStatus, gameStartTime, toast]);

  const createNewGame = async (mode: "multiplayer" | "bot", difficulty: BotDifficulty = "medium") => {
    if (!user) return;

    setIsLoading(true);
    try {
    setGameMode(mode);
    setBotDifficulty(difficulty);
    setGameTimer(0);
      setGameStartTime(null);
    
    const newGame = new Chess();
    setGame(newGame);

      let createdGame: Game;

      if (mode === "multiplayer") {
        createdGame = await gameService.findOrCreateMultiplayerGame(user.uid);
        const userColor = createdGame.players.white === user.uid ? "white" : "black";
        setPlayerColor(userColor);
      } else {
        const color: PlayerColor = Math.random() > 0.5 ? "white" : "black";
        setPlayerColor(color);

        const players = {
          white: color === "white" ? user.uid : "bot",
          black: color === "black" ? user.uid : "bot",
        };

        createdGame = await gameService.createGame({
          fen: newGame.fen(),
          moves: [],
          players,
          status: "active",
          difficulty: difficulty,
          currentTurn: "white",
          duration: null,
          winner: null,
        });
      }

      setGameData(createdGame);
      setGameStatus(createdGame.status);
      
      if (createdGame.status === "active") {
        setGameStartTime(new Date());
      }
      
      toast({
        title: "New Game Created",
        description: mode === "bot" ? `Playing against ${difficulty} bot` : "Waiting for opponent...",
      });
    } catch (error) {
      console.error("Failed to create game:", error);
      toast({
        title: "Error",
        description: "Failed to create new game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const makeMove = async (from: string, to: string, promotion?: string): Promise<boolean> => {
    if (!user || !gameData || !isPlayerTurn) return false;

    try {
      // Validate move locally first
      const testChess = new Chess(game.fen());
      const move = testChess.move({ from, to, promotion });
      if (!move) {
        toast({
          title: "Invalid Move",
          description: "That move is not allowed.",
          variant: "destructive",
        });
        return false;
      }

      await gameService.makeMove(gameData.id, move, user.uid);
      return true;
    } catch (error) {
      console.error("Move failed:", error);
      toast({
        title: "Move Failed",
        description: "Failed to make move. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const resignGame = async () => {
    if (!user || !gameData) return;

    try {
      const winner = playerColor === "white" ? "black" : "white";
      await gameService.endGame(gameData.id, winner, gameTimer);
      toast({
        title: "Game Resigned",
        description: "You have resigned from the game.",
      });
    } catch (error) {
      console.error("Failed to resign:", error);
      toast({
        title: "Error",
        description: "Failed to resign. Please try again.",
        variant: "destructive",
      });
    }
  };

  const offerDraw = async () => {
    if (!user || !gameData) return;

    try {
      await gameService.endGame(gameData.id, "draw", gameTimer);
      toast({
        title: "Draw Offered",
        description: "The game has been declared a draw.",
      });
    } catch (error) {
      console.error("Failed to offer draw:", error);
      toast({
        title: "Error",
        description: "Failed to offer draw. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value = {
    game,
    gameData,
    gameStatus,
    playerColor,
    gameMode,
    botDifficulty,
    isPlayerTurn,
    gameTimer,
    isLoading,
    createNewGame,
    makeMove,
    resignGame,
    offerDraw,
    setBotDifficulty,
    setGameMode,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
