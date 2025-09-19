import { Chess, Move } from "chess.js";
import { BotDifficulty } from "@shared/schema";

class BotService {
  getBotMove(chess: Chess, difficulty: BotDifficulty): Move | null {
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    switch (difficulty) {
      case "easy":
        return this.getRandomMove(moves);
      case "medium":
        return this.getMediumMove(chess, moves);
      case "hard":
        return this.getHardMove(chess, moves);
      default:
        return this.getRandomMove(moves);
    }
  }

  private getRandomMove(moves: Move[]): Move {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  private getMediumMove(chess: Chess, moves: Move[]): Move {
    // Prioritize captures and checks, with some randomness
    const captures = moves.filter(move => move.captured);
    const checks = moves.filter(move => {
      const tempChess = new Chess(chess.fen());
      tempChess.move(move);
      return tempChess.isCheck();
    });

    // 60% chance to play capture or check if available
    if ((captures.length > 0 || checks.length > 0) && Math.random() < 0.6) {
      const priorityMoves = [...captures, ...checks];
      return priorityMoves[Math.floor(Math.random() * priorityMoves.length)];
    }

    return this.getRandomMove(moves);
  }

  private getHardMove(chess: Chess, moves: Move[]): Move {
    // More sophisticated move selection
    const scoredMoves = moves.map(move => ({
      move,
      score: this.evaluateMove(chess, move),
    }));

    scoredMoves.sort((a, b) => b.score - a.score);

    // Pick from top 3 moves with some randomness
    const topMoves = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
    const weights = [0.6, 0.3, 0.1];
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < topMoves.length; i++) {
      cumulative += weights[i] || 0.1;
      if (random < cumulative) {
        return topMoves[i].move;
      }
    }

    return topMoves[0].move;
  }

  private evaluateMove(chess: Chess, move: Move): number {
    let score = 0;
    const tempChess = new Chess(chess.fen());
    tempChess.move(move);

    // Capture value
    if (move.captured) {
      const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9 };
      score += (pieceValues[move.captured as keyof typeof pieceValues] || 0) * 10;
    }

    // Check bonus
    if (tempChess.isCheck()) {
      score += 5;
    }

    // Checkmate is highest priority
    if (tempChess.isCheckmate()) {
      score += 1000;
    }

    // Center control
    const centerSquares = ['d4', 'd5', 'e4', 'e5'];
    if (centerSquares.includes(move.to)) {
      score += 2;
    }

    // Piece development (knights and bishops)
    if ((move.piece === 'n' || move.piece === 'b') && 
        ((chess.turn() === 'w' && move.from[1] === '1') || 
         (chess.turn() === 'b' && move.from[1] === '8'))) {
      score += 3;
    }

    // Avoid moving the same piece twice in opening
    if (chess.moveNumber() < 10) {
      const history = chess.history({ verbose: true });
      const recentMoves = history.slice(-4);
      const pieceMovedRecently = recentMoves.some(
        prevMove => prevMove.piece === move.piece && prevMove.from === move.from
      );
      if (pieceMovedRecently) {
        score -= 2;
      }
    }

    return score;
  }
}

export const botService = new BotService();
