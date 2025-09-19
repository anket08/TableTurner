import { createContext, useContext, useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Game, PlayerColor, BotDifficulty, GameStatus } from "@shared/schema";
import { useAuth } from "./AuthContext";
import { gameService } from "@/services/gameService";
import { botService } from "@/services/botService";

interface GameContextType {
  game: Chess;
  gameData: Game | null;
  gameStatus: GameStatus;
  playerColor: PlayerColor;
  gameMode: "multiplayer" | "bot";
  botDifficulty: BotDifficulty;
  isPlayerTurn: boolean;
  gameTimer: number;
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
  const [game, setGame] = useState(() => new Chess());
  const [gameData, setGameData] = useState<Game | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const [playerColor, setPlayerColor] = useState<PlayerColor>("white");
  const [gameMode, setGameMode] = useState<"multiplayer" | "bot">("bot");
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>("medium");
  const [gameTimer, setGameTimer] = useState(0);

  const isPlayerTurn = gameData ? 
    (gameData.currentTurn === "white" && playerColor === "white") ||
    (gameData.currentTurn === "black" && playerColor === "black")
    : true;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (gameStatus === "active") {
      interval = setInterval(() => {
        setGameTimer(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStatus]);

  useEffect(() => {
    if (!user || !gameData) return;

    const unsubscribe = gameService.subscribeToGame(gameData.id, (updatedGame) => {
      setGameData(updatedGame);
      setGame(new Chess(updatedGame.fen));
      setGameStatus(updatedGame.status);

      // Handle bot moves
      if (
        gameMode === "bot" &&
        updatedGame.status === "active" &&
        updatedGame.currentTurn !== playerColor &&
        !game.isGameOver()
      ) {
        setTimeout(async () => {
          const botMove = botService.getBotMove(game, botDifficulty);
          if (botMove) {
            await gameService.makeMove(updatedGame.id, botMove, user.uid);
          }
        }, 1000);
      }
    });

    return unsubscribe;
  }, [user, gameData?.id, gameMode, playerColor, botDifficulty]);

  const createNewGame = async (mode: "multiplayer" | "bot", difficulty: BotDifficulty = "medium") => {
    if (!user) return;

    setGameMode(mode);
    setBotDifficulty(difficulty);
    setGameTimer(0);
    
    const newGame = new Chess();
    setGame(newGame);

    const color: PlayerColor = Math.random() > 0.5 ? "white" : "black";
    setPlayerColor(color);

    const players = {
      white: color === "white" ? user.uid : "bot",
      black: color === "black" ? user.uid : "bot",
    };

    const gameData = await gameService.createGame({
      fen: newGame.fen(),
      moves: [],
      players,
      status: "active",
      difficulty: mode === "bot" ? difficulty : null,
      currentTurn: "white",
    });

    setGameData(gameData);
    setGameStatus("active");
  };

  const makeMove = async (from: string, to: string, promotion?: string): Promise<boolean> => {
    if (!user || !gameData || !isPlayerTurn) return false;

    try {
      const move = game.move({ from, to, promotion });
      if (!move) return false;

      await gameService.makeMove(gameData.id, move, user.uid);
      return true;
    } catch (error) {
      console.error("Move failed:", error);
      return false;
    }
  };

  const resignGame = async () => {
    if (!user || !gameData) return;

    const winner = playerColor === "white" ? "black" : "white";
    await gameService.endGame(gameData.id, winner, gameTimer);
    setGameStatus("completed");
  };

  const offerDraw = async () => {
    if (!user || !gameData) return;

    await gameService.endGame(gameData.id, "draw", gameTimer);
    setGameStatus("completed");
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
    createNewGame,
    makeMove,
    resignGame,
    offerDraw,
    setBotDifficulty,
    setGameMode,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
