import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
  getDoc,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Game, InsertGame, UserStats } from "@shared/schema";
import { Chess, Move } from "chess.js";

class GameService {
  private gamesCollection = collection(db, "games");

  async createGame(gameData: Omit<InsertGame, "createdAt" | "updatedAt">): Promise<Game> {
    const docRef = await addDoc(this.gamesCollection, {
      ...gameData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Get the created document to return with proper timestamps
    const createdDoc = await getDoc(docRef);
    const data = createdDoc.data();
    
    return {
      id: docRef.id,
      ...gameData,
      createdAt: data?.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      updatedAt: data?.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    } as Game;
  }

  async makeMove(gameId: string, move: Move, userId: string): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    
    // Get current game state
    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) {
      throw new Error("Game not found");
    }

    const gameData = gameDoc.data() as Partial<Game>;
    const chess = new Chess();
    
    if (gameData.fen) {
      chess.load(gameData.fen);
    }

    // Make the move
    const moveResult = chess.move(move);
    if (!moveResult) {
      throw new Error("Invalid move");
    }
    
    const updates: Partial<Game> = {
      fen: chess.fen(),
      moves: chess.history(),
      currentTurn: chess.turn() === "w" ? "white" : "black",
      updatedAt: serverTimestamp(),
    };

    // Check for game end
    if (chess.isGameOver()) {
      updates.status = "completed";
      if (chess.isCheckmate()) {
        updates.winner = chess.turn() === "w" ? "black" : "white";
      } else {
        updates.winner = "draw";
      }
    }

    await updateDoc(gameRef, updates);
  }

  async endGame(gameId: string, winner: "white" | "black" | "draw", duration: number): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    await updateDoc(gameRef, {
      status: "completed",
      winner,
      duration,
      updatedAt: serverTimestamp(),
    });
  }

  subscribeToGame(gameId: string, callback: (game: Game) => void): () => void {
    const gameRef = doc(this.gamesCollection, gameId);
    return onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const game: Game = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
        } as Game;
        callback(game);
      }
    });
  }

  async getUserGames(userId: string): Promise<Game[]> {
    // Query for games where user is white player
    const whiteGamesQuery = query(
      this.gamesCollection,
      where("players.white", "==", userId),
      where("status", "==", "completed"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    
    // Query for games where user is black player
    const blackGamesQuery = query(
      this.gamesCollection,
      where("players.black", "==", userId),
      where("status", "==", "completed"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const [whiteGames, blackGames] = await Promise.all([
      getDocs(whiteGamesQuery),
      getDocs(blackGamesQuery)
    ]);

    const gameMap = new Map<string, Game>();
    
    // Process white games
    whiteGames.forEach((doc) => {
      const data = doc.data();
      gameMap.set(doc.id, {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
      } as Game);
    });

    // Process black games (avoid duplicates)
    blackGames.forEach((doc) => {
      const data = doc.data();
      if (!gameMap.has(doc.id)) {
        gameMap.set(doc.id, {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
        } as Game);
      }
    });

    // Convert map to array and sort by creation date
    return Array.from(gameMap.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const games = await this.getUserGames(userId);
    
    const stats = {
      id: userId,
      userId,
      totalGames: games.length,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      updatedAt: new Date(),
    };

    games.forEach((game) => {
      if (game.status === "completed") {
        const userColor = game.players.white === userId ? "white" : "black";
        
        if (game.winner === "draw") {
          stats.draws++;
        } else if (game.winner === userColor) {
          stats.wins++;
        } else {
          stats.losses++;
        }
      }
    });

    stats.winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;
    
    return stats;
  }

  async findOrCreateMultiplayerGame(userId: string): Promise<Game> {
    // Look for waiting multiplayer games
    const waitingGamesQuery = query(
      this.gamesCollection,
      where("status", "==", "waiting"),
      where("difficulty", "==", null),
      limit(1)
    );

    const waitingGames = await getDocs(waitingGamesQuery);
    
    if (!waitingGames.empty) {
      // Join existing game
      const gameDoc = waitingGames.docs[0];
      const gameData = gameDoc.data();
      
      // Assign user to the empty slot
      const updates: Partial<Game> = {
        status: "active",
        updatedAt: serverTimestamp(),
      };
      
      if (gameData.players.white === "waiting") {
        updates.players = { ...gameData.players, white: userId };
      } else if (gameData.players.black === "waiting") {
        updates.players = { ...gameData.players, black: userId };
      }
      
      await updateDoc(doc(this.gamesCollection, gameDoc.id), updates);
      
      return {
        id: gameDoc.id,
        ...gameData,
        ...updates,
        createdAt: gameData.createdAt instanceof Timestamp ? gameData.createdAt.toDate() : new Date(),
        updatedAt: new Date(),
      } as Game;
    } else {
      // Create new waiting game
      const color = Math.random() > 0.5 ? "white" : "black";
      const players = {
        white: color === "white" ? userId : "waiting",
        black: color === "black" ? userId : "waiting",
      };
      
      return this.createGame({
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        moves: [],
        players,
        status: "waiting",
        winner: null,
        duration: null,
        difficulty: null,
        currentTurn: "white",
      });
    }
  }
}

export const gameService = new GameService();
