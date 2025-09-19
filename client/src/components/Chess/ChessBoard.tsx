import { Chessboard } from "react-chessboard";
import { useGame } from "@/contexts/GameContext";
import { Square } from "react-chessboard/dist/chessboard/types";

export default function ChessBoard() {
  const { game, makeMove, playerColor, isPlayerTurn, gameStatus } = useGame();

  const onDrop = (sourceSquare: Square, targetSquare: Square, piece: string) => {
    // Only allow moves if it's the player's turn and game is active
    if (!isPlayerTurn || gameStatus !== "active") {
      return false;
    }

    // Check if move is legal
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1].toLowerCase() ?? "q", // Default to queen promotion
    });

    if (move === null) {
      return false; // Illegal move
    }

    // Undo the move from the local game state (it will be updated via Firebase)
    game.undo();

    // Make the move through the game service
    makeMove(sourceSquare, targetSquare, piece[1].toLowerCase() ?? "q");
    
    return true;
  };

  const boardOrientation = playerColor === "white" ? "white" : "black";

  return (
    <div className="relative bg-muted rounded-xl p-4" data-testid="chess-board-container">
      <div className="aspect-square max-w-lg mx-auto">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardOrientation={boardOrientation}
          areCustomPremovesAllowed={false}
          boardWidth={400}
          customBoardStyle={{
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          customDarkSquareStyle={{
            backgroundColor: "hsl(25, 40%, 65%)",
          }}
          customLightSquareStyle={{
            backgroundColor: "hsl(35, 25%, 85%)",
          }}
          customDropSquareStyle={{
            backgroundColor: "hsl(142.1, 76.2%, 36.3%)",
            opacity: 0.6,
          }}
          customSquareStyles={{
            ...(game.isCheck() && {
              [game.turn() === "w" ? "e1" : "e8"]: {
                backgroundColor: "hsl(0, 84.2%, 60.2%)",
                opacity: 0.8,
              },
            }),
          }}
        />
        
        {/* Coordinate Labels */}
        <div className="flex justify-between mt-2 px-2">
          {["a", "b", "c", "d", "e", "f", "g", "h"].map((file) => (
            <span key={file} className="text-xs text-muted-foreground">
              {file}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
