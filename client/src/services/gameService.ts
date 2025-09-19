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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Game, InsertGame, UserStats } from "@shared/schema";
import { Chess, Move } from "chess.js";

class GameService {
  private gamesCollection = collection(db, "games");
  private statsCollection = collection(db, "userStats");

  async createGame(gameData: Omit<InsertGame, "createdAt" | "updatedAt">): Promise<Game> {
    const docRef = await addDoc(this.gamesCollection, {
      ...gameData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...gameData,
      createdAt: new Date(),
      updatedAt: new Date(),
      winner: null,
      duration: null,
    } as Game;
  }

  async makeMove(gameId: string, move: Move, userId: string): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    const chess = new Chess();
    
    // Get current game state
    const gameDoc = await getDocs(query(this.gamesCollection, where("__name__", "==", gameId)));
    if (!gameDoc.empty) {
      const gameData = gameDoc.docs[0].data() as Partial<Game>;
      if (gameData.fen) {
        chess.load(gameData.fen);
      }
    }

    // Make the move
    chess.move(move);
    
    const updates: Partial<Game> = {
      fen: chess.fen(),
      moves: chess.history(),
      currentTurn: chess.turn() === "w" ? "white" : "black",
      updatedAt: new Date(),
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
    const q = query(
      this.gamesCollection,
      where("players.white", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const q2 = query(
      this.gamesCollection,
      where("players.black", "==", userId),
      orderBy("createdAt", "desc")
    );

    const [whiteGames, blackGames] = await Promise.all([
      getDocs(q),
      getDocs(q2)
    ]);

    const games: Game[] = [];
    
    whiteGames.forEach((doc) => {
      const data = doc.data();
      games.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
      } as Game);
    });

    blackGames.forEach((doc) => {
      const data = doc.data();
      const gameId = doc.id;
      if (!games.find(g => g.id === gameId)) {
        games.push({
          id: gameId,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
        } as Game);
      }
    });

    return games.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
      if (game.status === "completed" && game.winner) {
        const userColor = game.players.white === userId ? "white" : "black";
        
        if (game.winner === userColor) {
          stats.wins++;
        } else if (game.winner === "draw") {
          stats.draws++;
        } else {
          stats.losses++;
        }
      }
    });

    stats.winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;
    
    return stats;
  }
}

export const gameService = new GameService();
